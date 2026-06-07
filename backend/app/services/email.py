import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def send_email(to_email: str, subject: str, html_content: str):
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
        logger.warning("SMTP configuration is missing. Cannot send email to %s", to_email)
        # For development/debugging, log the details so the user can easily copy tokens
        logger.info("Email would have been sent to %s:\nSubject: %s\nContent: %s", to_email, subject, html_content)
        return

    message = MIMEMultipart("alternative")
    message["From"] = settings.SMTP_EMAIL
    message["To"] = to_email
    message["Subject"] = subject

    html_part = MIMEText(html_content, "html")
    message.attach(html_part)

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_SERVER,
            port=settings.SMTP_PORT,
            username=settings.SMTP_EMAIL,
            password=settings.SMTP_PASSWORD,
            use_tls=False,
            start_tls=True
        )
        logger.info("Successfully sent email to %s", to_email)
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, str(e))
        raise e

async def send_verification_email(to_email: str, name: str, token: str, host: str = "localhost:5173"):
    # Link pointing to the frontend verification route
    verify_link = f"http://{host}/verify-email?token={token}"
    subject = "Verify Your YouTube Script Studio Account"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #111; color: #eee; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #222; padding: 30px; border-radius: 8px; border: 1px solid #333;">
                <h2 style="color: #ff0055;">YouTube Script Studio</h2>
                <p>Hello {name},</p>
                <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
                <p style="margin: 30px 0;">
                    <a href="{verify_link}" style="background-color: #ff0055; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #999;">{verify_link}</p>
                <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">If you did not request this, please ignore this email.</p>
            </div>
        </body>
    </html>
    """
    await send_email(to_email, subject, html_content)

async def send_password_reset_email(to_email: str, name: str, token: str, host: str = "localhost:5173"):
    reset_link = f"http://{host}/reset-password?token={token}"
    subject = "Reset Your YouTube Script Studio Password"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #111; color: #eee; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #222; padding: 30px; border-radius: 8px; border: 1px solid #333;">
                <h2 style="color: #ff0055;">YouTube Script Studio</h2>
                <p>Hello {name},</p>
                <p>We received a request to reset your password. Click the button below to set a new password:</p>
                <p style="margin: 30px 0;">
                    <a href="{reset_link}" style="background-color: #ff0055; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #999;">{reset_link}</p>
                <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">This link will expire soon. If you did not request a password reset, you can safely ignore this email.</p>
            </div>
        </body>
    </html>
    """
    await send_email(to_email, subject, html_content)
