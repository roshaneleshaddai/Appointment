from fastapi import APIRouter, Depends
from database import get_db
from datetime import datetime

router = APIRouter(prefix="/api/reports", tags=["admin"])


@router.get("/daily-summary")
async def daily_summary(db=Depends(get_db)):
    today = datetime.utcnow().strftime("%Y-%m-%d")

    pipeline_today = [
        {"$match": {"date": today}},
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "revenue": {"$sum": "$fee"},
            }
        },
    ]
    today_result = await db.appointments.aggregate(pipeline_today).to_list(1)
    today_stats = today_result[0] if today_result else {"total": 0, "revenue": 0}

    # Revenue by mode
    pipeline_mode = [
        {
            "$group": {
                "_id": "$mode",
                "count": {"$sum": 1},
                "revenue": {"$sum": "$fee"},
            }
        }
    ]
    mode_results = await db.appointments.aggregate(pipeline_mode).to_list(10)

    # Revenue by specialty
    pipeline_specialty = [
        {
            "$group": {
                "_id": "$specialty",
                "count": {"$sum": 1},
                "revenue": {"$sum": "$fee"},
            }
        },
        {"$sort": {"revenue": -1}},
    ]
    specialty_results = await db.appointments.aggregate(pipeline_specialty).to_list(20)

    # Status breakdown
    pipeline_status = [
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1},
            }
        }
    ]
    status_results = await db.appointments.aggregate(pipeline_status).to_list(10)

    # Last 7 days trend
    pipeline_trend = [
        {
            "$group": {
                "_id": "$date",
                "count": {"$sum": 1},
                "revenue": {"$sum": "$fee"},
            }
        },
        {"$sort": {"_id": -1}},
        {"$limit": 7},
    ]
    trend_results = await db.appointments.aggregate(pipeline_trend).to_list(7)

    return {
        "today": {
            "date": today,
            "total_appointments": today_stats.get("total", 0),
            "total_revenue": round(today_stats.get("revenue", 0), 2),
        },
        "by_mode": [
            {"mode": r["_id"], "count": r["count"], "revenue": round(r["revenue"], 2)}
            for r in mode_results
        ],
        "by_specialty": [
            {
                "specialty": r["_id"],
                "count": r["count"],
                "revenue": round(r["revenue"], 2),
            }
            for r in specialty_results
        ],
        "by_status": [
            {"status": r["_id"], "count": r["count"]} for r in status_results
        ],
        "trend_7_days": sorted(
            [
                {"date": r["_id"], "count": r["count"], "revenue": round(r["revenue"], 2)}
                for r in trend_results
            ],
            key=lambda x: x["date"],
        ),
    }


@router.get("/all-appointments")
async def all_appointments(db=Depends(get_db)):
    cursor = db.appointments.find({}).sort("createdAt", -1).limit(100)
    results = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        results.append(doc)
    return {"appointments": results}
