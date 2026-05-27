from datetime import date, timedelta

from app.models import Lot
from app.services import alerts as alerts_service


def test_send_alert_email_returns_false_on_smtp_error(monkeypatch):
    class FailingSMTP:
        def __init__(self, *_args, **_kwargs):
            raise RuntimeError("smtp down")

    monkeypatch.setattr(alerts_service.smtplib, "SMTP", FailingSMTP)
    assert alerts_service.send_alert_email("sub", "content") is False


def test_send_alert_email_returns_true_on_success(monkeypatch):
    called = {"sent": False}

    class SuccessSMTP:
        def __init__(self, *_args, **_kwargs):
            return None

        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return None

        def send_message(self, _message):
            called["sent"] = True

    monkeypatch.setattr(alerts_service.smtplib, "SMTP", SuccessSMTP)
    assert alerts_service.send_alert_email("sub", "content") is True
    assert called["sent"] is True


def test_create_alert_persists_alert(client, monkeypatch):
    monkeypatch.setattr(alerts_service, "send_alert_email", lambda *_args, **_kwargs: True)
    response = client.get("/api/v1/alerts", headers={"X-Frontend-Key": "front-dev-key"})
    baseline = len(response.json())

    def _create_with_db(db):
        return alerts_service.create_alert(db, warehouse_id=1, alert_type="CONDITIONS", message="out")

    from app.core.db import get_db
    from app.main import app

    db_gen = app.dependency_overrides[get_db]()
    db = next(db_gen)
    created = _create_with_db(db)
    assert created.alert_type == "CONDITIONS"

    after = client.get("/api/v1/alerts", headers={"X-Frontend-Key": "front-dev-key"})
    assert len(after.json()) == baseline + 1


def test_create_alert_respects_cooldown(client, monkeypatch):
    monkeypatch.setattr(alerts_service, "send_alert_email", lambda *_args, **_kwargs: True)
    monkeypatch.setattr(alerts_service.settings, "enable_alert_cooldown", True)
    monkeypatch.setattr(alerts_service.settings, "alert_cooldown_seconds", 300)
    from app.core.db import get_db
    from app.main import app

    baseline = client.get("/api/v1/alerts", headers={"X-Frontend-Key": "front-dev-key"})
    baseline_count = len(baseline.json())

    db_gen = app.dependency_overrides[get_db]()
    db = next(db_gen)
    first_alert = alerts_service.create_alert(db, warehouse_id=1, alert_type="CONDITIONS", message="first")
    second_alert = alerts_service.create_alert(db, warehouse_id=1, alert_type="CONDITIONS", message="second")

    assert first_alert is not None
    assert second_alert is None

    after = client.get("/api/v1/alerts", headers={"X-Frontend-Key": "front-dev-key"})
    assert len(after.json()) == baseline_count + 1


def test_check_expired_lots_marks_status(client, monkeypatch):
    monkeypatch.setattr(alerts_service, "send_alert_email", lambda *_args, **_kwargs: False)
    from app.core.db import get_db
    from app.main import app

    db_gen = app.dependency_overrides[get_db]()
    db = next(db_gen)

    old_lot = Lot(
        lot_uid="LOT-OLD",
        warehouse_id=1,
        storage_date=date.today() - timedelta(days=500),
        status="conforme",
    )
    db.add(old_lot)
    db.commit()

    created = alerts_service.check_expired_lots(db)
    assert created >= 1

    refreshed = db.query(Lot).filter(Lot.lot_uid == "LOT-OLD").first()
    assert refreshed is not None
    assert refreshed.status == "perime"


def test_check_expired_lots_marks_soon_status_without_duplicates(client, monkeypatch):
    monkeypatch.setattr(alerts_service, "send_alert_email", lambda *_args, **_kwargs: False)
    from app.core.db import get_db
    from app.main import app
    from app.models import AlertLot

    db_gen = app.dependency_overrides[get_db]()
    db = next(db_gen)

    soon_lot = Lot(
        lot_uid="LOT-SOON",
        warehouse_id=1,
        storage_date=date.today() - timedelta(days=320),
        status="conforme",
    )
    db.add(soon_lot)
    db.commit()

    created_first = alerts_service.check_expired_lots(db)
    assert created_first >= 1

    refreshed = db.query(Lot).filter(Lot.lot_uid == "LOT-SOON").first()
    assert refreshed is not None
    assert refreshed.status == "bientot_perime"

    _ = alerts_service.check_expired_lots(db)
    soon_alerts = (
        db.query(AlertLot)
        .filter(AlertLot.lot_id == refreshed.id, AlertLot.alert_type == "EXPIRATION_SOON")
        .all()
    )
    assert len(soon_alerts) == 1
