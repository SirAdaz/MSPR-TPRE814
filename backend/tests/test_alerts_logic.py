from types import SimpleNamespace

from app.services.alerts import evaluate_reading


class FakeDB:
    pass


def test_evaluate_reading_returns_none_when_in_range():
    warehouse = SimpleNamespace(
        id=1,
        name="W1",
        ideal_temp=29.0,
        ideal_humidity=55.0,
        temp_tolerance=3.0,
        humidity_tolerance=2.0,
    )
    result = evaluate_reading(FakeDB(), warehouse, 29.5, 54.5)
    assert result is None
