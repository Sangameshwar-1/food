import smtplib
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://donate-blood-recieve.netlify.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/alert")
async def alert():
    # Replace with your credentials
    sender_email = "salesangameshwar1@gmail.com"
    app_password = "your-app-password"  # Replace with your actual App Password
    receiver_email = "receiver@example.com"  # Replace with actual recipient email

    subject = "Test Email from Python"
    body = "Hello, this is a test email sent using Python with an App Password."

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = receiver_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        # Connect to Gmail SMTP server
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, app_password)

        # Send email
        server.sendmail(sender_email, receiver_email, msg.as_string())
        server.quit()
        return {"message": f"Email sent to {receiver_email}"}

    except Exception as e:
        return {"error": f"Failed to send email. Error: {e}"}
