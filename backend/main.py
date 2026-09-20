from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, events, photos, galleries

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PhotoVault API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(photos.router)
app.include_router(galleries.router)

@app.get("/")
def root():
    return {"message": "PhotoVault API is running!"}