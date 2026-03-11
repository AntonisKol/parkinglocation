from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
car_location = {
    "latitude": None,
    "longitude": None,
    "timestamp": None,
}

class Location(BaseModel):
    latitude: float
    longitude: float

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/car-location")
def get_car_location():
    return car_location

@app.post("/car-location")
def update_car_location(location: Location):
    global car_location
    car_location = {
        "latitude": location.latitude,
        "longitude": location.longitude,
        "timestamp": int(time.time()),
    }
    return car_location
