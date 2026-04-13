import json
import time

# Placeholder MicroPython implementation for ESP32 + DHT + MQTT.
# Replace with machine/network/umqtt imports on device.

COUNTRY = "BR"
WAREHOUSE_ID = 1
TOPIC = f"warehouse/{WAREHOUSE_ID}/sensors"


def read_sensor() -> tuple[float, float]:
    return 29.0, 55.0


def publish_loop() -> None:
    while True:
        temperature, humidity = read_sensor()
        payload = {
            "country": COUNTRY,
            "temperature": temperature,
            "humidity": humidity,
            "timestamp": int(time.time()),
        }
        print(TOPIC, json.dumps(payload))
        time.sleep(30)


if __name__ == "__main__":
    publish_loop()
