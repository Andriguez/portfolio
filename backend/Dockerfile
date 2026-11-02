FROM python:3.14-slim
LABEL authors="andhriguez"

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

RUN groupadd --system --gid 10001 app \
 && useradd  --system --uid 10001 --gid app --home-dir /app --shell /usr/sbin/nologin app


WORKDIR /app
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY alembic.ini .
COPY migrations ./migrations
COPY app ./app

RUN mkdir -p /app/uploads /app/cv_files \
 && chown -R app:app /app/uploads /app/cv_files

USER app
EXPOSE 8000

# docker compose run --rm --user root backend chown -R 10001:10001 /app/uploads /app/cv_files

CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips='*'"]
