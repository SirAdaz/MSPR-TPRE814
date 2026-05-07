import json
import random
import time

# Pro-ready IoT publisher skeleton for ESP32 + DHT + MQTT.
# Works in "dry-run" mode on desktop and can be switched to real MQTT on device.

# Device identity
DEVICE_ID = "esp32-br-01"
COUNTRY = "BR"
WAREHOUSE_ID = 1

# MQTT
MQTT_HOST = "localhost"
MQTT_PORT = 1883
TOPIC = "warehouse/{}/sensors".format(WAREHOUSE_ID)
PUBLISH_INTERVAL_SECONDS = 30
MQTT_RECONNECT_DELAY_SECONDS = 5

# Sensor guard rails (avoid incoherent values)
MIN_TEMPERATURE_C = -30.0
MAX_TEMPERATURE_C = 60.0
MIN_HUMIDITY_PERCENT = 0.0
MAX_HUMIDITY_PERCENT = 100.0

# Set to False on ESP32 when umqtt/network are configured.
DRY_RUN = True


def log(level: str, message: str) -> None:
    print("[iot][{}] {}".format(level, message))


def validate_reading(temperature: float, humidity: float) -> bool:
    if temperature < MIN_TEMPERATURE_C or temperature > MAX_TEMPERATURE_C:
        log("WARN", "temperature out of bounds: {}".format(temperature))
        return False
    if humidity < MIN_HUMIDITY_PERCENT or humidity > MAX_HUMIDITY_PERCENT:
        log("WARN", "humidity out of bounds: {}".format(humidity))
        return False
    return True


def read_sensor() -> tuple[float, float]:
    # Placeholder simulation for local dev.
    temperature = round(24.0 + random.uniform(-1.5, 3.0), 2)
    humidity = round(58.0 + random.uniform(-4.0, 5.0), 2)
    return temperature, humidity


def build_payload(temperature: float, humidity: float) -> dict[str, float | int | str]:
    return {
        "device_id": DEVICE_ID,
        "country": COUNTRY,
        "warehouse_id": WAREHOUSE_ID,
        "temperature": temperature,
        "humidity": humidity,
        "timestamp": int(time.time()),
    }


def connect_mqtt():
    # Keep import local so desktop dry-run works without umqtt installed.
    from umqtt.simple import MQTTClient  # type: ignore

    client = MQTTClient(client_id=DEVICE_ID, server=MQTT_HOST, port=MQTT_PORT)
    client.connect()
    log("INFO", "connected to MQTT {}:{}".format(MQTT_HOST, MQTT_PORT))
    return client


def publish_loop() -> None:
    client = None

    while True:
        try:
            temperature, humidity = read_sensor()
            if not validate_reading(temperature, humidity):
                time.sleep(PUBLISH_INTERVAL_SECONDS)
                continue

            payload = build_payload(temperature, humidity)
            encoded_payload = json.dumps(payload)

            if DRY_RUN:
                log("INFO", "dry-run publish {} -> {}".format(TOPIC, encoded_payload))
            else:
                if client is None:
                    client = connect_mqtt()
                client.publish(TOPIC, encoded_payload)
                log("INFO", "published {} -> {}".format(TOPIC, encoded_payload))

            time.sleep(PUBLISH_INTERVAL_SECONDS)
        except Exception as exc:
            # Avoid crash loop on transient network/broker errors.
            log("ERROR", "publish failed: {}".format(exc))
            client = None
            time.sleep(MQTT_RECONNECT_DELAY_SECONDS)


if __name__ == "__main__":
    log("INFO", "starting iot publisher for {} / warehouse {}".format(COUNTRY, WAREHOUSE_ID))
    publish_loop()
