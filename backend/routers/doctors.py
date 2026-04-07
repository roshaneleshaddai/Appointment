from fastapi import APIRouter, Query, Depends, HTTPException
from database import get_db
from bson import ObjectId

router = APIRouter(prefix="/api", tags=["doctors"])

SPECIALTIES = [
    "Cardiology",
    "Dermatology",
    "Orthopedics",
    "Neurology",
    "Pediatrics",
    "Gynecology",
    "Ophthalmology",
    "ENT",
    "Psychiatry",
    "General Physician",
    "Oncology",
    "Endocrinology",
    "Gastroenterology",
    "Urology",
    "Pulmonology",
]


def serialize_doc(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc.pop("password_hash", None)
    return doc


@router.get("/specialties")
async def get_specialties():
    return {"specialties": SPECIALTIES}


@router.get("/doctors")
async def get_doctors(
    mode: str = Query(None),
    specialty: str = Query(None),
    db=Depends(get_db),
):
    query: dict = {"active": True}
    if mode:
        query["mode"] = mode.upper()
    if specialty:
        query["specialty"] = {"$regex": specialty, "$options": "i"}

    cursor = db.doctors.find(query)
    doctors = []
    async for doc in cursor:
        doctors.append(serialize_doc(doc))
    return {"doctors": doctors}


@router.get("/doctors/{doctor_id}")
async def get_doctor(doctor_id: str, db=Depends(get_db)):
    try:
        oid = ObjectId(doctor_id)
    except Exception:
        raise HTTPException(400, "Invalid doctor ID")
    doc = await db.doctors.find_one({"_id": oid})
    if not doc:
        raise HTTPException(404, "Doctor not found")
    return serialize_doc(doc)
