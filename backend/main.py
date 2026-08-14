from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import eventos_routes, auth_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Plataforma de Eventos")

origens_permitidas = [
    "http://localhost:5173", 
    "https://elite-dev-ticket-plataform-ypp5.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origens_permitidas,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(eventos_routes.router)

@app.get("/")
def home():
    return {"message": "API de Plataforma on"}
