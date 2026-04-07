from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, disconnect_db, connect_redis, disconnect_redis
from routers import auth, doctors, schedule, appointments, admin, prescriptions, reviews


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await connect_redis()
    yield
    await disconnect_db()
    await disconnect_redis()


app = FastAPI(
    title="MediCare API",
    description="Medical Appointment Booking System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(doctors.router)
app.include_router(schedule.router)
app.include_router(appointments.router)
app.include_router(admin.router)
app.include_router(prescriptions.router)
app.include_router(reviews.router)


@app.get("/")
def root():
    return {"message": "MediCare API is running", "docs": "/docs"}
