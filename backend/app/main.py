# Triggering pipeline check
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.adapters.repositories.admin_repo import SqlAlchemyAdminRepository
from app.api.routers import auth, servicos, agendamentos
from app.infrastructure import models  # noqa: F401 — garante que os models são registrados no Base
from app.infrastructure.database import SessionLocal
from app.infrastructure.settings import settings
from app.use_cases.auth.seed_admin_inicial import SeedAdminInicial


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with SessionLocal() as db:
        repo = SqlAlchemyAdminRepository(db)
        await SeedAdminInicial(repo).executar(settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD)
    yield


app = FastAPI(
    title="Marlon Barber Shop — API",
    description="API REST para sistema de agendamento da barbearia. Clean Architecture + FastAPI + PostgreSQL.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(servicos.router)
app.include_router(agendamentos.router)


@app.get("/", tags=["health"])
def root():
    return {"message": "Marlon Barber Shop API", "status": "ok", "version": "1.0.0"}
