from fastapi import APIRouter, Depends, HTTPException, Query
from database import get_db
from models import ScheduleCreate
from bson import ObjectId
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/schedule", tags=["schedule"])


def generate_slots(start_time: str, end_time: str, slot_minutes: int, date_str: str):
    """Generate time slot strings like '09:00 AM - 09:30 AM' for a given date."""
    fmt = "%I:%M %p"
    start = datetime.strptime(f"{date_str} {start_time}", "%Y-%m-%d %H:%M")
    end = datetime.strptime(f"{date_str} {end_time}", "%Y-%m-%d %H:%M")
    slots = []
    current = start
    while current + timedelta(minutes=slot_minutes) <= end:
        slot_end = current + timedelta(minutes=slot_minutes)
        label = f"{current.strftime('%I:%M %p')} - {slot_end.strftime('%I:%M %p')}"
        slots.append(label)
        current = slot_end
    return slots


@router.post("")
async def create_schedule(data: ScheduleCreate, db=Depends(get_db)):
    try:
        doctor_oid = ObjectId(data.doctor_id)
    except Exception:
        raise HTTPException(400, "Invalid doctor ID")

    doctor = await db.doctors.find_one({"_id": doctor_oid})
    if not doctor:
        raise HTTPException(404, "Doctor not found")

    # Check if slots already exist for this doctor on this date
    existing = await db.doctor_schedules.find_one(
        {"doctorId": data.doctor_id, "date": data.date}
    )
    if existing:
        raise HTTPException(409, f"Slots already exist for {data.date}. Delete them first.")

    slots = generate_slots(data.start_time, data.end_time, data.slot_minutes, data.date)
    if not slots:
        raise HTTPException(400, "No slots generated. Check start/end times.")

    docs = [
        {
            "doctorId": data.doctor_id,
            "doctorName": doctor["name"],
            "specialty": doctor["specialty"],
            "date": data.date,
            "timeSlot": slot,
            "bookedFlag": False,
            "createdAt": datetime.utcnow(),
        }
        for slot in slots
    ]
    result = await db.doctor_schedules.insert_many(docs)
    return {
        "message": f"Created {len(result.inserted_ids)} slots for {data.date}",
        "count": len(result.inserted_ids),
    }


@router.get("/{doctor_id}")
async def get_schedule(
    doctor_id: str,
    date: str = Query(None, description="Filter by date YYYY-MM-DD"),
    available_only: bool = Query(False),
    db=Depends(get_db),
):
    query: dict = {"doctorId": doctor_id}
    if date:
        query["date"] = date
    if available_only:
        query["bookedFlag"] = False

    cursor = db.doctor_schedules.find(query).sort([("date", 1), ("timeSlot", 1)])
    slots = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        slots.append(doc)
    return {"slots": slots}


@router.delete("/{schedule_id}")
async def delete_schedule(schedule_id: str, db=Depends(get_db)):
    try:
        oid = ObjectId(schedule_id)
    except Exception:
        raise HTTPException(400, "Invalid schedule ID")

    slot = await db.doctor_schedules.find_one({"_id": oid})
    if not slot:
        raise HTTPException(404, "Slot not found")
    if slot.get("bookedFlag"):
        raise HTTPException(400, "Cannot delete a booked slot")

    await db.doctor_schedules.delete_one({"_id": oid})
    return {"message": "Slot deleted"}
