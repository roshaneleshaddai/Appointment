from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from enum import Enum


class Mode(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"


class AppointmentStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


# ---------- Auth ----------
class PatientRegister(BaseModel):
    name: str
    contact: str
    dob: str  # ISO date string e.g. "1995-06-15"
    email: str
    password: str


class DoctorRegister(BaseModel):
    name: str
    specialty: str
    mode: Mode
    fee: float
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str  # "patient" | "doctor" | "admin"


# ---------- Schedule ----------
class ScheduleCreate(BaseModel):
    doctor_id: str
    date: str        # "YYYY-MM-DD"
    start_time: str  # "09:00"
    end_time: str    # "17:00"
    slot_minutes: int = 30


# ---------- Appointment ----------
class AppointmentBook(BaseModel):
    patient_id: str
    doctor_id: str
    schedule_id: str
    link_or_address: Optional[str] = None


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus


# ---------- Doctor Filters ----------
class DoctorQuery(BaseModel):
    mode: Optional[str] = None
    specialty: Optional[str] = None
