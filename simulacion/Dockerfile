FROM python:3.11-slim

# Instalar uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Copiar configuración del proyecto
COPY pyproject.toml .

# Crear entorno virtual e instalar dependencias
RUN uv venv /app/.venv
ENV VIRTUAL_ENV=/app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Instalar dependencias sin el proyecto aun (para cachear capas)
RUN uv pip install -r pyproject.toml

# Copiar el código fuente
COPY src /app/src
ENV PYTHONPATH=/app/src

# Comando de arranque
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]