FROM python:3.12-slim

# ffmpeg is for video processing (M2)
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:0.8 /uv /bin/uv

# Keep the venv outside /app/backend so the compose volume doesn't hide it
ENV UV_PROJECT_ENVIRONMENT=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app/backend
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

COPY . .
WORKDIR /app
EXPOSE 8000
CMD ["uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
