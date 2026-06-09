"""
FastAPI dependency injection:
- get_db: sessão SQLAlchemy (do infrastructure)
- Repository factories
- get_current_admin: JWT validation
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.adapters.gateways.twilio_gateway import TwilioWhatsAppGateway
from app.adapters.repositories.admin_repo import SqlAlchemyAdminRepository
from app.adapters.repositories.agendamento_repo import SqlAlchemyAgendamentoRepository
from app.adapters.repositories.servico_repo import SqlAlchemyServicoRepository
from app.infrastructure.database import get_db
from app.infrastructure.security import decode_token

bearer_scheme = HTTPBearer()


def get_servico_repo(db: AsyncSession = Depends(get_db)) -> SqlAlchemyServicoRepository:
    return SqlAlchemyServicoRepository(db)


def get_agendamento_repo(db: AsyncSession = Depends(get_db)) -> SqlAlchemyAgendamentoRepository:
    return SqlAlchemyAgendamentoRepository(db)


def get_admin_repo(db: AsyncSession = Depends(get_db)) -> SqlAlchemyAdminRepository:
    return SqlAlchemyAdminRepository(db)


def get_whatsapp_gateway() -> TwilioWhatsAppGateway:
    return TwilioWhatsAppGateway()


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    admin_repo: SqlAlchemyAdminRepository = Depends(get_admin_repo),
):
    """Valida o Bearer JWT e retorna o admin autenticado."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(credentials.credentials)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    admin = await admin_repo.buscar_por_email(email)
    if admin is None:
        raise credentials_exception
    return admin
