from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "dev"
    enable_scheduler: bool = False
    enable_mqtt: bool = False
    country_code: str = "BR"
    database_url: str = "sqlite:///./futurekawa.db"
    mqtt_host: str = "mosquitto-br"
    mqtt_port: int = 1883
    mqtt_topic: str = "warehouse/+/sensors"
    smtp_host: str = "mailhog"
    smtp_port: int = 1025
    alert_email_to: str = "ops@example.com"


settings = Settings()
