from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine

from app.api.routes import houses, points, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BrightPoints")

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routes
app.include_router(auth.router, prefix="/auth")
app.include_router(houses.router)
app.include_router(points.router, prefix="/points")