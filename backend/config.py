from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    tmdb_key: str
    tmdb_base_url: str = "https://api.themoviedb.org/3"

    secret_key:str 
    algorithm: str = "HS256"
    acess_token_expires_minutes: int = 60  
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()