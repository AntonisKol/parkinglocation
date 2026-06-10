# Where is the car parked? Frontend

This is a React and Vite frontend for sharing a car parking location. The page has one primary action, **Update location**, which saves the browser GPS position to the backend. Open browsers refresh the saved address every second.

## Development

Start the backend from the repository root:

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Then start the frontend:

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Configuration

In development, Vite proxies `/api` to `http://127.0.0.1:8000`. To use a deployed backend instead, create `frontend/.env`:

```bash
VITE_BACKEND_URL=https://your-backend.example.com
```
