from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    CLERK_JWKS_URL: str

    class Config:
        env_file = ".env"

settings = Settings()
