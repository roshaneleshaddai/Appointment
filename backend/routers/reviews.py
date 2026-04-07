from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId
from ..database import get_db
from ..schemas import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.post("/", response_model=ReviewResponse)
async def submit_review(data: ReviewCreate):
    db = get_db()
    app = await db.appointments.find_one({"_id": ObjectId(data.appointment_id)})
    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if app["status"] != "COMPLETED":
        raise HTTPException(status_code=400, detail="Cannot review incomplete appointments")

    # Patient can only leave one review per doctor (or per appointment)
    existing = await db.reviews.find_one({"appointmentId": data.appointment_id})
    if existing:
         raise HTTPException(status_code=400, detail="Review already submitted for this appointment")

    doc = {
        "appointmentId": data.appointment_id,
        "doctorId": app["doctorId"],
        "patientId": app["patientId"],
        "rating": data.rating,
        "comment": data.comment,
        "createdAt": datetime.utcnow()
    }
    res = await db.reviews.insert_one(doc)
    
    # Optional: Aggregation update for doctor average rating could be done here asynchronously
    
    return {
        "id": str(res.inserted_id),
        "appointment_id": data.appointment_id,
        "patient_id": app["patientId"],
        "doctor_id": app["doctorId"],
        "rating": data.rating,
        "comment": data.comment,
        "created_at": doc["createdAt"]
    }

@router.get("/doctor/{doctor_id}")
async def get_doctor_reviews(doctor_id: str):
    db = get_db()
    cursor = db.reviews.find({"doctorId": doctor_id}).sort("createdAt", -1)
    docs = await cursor.to_list(length=50)
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return {"reviews": docs}
