# Where is the car parked? 

A simple React web app to track and update the location of your car. The app displays the current saved location, lets you update it from your browser GPS, and supports choosing a location on an interactive map.

---

## Features

- Display current car location
- Update location using browser geolocation
- View location on a map with a marker
- Stores location in a backend server
- Reverse geocoding to display the street and city

---

## Screenshots
![IMG_0025](https://github.com/user-attachments/assets/30e9089d-a6c5-4e93-9c63-a9132d40f686)
![IMG_0024](https://github.com/user-attachments/assets/2ab864cc-8ca0-46f2-b494-d0f058cbd67a)

 ---

## Tech Stack

- **Frontend:** React, Vite, TypeScript
- **Backend:** FastAPI
- **Maps:** Leaflet, OpenStreetMap
- **HTTP:** Axios

---

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_BACKEND_URL` in `frontend/.env` to point at a different backend. If it is not set, the app uses the currently deployed backend.


