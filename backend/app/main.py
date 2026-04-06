from fastapi import FastAPI
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

# ----------------- Debug DB Connection -----------------
@app.on_event("startup")
async def startup_event():
    try:
        with engine.connect() as conn:
            result = conn.execute(
                "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
            )
            tables = [row[0] for row in result]
            print("Tables in DB:", tables)
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