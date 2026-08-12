FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.development

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chmod +x entrypoint.sh

EXPOSE 8000

# docker-compose.yml bind-mounts ./backend over /app at runtime, which
# shadows entrypoint.sh baked into the image with whatever is on the host
# checkout — CRLF line endings (common on Windows) break the shebang, and
# bind-mounted files from Docker Desktop can lose the executable bit. Fix
# both at container start, right before running it, so it can't break
# regardless of the host's line endings or permissions.
ENTRYPOINT ["sh", "-c", "sed -i 's/\\r$//' entrypoint.sh && chmod +x entrypoint.sh && exec ./entrypoint.sh \"$@\"", "--"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
