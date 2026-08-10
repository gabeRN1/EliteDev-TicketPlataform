from fastapi import FastAPI
from database import engine, Base
from routers import eventos_routes, auth_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Plataforma de Eventos")

app.include_router(auth_routes.router)
app.include_router(eventos_routes.router)

@app.get("/")
def home():
    return {"message": "API de Plataforma on"}