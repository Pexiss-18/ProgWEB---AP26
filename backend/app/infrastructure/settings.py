from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/barbearia"
    TEST_DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/barbearia_test"
    SECRET_KEY: str
    JWT_EXPIRE_HOURS: int = 8
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = ""
    # Admin seed (criado automaticamente no startup da API caso ainda não exista)
    ADMIN_EMAIL: str = "admin@marlonbarber.com"
    ADMIN_PASSWORD: str
    # Origens do frontend autorizadas a chamar a API (separadas por vírgula)
    ALLOWED_ORIGINS: str = "http://localhost:3000,https://prog-web-ap-26.vercel.app"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
