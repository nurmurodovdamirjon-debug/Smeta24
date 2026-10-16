from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, estimates, billing, leads

app = FastAPI(
    title="Smeta24 API",
    description="Aqlli Smeta (Smeta24Bot) Backend API & Calculation Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(estimates.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(leads.router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "app": "Smeta24 API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }
