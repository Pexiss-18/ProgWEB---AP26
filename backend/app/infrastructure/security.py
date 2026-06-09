from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
import bcrypt

if not hasattr(bcrypt, "__about__"):
    class About:
        __version__ = "4.0.0"
    bcrypt.__about__ = About

from passlib.context import CryptContext

from app.infrastructure.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Gera um hash bcrypt da senha em texto puro."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verifica se a senha em texto puro corresponde ao hash bcrypt."""
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    """Gera um token JWT com expiração configurável em horas."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRE_HOURS)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict:
    """Decodifica e valida um token JWT. Levanta JWTError se inválido."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
