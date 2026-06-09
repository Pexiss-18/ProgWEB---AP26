"""
SQLAlchemy implementation of IAdminRepository (Async).
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities import Admin
from app.infrastructure.models import AdminModel
from app.use_cases.interfaces import IAdminRepository


class SqlAlchemyAdminRepository(IAdminRepository):
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def buscar_por_email(self, email: str) -> Admin | None:
        stmt = select(AdminModel).where(AdminModel.email == email)
        result = await self._db.execute(stmt)
        model = result.scalar_one_or_none()
        
        if model is None:
            return None
        return Admin(id=model.id, email=model.email, senha_hash=model.senha_hash)
