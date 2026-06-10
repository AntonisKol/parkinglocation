# Where is the car parked? 

A simple React web app for sharing the parked car location. Open the link, tap **Update location**, and the app saves the browser GPS position to the backend. Anyone else with the page open sees the saved address refresh automatically.

---

## Features

- Display current car location
- Update location with one button using browser geolocation
- Refresh the saved address every second for shared viewing
- Stores location in a backend server
- Reverse geocoding to display the street and city

---

## Tech Stack

- **Frontend:** React, Vite, TypeScript
- **Backend:** FastAPI
- **Reverse geocoding:** OpenStreetMap Nominatim
- **HTTP:** Axios

---

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_BACKEND_URL` in `frontend/.env` to point at a different backend. If it is not set, the app uses the currently deployed backend.


