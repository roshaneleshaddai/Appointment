import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import asyncio
from concurrent.futures import ThreadPoolExecutor

EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASS = os.getenv("EMAIL_PASS", "")

_executor = ThreadPoolExecutor(max_workers=4)


def _send_sync(to: str, subject: str, html_body: str):
    """Blocking send — runs in a thread pool so it never blocks the event loop."""
    if not EMAIL_USER or not EMAIL_PASS:
        print(f"[EMAIL] Skipped — EMAIL_USER/EMAIL_PASS not configured (to={to})")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"MediCare <{EMAIL_USER}>"
    msg["To"] = to
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, to, msg.as_string())
        print(f"[EMAIL] Sent '{subject}' → {to}")
    except Exception as exc:
        print(f"[EMAIL] Failed to send to {to}: {exc}")


async def send_email(to: str, subject: str, html_body: str):
    """Fire-and-forget async wrapper — awaitable but non-blocking."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(_executor, _send_sync, to, subject, html_body)


# ── Email Templates ──────────────────────────────────────────────────────────

def appointment_patient_email(doctor_name: str, specialty: str, date: str,
                               time_slot: str, mode: str, fee: float) -> str:
    mode_label = "Online Video Consultation" if mode == "ONLINE" else "In-Clinic Visit"
    return f"""
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px;">
      <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <div style="background:#2563EB;padding:28px 32px;">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">✅ Appointment Confirmed</h1>
          <p style="color:#BFDBFE;margin:8px 0 0;font-size:14px;">Your MediCare booking is confirmed</p>
        </div>
        <div style="padding:32px;">
          <p style="font-size:15px;color:#374151;margin:0 0 24px;">Your appointment has been successfully booked. Here are the details:</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;width:40%;">Doctor</td><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-weight:600;color:#111827;font-size:14px;">Dr. {doctor_name} — {specialty}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;">Date</td><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-weight:600;color:#111827;font-size:14px;">{date}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;">Time</td><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-weight:600;color:#111827;font-size:14px;">{time_slot}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;">Mode</td><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-weight:600;color:#111827;font-size:14px;">{mode_label}</td></tr>
            <tr><td style="padding:10px 0;color:#6B7280;font-size:13px;">Consultation Fee</td><td style="padding:10px 0;font-weight:700;color:#2563EB;font-size:15px;">${fee}</td></tr>
          </table>
          <div style="margin-top:28px;background:#EFF6FF;border-radius:12px;padding:16px 20px;">
            <p style="margin:0;color:#1D4ED8;font-size:13px;font-weight:500;">Please arrive 10 minutes early for an in-clinic visit, or ensure a stable internet connection for a video consultation.</p>
          </div>
        </div>
        <div style="padding:20px 32px;background:#F9FAFB;border-top:1px solid #F3F4F6;text-align:center;">
          <p style="margin:0;color:#9CA3AF;font-size:12px;">MediCare — Connecting Patients & Doctors · This is an automated message, please do not reply.</p>
        </div>
      </div>
    </div>
    """


def appointment_doctor_email(patient_name: str, date: str,
                              time_slot: str, mode: str) -> str:
    mode_label = "Online Video Consultation" if mode == "ONLINE" else "In-Clinic Visit"
    return f"""
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px;">
      <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <div style="background:#059669;padding:28px 32px;">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">📅 New Appointment Booked</h1>
          <p style="color:#A7F3D0;margin:8px 0 0;font-size:14px;">A patient has scheduled a consultation with you</p>
        </div>
        <div style="padding:32px;">
          <p style="font-size:15px;color:#374151;margin:0 0 24px;">You have a new appointment in your calendar. Details below:</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;width:40%;">Patient</td><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-weight:600;color:#111827;font-size:14px;">{patient_name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;">Date</td><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-weight:600;color:#111827;font-size:14px;">{date}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;">Time</td><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-weight:600;color:#111827;font-size:14px;">{time_slot}</td></tr>
            <tr><td style="padding:10px 0;color:#6B7280;font-size:13px;">Mode</td><td style="padding:10px 0;font-weight:600;color:#111827;font-size:14px;">{mode_label}</td></tr>
          </table>
          <div style="margin-top:28px;background:#ECFDF5;border-radius:12px;padding:16px 20px;">
            <p style="margin:0;color:#065F46;font-size:13px;font-weight:500;">Log in to MediCare to view full patient details and manage this appointment.</p>
          </div>
        </div>
        <div style="padding:20px 32px;background:#F9FAFB;border-top:1px solid #F3F4F6;text-align:center;">
          <p style="margin:0;color:#9CA3AF;font-size:12px;">MediCare — Connecting Patients & Doctors · This is an automated message, please do not reply.</p>
        </div>
      </div>
    </div>
    """
