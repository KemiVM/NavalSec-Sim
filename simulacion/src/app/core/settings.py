from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Simulador de Sistema Naval"
    APP_ENV: str = "development"
    DEBUG: bool = False

    # URl del servicio de recolección
    DATA_COLLECTOR_URL: str = "http://localhost:8003/api/logs/"

    # Configuración para cargar variables desde .env si existe
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)

settings = Settings()