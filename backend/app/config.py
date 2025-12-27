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
    
    # S3 Configuration
    s3_bucket_name: str = ""
    aws_region: str = "us-east-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
