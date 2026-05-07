from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "dev"
    enable_scheduler: bool = False
    enable_mqtt: bool = False
    enable_simulation: bool = True
    country_code: str = "BR"
    database_url: str = "sqlite:///./futurekawa.db"
    simulation_environment_interval_seconds: int = 60
    simulation_logistics_interval_seconds: int = 120
    enable_alert_cooldown: bool = True
    alert_cooldown_seconds: int = 0
    mqtt_host: str = "mosquitto-br"
    mqtt_port: int = 1883
    mqtt_topic: str = "warehouse/+/sensors"
    smtp_host: str = "mailhog"
    smtp_port: int = 1025
    alert_email_to: str = "ops@example.com"
    alert_email_br: str = "brazil.ops@futurekawa.local"
    alert_email_ec: str = "ecuador.ops@futurekawa.local"
    alert_email_co: str = "colombia.ops@futurekawa.local"
    frontend_api_key: str = "front-dev-key"
    sensor_api_key: str = "sensor-dev-key"


settings = Settings()
