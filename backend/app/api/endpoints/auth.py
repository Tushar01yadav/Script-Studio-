import datetime
import uuid
import httpx
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.models.user import User, PasswordReset
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, PasswordResetRequest, PasswordResetConfirm, EmailVerificationRequest
from app.services.email import send_verification_email, send_password_reset_email

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    
    # Generate verification token
    verification_token = str(uuid.uuid4())
    
    db_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        is_verified=False,
        verification_token=verification_token
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send verification email asynchronously
    try:
        await send_verification_email(db_user.email, db_user.name, verification_token)
    except Exception:
        # Don't fail the registration if email fails (useful for local development without SMTP credentials)
        pass
        
    return db_user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    # Generates Access and Refresh Tokens
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/verify-email")
def verify_email(payload: EmailVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == payload.token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token."
        )
    
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified successfully."}

@router.post("/forgot-password")
async def forgot_password(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Do not expose user existence but return success
        return {"message": "If the email exists, a password reset link has been sent."}
    
    # Create reset token
    token = str(uuid.uuid4())
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    
    reset_entry = PasswordReset(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.add(reset_entry)
    db.commit()
    
    try:
        await send_password_reset_email(user.email, user.name, token)
    except Exception:
        pass
        
    return {"message": "If the email exists, a password reset link has been sent."}

@router.post("/reset-password")
def reset_password(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    reset_entry = db.query(PasswordReset).filter(PasswordReset.token == payload.token).first()
    if not reset_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )
    
    if reset_entry.expires_at < datetime.datetime.utcnow():
        db.delete(reset_entry)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired."
        )
    
    user = db.query(User).filter(User.id == reset_entry.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
        
    user.password_hash = get_password_hash(payload.new_password)
    db.delete(reset_entry)
    db.commit()
    
    return {"message": "Password has been reset successfully."}

@router.post("/refresh-token", response_model=Token)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

class GoogleLoginRequest(BaseModel):
    credential: str

@router.post("/google-login")
async def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.credential}"
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Google credential"
                )
            token_info = response.json()
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to verify Google token: {str(e)}"
        )

    email = token_info.get("email")
    name = token_info.get("name") or token_info.get("given_name") or "Google User"

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not provided by Google account"
        )

    # Check if user exists
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Create a new user with is_approved=False
        user = User(
            name=name,
            email=email,
            password_hash=get_password_hash(str(uuid.uuid4())),
            is_verified=True,
            is_approved=False,
            verification_token=None
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access request submitted. Please wait for admin approval."
        )

    if not user.is_approved and user.email != "admin@scriptstudio.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your access request is pending approval."
        )

    # Generate tokens
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

from app.api.deps import get_current_user

@router.get("/admin/requests")
def get_pending_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.email != "admin@scriptstudio.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can access this resource"
        )
    
    pending_users = db.query(User).filter(User.is_approved == False).all()
    return pending_users

@router.post("/admin/requests/{user_id}/approve")
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.email != "admin@scriptstudio.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can access this resource"
        )
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    user.is_approved = True
    db.commit()
    return {"message": f"User {user.email} approved successfully"}

@router.post("/admin/requests/{user_id}/reject")
def reject_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.email != "admin@scriptstudio.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can access this resource"
        )
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    db.delete(user)
    db.commit()
    return {"message": f"User {user.email} rejected/removed successfully"}
