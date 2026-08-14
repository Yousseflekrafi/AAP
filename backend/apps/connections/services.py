import psycopg
from django.utils import timezone


def test_connection(connection):
    """Attempt a short, read-only connect + SELECT 1. Never persists any
    customer data — only whether the attempt succeeded, on the
    DatabaseConnection row itself."""

    try:
        with psycopg.connect(
            host=connection.host,
            port=connection.port,
            dbname=connection.database,
            user=connection.username,
            password=connection.get_password(),
            connect_timeout=5,
            autocommit=True,
        ) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()
        ok, detail = True, "Connection succeeded."
    except psycopg.OperationalError as exc:
        ok, detail = False, f"Could not connect: {exc}"
    except Exception as exc:  # noqa: BLE001 — surfaced to the caller as a test result, not raised
        ok, detail = False, f"Connection test failed: {exc}"

    connection.last_tested_at = timezone.now()
    connection.last_test_ok = ok
    connection.save(update_fields=["last_tested_at", "last_test_ok"])
    return ok, detail
