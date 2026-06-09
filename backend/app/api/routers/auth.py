from fastapi import APIRouter, Depends, HTTPException, status

from app.adapters.repositories.admin_repo import SqlAlchemyAdminRepository
from app.api.dependencies import get_admin_repo
from app.api.schemas.auth import LoginRequest, TokenResponse
from app.use_cases.auth.autenticar_admin import AutenticarAdmin, CredenciaisInvalidasError

router = APIRouter(prefix="/api/admin", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, admin_repo: SqlAlchemyAdminRepository = Depends(get_admin_repo)):
    """Autentica o administrador e retorna um token JWT com validade de 8h."""
    uc = AutenticarAdmin(admin_repo)
    try:
        token = await uc.executar(email=body.email, senha=body.senha)
    except CredenciaisInvalidasError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )
    return TokenResponse(access_token=token)
