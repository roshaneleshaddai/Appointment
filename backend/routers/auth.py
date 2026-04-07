from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from models import PatientRegister, DoctorRegister, LoginRequest
from passlib.context import CryptContext
from datetime import datetime, timedelta
from dotenv import load_dotenv
import jwt
import os

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "fallback_secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/api/auth", tags=["auth"])


def create_token(user_id: str, role: str, name: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "name": name,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")


@router.post("/register/patient")
async def register_patient(data: PatientRegister, db=Depends(get_db)):
    if await db.patients.find_one({"email": data.email}):
        raise HTTPException(400, "Email already registered")
    hashed = pwd_context.hash(data.password)
    doc = {
        "name": data.name,
        "contact": data.contact,
        "dob": data.dob,
        "email": data.email,
        "password_hash": hashed,
        "role": "patient",
        "createdAt": datetime.utcnow(),
    }
    result = await db.patients.insert_one(doc)
    uid = str(result.inserted_id)
    return {
        "token": create_token(uid, "patient", data.name),
        "role": "patient",
        "name": data.name,
        "id": uid,
    }


@router.post("/register/doctor")
async def register_doctor(data: DoctorRegister, db=Depends(get_db)):
    if await db.doctors.find_one({"email": data.email}):
        raise HTTPException(400, "Email already registered")
    hashed = pwd_context.hash(data.password)
    doc = {
        "name": data.name,
        "specialty": data.specialty,
        "mode": data.mode.value,
        "fee": data.fee,
        "active": True,
        "email": data.email,
        "password_hash": hashed,
        "role": "doctor",
        "createdAt": datetime.utcnow(),
    }
    result = await db.doctors.insert_one(doc)
    uid = str(result.inserted_id)
    return {
        "token": create_token(uid, "doctor", data.name),
        "role": "doctor",
        "name": data.name,
        "id": uid,
    }


@router.post("/login")
async def login(data: LoginRequest, db=Depends(get_db)):
    collection_map = {
        "patient": db.patients,
        "doctor": db.doctors,
        "admin": db.admins,
    }
    collection = collection_map.get(data.role)
    if not collection:
        raise HTTPException(400, "Invalid role. Use patient, doctor, or admin")

    user = await collection.find_one({"email": data.email})
    if not user:
        raise HTTPException(401, "Invalid email or password")
    if not pwd_context.verify(data.password, user.get("password_hash", "")):
        raise HTTPException(401, "Invalid email or password")

    uid = str(user["_id"])
    return {
        "token": create_token(uid, data.role, user.get("name", "Admin")),
        "role": data.role,
        "name": user.get("name", "Admin"),
        "id": uid,
    }
