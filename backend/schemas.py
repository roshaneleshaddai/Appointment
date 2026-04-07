from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- BASE USER ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = Field(..., description="PATIENT, DOCTOR, or ADMIN")
    phone: Optional[str] = None

# --- PATIENT ---
class PatientCreate(UserBase):
    password: str
    blood_group: Optional[str] = None
    age: Optional[int] = None

class PatientResponse(UserBase):
    id: str
    blood_group: Optional[str] = None
    age: Optional[int] = None

# --- DOCTOR ---
class DoctorCreate(UserBase):
    password: str
    specialty: str
    experience_years: Optional[int] = 0
    fee: float
    bio: Optional[str] = None
    clinic_address: Optional[str] = None

class DoctorResponse(UserBase):
    id: str
    specialty: str
    experience_years: Optional[int] = 0
    fee: float
    bio: Optional[str] = None
    clinic_address: Optional[str] = None
    rating: Optional[float] = 0.0

# --- SCHEDULE ---
class ScheduleCreate(BaseModel):
    doctorId: str
    date: str
    timeSlot: str

class ScheduleResponse(ScheduleCreate):
    id: str
    isBooked: bool = False

# --- APPOINTMENT ---
class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: str
    schedule_id: str
    mode: str = Field(default="ONLINE", description="ONLINE or OFFLINE")

class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    schedule_id: str
    date: str
    timeSlot: str
    status: str
    mode: str
    fee: float
    payment_status: str
    meeting_link: Optional[str] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime

# --- PRESCRIPTION ---
class Medicine(BaseModel):
    name: str
    dosage: str
    duration_days: int
    instructions: str

class PrescriptionCreate(BaseModel):
    appointment_id: str
    diagnosis: str
    symptoms: List[str]
    medicines: List[Medicine]
    notes: Optional[str] = None

class PrescriptionResponse(PrescriptionCreate):
    id: str
    patient_id: str
    doctor_id: str
    issued_at: datetime

# --- REVIEW ---
class ReviewCreate(BaseModel):
    appointment_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(ReviewCreate):
    id: str
    doctor_id: str
    patient_id: str
    created_at: datetime
