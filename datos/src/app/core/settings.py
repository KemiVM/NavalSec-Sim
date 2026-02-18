from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Data Collector"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./data_storage.db"

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)

settings = Settings()
    