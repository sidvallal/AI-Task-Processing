# Multi-stage Dockerfile for Python worker service
FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN python -m venv /venv
RUN /venv/bin/pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim AS runner

WORKDIR /app

COPY --from=builder /venv /venv
COPY . .

ENV PATH="/venv/bin:$PATH"

RUN useradd -m -u 1000 worker && chown -R worker:worker /app

USER worker

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "from pathlib import Path; raise SystemExit(0 if 'worker.py' in Path('/proc/1/cmdline').read_text() else 1)"

CMD ["python", "worker.py"]
