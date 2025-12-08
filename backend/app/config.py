from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "sqlite:///./personalmind.db"
    chroma_persist_dir: str = "./chroma_data"
    collection_name: str = "pm_chunks"
    groq_api_key: str = ""
    chunk_size: int = 500
    chunk_overlap: int = 50
    knowledge_base_folder: str = ""  # Path to local folder with documents
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
