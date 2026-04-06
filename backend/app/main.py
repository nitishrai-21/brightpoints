from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.api.routes import houses, points, auth, schools
from fastapi.staticfiles import StaticFiles
import os
from app.core.config import settings

print("Using DATABASE_URL:", settings.DATABASE_URL)

# Create DB tables
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="BrightPoints")

# ----------------- Debug Middleware -----------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"DEBUG: {request.method} {request.url} (scheme={request.url.scheme}, host={request.url.hostname}, path={request.url.path})")
    response = await call_next(request)
    print(f"DEBUG: Response status: {response.status_code}")
    return response

# ----------------- Debug DB Connection -----------------
@app.on_event("startup")
async def startup_event():
    try:
        # with engine.connect() as conn:
        #     result = conn.execute(
        #         "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
        #     )
        #     tables = [row[0] for row in result]
        #     print("Tables in DB:", tables)

            # --- Google OAuth Debug ---
        redirect_uri = f"{settings.BACKEND_URL}/auth/callback"
        print("DEBUG: Redirect from env:", redirect_uri)
        print("DEBUG: PORT env var (Render):", os.getenv("PORT"))
    except Exception as e:
        print("DB Connection Error:", e)

origins = [
    "*",  # Frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(schools.router)
app.include_router(houses.router)
app.include_router(points.router, prefix="/points")
app.mount("/static", StaticFiles(directory="app/static"), name="static")