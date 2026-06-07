from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.project import Project
from app.core.security import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        # Check if the user already exists
        admin_email = "admin@scriptstudio.com"
        existing = db.query(User).filter(User.email == admin_email).first()
        if existing:
            print(f"User with email {admin_email} already exists.")
            return

        admin_user = User(
            name="Admin User",
            email=admin_email,
            password_hash=get_password_hash("AdminPassword123"),
            is_verified=True,
            verification_token=None
        )
        db.add(admin_user)
        db.commit()
        print(f"Successfully created admin user!")
        print(f"Email: {admin_email}")
        print(f"Password: AdminPassword123")
    except Exception as e:
        print(f"Error seeding user: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
