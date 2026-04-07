from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from database import get_db
from schemas import PrescriptionCreate, PrescriptionResponse

router = APIRouter(prefix="/api/prescriptions", tags=["Prescriptions"])

@router.post("/", response_model=PrescriptionResponse)
async def create_prescription(data: PrescriptionCreate):
    db = get_db()
    # Verify appointment exists and extract patient/doctor
    app = await db.appointments.find_one({"_id": ObjectId(data.appointment_id)})
    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if app["status"] != "COMPLETED":
        raise HTTPException(status_code=400, detail="Cannot prescribe for incomplete appointments")

    # Check if a prescription already exists for this appointment to prevent duplicates
    existing = await db.prescriptions.find_one({"appointmentId": data.appointment_id})
    if existing:
         raise HTTPException(status_code=400, detail="Prescription already exists for this appointment")

    doc = {
        "appointmentId": data.appointment_id,
        "patientId": app["patientId"],
        "doctorId": app["doctorId"],
        "diagnosis": data.diagnosis,
        "symptoms": data.symptoms,
        "medicines": [m.dict() for m in data.medicines],
        "notes": data.notes,
        "issuedAt": datetime.utcnow()
    }
    
    res = await db.prescriptions.insert_one(doc)
    
    return {
        "id": str(res.inserted_id),
        "appointment_id": data.appointment_id,
        "patient_id": app["patientId"],
        "doctor_id": app["doctorId"],
        "diagnosis": data.diagnosis,
        "symptoms": data.symptoms,
        "medicines": doc["medicines"],
        "notes": data.notes,
        "issued_at": doc["issuedAt"],
    }

@router.get("/appointment/{app_id}")
async def get_prescription(app_id: str):
    db = get_db()
    doc = await db.prescriptions.find_one({"appointmentId": app_id})
    if not doc:
        raise HTTPException(status_code=404, detail="No prescription found")
    
    doc["id"] = str(doc.pop("_id"))
    return doc

@router.get("/patient/{patient_id}")
async def get_patient_prescriptions(patient_id: str):
    db = get_db()
    cursor = db.prescriptions.find({"patientId": patient_id}).sort("issuedAt", -1)
    docs = await cursor.to_list(length=100)
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return {"prescriptions": docs}


@router.put("/{prescription_id}")
async def update_prescription(prescription_id: str, data: PrescriptionCreate):
    db = get_db()
    try:
        oid = ObjectId(prescription_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prescription ID")

    existing = await db.prescriptions.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Prescription not found")

    updated_fields = {
        "diagnosis": data.diagnosis,
        "symptoms": data.symptoms,
        "medicines": [m.dict() for m in data.medicines],
        "notes": data.notes,
        "updatedAt": datetime.utcnow(),
    }
    await db.prescriptions.update_one({"_id": oid}, {"$set": updated_fields})

    doc = await db.prescriptions.find_one({"_id": oid})
    doc["id"] = str(doc.pop("_id"))
    return doc
