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

Start the backend first:

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Then start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

In development, Vite proxies `/api` to `http://127.0.0.1:8000`.

Set `VITE_BACKEND_URL` in `frontend/.env` to point at a deployed backend instead:

```bash
VITE_BACKEND_URL=https://your-backend.example.com
```


