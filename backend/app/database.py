# Shim de compatibilidade — re-exporta do módulo de infraestrutura.
# Mantido para não quebrar imports antigos.
from app.infrastructure.database import Base, SessionLocal, engine, get_db  # noqa: F401
