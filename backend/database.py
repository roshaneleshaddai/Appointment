from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as aioredis
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("mongodb_url")
REDIS_URL = os.getenv("REDIS_URL")

# MongoDB
mongo_client: AsyncIOMotorClient = None
db = None

# Redis
redis_client: aioredis.Redis = None


async def connect_db():
    global mongo_client, db
    mongo_client = AsyncIOMotorClient(MONGODB_URL)
    db = mongo_client.get_default_database()
    # Create indexes
    await db.patients.create_index("email", unique=True)
    await db.doctors.create_index("email", unique=True)
    await db.doctor_schedules.create_index([("doctorId", 1), ("date", 1)])
    await db.appointments.create_index("scheduleId", unique=True)
    await db.prescriptions.create_index("appointmentId", unique=True)
    await db.reviews.create_index([("doctorId", 1), ("patientId", 1)])
    print("✅ MongoDB connected")


async def disconnect_db():
    global mongo_client
    if mongo_client:
        mongo_client.close()
        print("MongoDB disconnected")


async def connect_redis():
    global redis_client
    redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)
    await redis_client.ping()
    print("✅ Redis connected")


async def disconnect_redis():
    global redis_client
    if redis_client:
        await redis_client.close()


def get_db():
    return db


def get_redis():
    return redis_client
