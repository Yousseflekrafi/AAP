#!/bin/sh
set -e

python - <<'PY'
import os
import socket
import sys
import time
from urllib.parse import urlparse


def wait_for(url_env, default_host, default_port, label):
    raw = os.environ.get(url_env)
    host, port = default_host, default_port
    if raw:
        parsed = urlparse(raw)
        host = parsed.hostname or host
        port = parsed.port or port

    for _ in range(60):
        try:
            with socket.create_connection((host, port), timeout=2):
                print(f"{label} is up ({host}:{port})")
                return
        except OSError:
            time.sleep(1)

    print(f"Timed out waiting for {label} at {host}:{port}", file=sys.stderr)
    sys.exit(1)


wait_for("DATABASE_URL", "db", 5432, "PostgreSQL")
wait_for("REDIS_URL", "redis", 6379, "Redis")
PY

python manage.py migrate --noinput

exec "$@"
