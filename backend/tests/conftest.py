"""
conftest.py — Fixtures compartilhadas para testes do backend (Async).

- db_session: sessão SQLAlchemy usando banco PostgreSQL de teste (isolado por rollback)
- client: TestClient do FastAPI com override de get_db

IMPORTANTE: engine e SessionLocal são criados DENTRO das fixtures (lazy).
"""
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from fastapi.testclient import TestClient

from app.infrastructure.database import Base, get_db
from app.infrastructure.settings import settings
from app.infrastructure import models  # noqa: F401 — garante registro dos models
from app.main import app


@pytest_asyncio.fixture(scope="session")
async def db_engine():
    """Cria o engine e as tabelas uma vez por sessão de testes."""
    engine = create_async_engine(settings.TEST_DATABASE_URL)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        
    await engine.dispose()


@pytest_asyncio.fixture()
async def db_session(db_engine):
    """Sessão de banco isolada por teste usando rollback."""
    connection = await db_engine.connect()
    transaction = await connection.begin()
    
    SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=connection, class_=AsyncSession)
    session = SessionLocal()
    
    try:
        yield session
    finally:
        await session.close()
        await transaction.rollback()
        await connection.close()


@pytest_asyncio.fixture()
async def client(db_session):
    """TestClient com override da dependência get_db."""

    async def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
