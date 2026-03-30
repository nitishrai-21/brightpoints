from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.api.routes import houses, points, auth, schools
from fastapi.staticfiles import StaticFiles

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BrightPoints")

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