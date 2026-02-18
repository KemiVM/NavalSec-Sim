from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Fault Injector"
    DEBUG: bool = True
    # URL por defecto para desarrollo local con puertos distintos
    SIMULATOR_URL: str = "http://localhost:8000"
    
    model_config = SettingsConfigDict(
        env_file = ".env",
        env_ignore_empty=True
    )

settings = Settings()