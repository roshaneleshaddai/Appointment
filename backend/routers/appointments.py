from fastapi import APIRouter, Depends, HTTPException, Header, Query
from database import get_db, get_redis
from models import AppointmentBook, AppointmentStatusUpdate
from routers.auth import get_current_user
from bson import ObjectId
from datetime import datetime
import asyncio

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

REDIS_LOCK_TTL = 10  # seconds


def serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


async def acquire_lock(redis, key: str) -> bool:
    """Try to acquire a Redis lock (SET NX EX). Returns True if acquired."""
    return await redis.set(key, "locked", nx=True, ex=REDIS_LOCK_TTL)


async def release_lock(redis, key: str):
    await redis.delete(key)


@router.post("/book")
async def book_appointment(
    data: AppointmentBook,
    authorization: str = Header(None),
    db=Depends(get_db),
    redis=Depends(get_redis),
):
    # Validate token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    user = get_current_user(token)

    # Validate schedule slot exists
    try:
        schedule_oid = ObjectId(data.schedule_id)
    except Exception:
        raise HTTPException(400, "Invalid schedule ID")

    lock_key = f"slot_lock:{data.schedule_id}"

    # --- Redis Distributed Lock ---
    acquired = await acquire_lock(redis, lock_key)
    if not acquired:
        raise HTTPException(409, "Another booking is in progress for this slot. Please try again.")

    try:
        # Double-check slot availability inside the lock
        slot = await db.doctor_schedules.find_one({"_id": schedule_oid})
        if not slot:
            raise HTTPException(404, "Time slot not found")
        if slot.get("bookedFlag"):
            raise HTTPException(409, "This slot is already booked. Please choose another time.")

        # Fetch doctor info
        doctor = await db.doctors.find_one({"_id": ObjectId(data.doctor_id)})
        if not doctor:
            raise HTTPException(404, "Doctor not found")

        # Fetch patient info
        patient = await db.patients.find_one({"_id": ObjectId(data.patient_id)})
        if not patient:
            raise HTTPException(404, "Patient not found")

        # Mark slot as booked
        await db.doctor_schedules.update_one(
            {"_id": schedule_oid}, {"$set": {"bookedFlag": True}}
        )

        # Create appointment record
        appointment = {
            "patientId": data.patient_id,
            "patientName": patient["name"],
            "patientContact": patient.get("contact", ""),
            "doctorId": data.doctor_id,
            "doctorName": doctor["name"],
            "specialty": doctor["specialty"],
            "scheduleId": data.schedule_id,
            "date": slot["date"],
            "timeSlot": slot["timeSlot"],
            "mode": doctor["mode"],
            "status": "SCHEDULED",
            "fee": doctor["fee"],
            "linkOrAddress": data.link_or_address
            or (
                "https://meet.google.com/hcl-medicare-demo"
                if doctor["mode"] == "ONLINE"
                else "Medical Center, 123 Health Street"
            ),
            "createdAt": datetime.utcnow(),
        }
        result = await db.appointments.insert_one(appointment)
        appointment["id"] = str(result.inserted_id)
        appointment.pop("_id", None)
        return {"message": "Appointment booked successfully", "appointment": appointment}

    finally:
        await release_lock(redis, lock_key)


@router.get("/patient/{patient_id}")
async def get_patient_appointments(
    patient_id: str,
    status: str = Query(None),
    db=Depends(get_db),
):
    query: dict = {"patientId": patient_id}
    if status:
        query["status"] = status.upper()
    cursor = db.appointments.find(query).sort("createdAt", -1)
    results = []
    async for doc in cursor:
        results.append(serialize(doc))
    return {"appointments": results}


@router.get("/doctor/{doctor_id}")
async def get_doctor_appointments(
    doctor_id: str,
    date: str = Query(None),
    status: str = Query(None),
    db=Depends(get_db),
):
    query: dict = {"doctorId": doctor_id}
    if date:
        query["date"] = date
    if status:
        query["status"] = status.upper()
    cursor = db.appointments.find(query).sort([("date", 1), ("timeSlot", 1)])
    results = []
    async for doc in cursor:
        results.append(serialize(doc))
    return {"appointments": results}


@router.patch("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    data: AppointmentStatusUpdate,
    authorization: str = Header(None),
    db=Depends(get_db),
):
    if not authorization:
        raise HTTPException(401, "Missing Authorization header")
    token = authorization.split(" ", 1)[1]
    get_current_user(token)  # just validate token

    try:
        oid = ObjectId(appointment_id)
    except Exception:
        raise HTTPException(400, "Invalid appointment ID")

    appt = await db.appointments.find_one({"_id": oid})
    if not appt:
        raise HTTPException(404, "Appointment not found")

    await db.appointments.update_one(
        {"_id": oid}, {"$set": {"status": data.status.value}}
    )
    # If cancelled, free up the slot
    if data.status.value == "CANCELLED":
        await db.doctor_schedules.update_one(
            {"_id": ObjectId(appt["scheduleId"])},
            {"$set": {"bookedFlag": False}},
        )
    return {"message": f"Status updated to {data.status.value}"}


@router.get("/today/doctor/{doctor_id}")
async def get_today_doctor_appointments(doctor_id: str, db=Depends(get_db)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    cursor = db.appointments.find({"doctorId": doctor_id, "date": today}).sort("timeSlot", 1)
    results = []
    async for doc in cursor:
        results.append(serialize(doc))
    return {"appointments": results, "date": today}
