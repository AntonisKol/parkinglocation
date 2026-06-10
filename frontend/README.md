# Where is the car parked? Frontend

This is a React and Vite frontend for sharing a car parking location. The page has one primary action, **Update location**, which saves the browser GPS position to the backend. Open browsers refresh the saved address every second.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Configuration

The app uses `https://backend-adwr.onrender.com` by default. To use another backend, create `frontend/.env`:

```bash
VITE_BACKEND_URL=http://localhost:8000
```
