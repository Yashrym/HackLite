from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    mongodb_uri: str = Field("mongodb://localhost:27017", env=("MONGODB_URI", "MONGODB_URL"))
    mongodb_db: str = Field("visionroute", env="MONGODB_DB")
    cors_origins: str = Field("http://localhost:5173,http://127.0.0.1:5173", env="CORS_ORIGINS")
    upload_dir: str = Field("uploads", env="UPLOAD_DIR")
    yolo_model: str = Field("yolov8n.pt", env="YOLO_MODEL")
    yolo_mock: int = Field(0, env="YOLO_MOCK")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
