from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/barbearia"
    TEST_DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/barbearia_test"
    SECRET_KEY: str = "change-me-in-production"
    JWT_EXPIRE_HOURS: int = 8
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = ""
    # Admin seed (used in migration)
    ADMIN_EMAIL: str = "admin@marlonbarber.com"
    ADMIN_PASSWORD: str = "admin123"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
