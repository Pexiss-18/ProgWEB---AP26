#!/bin/sh
set -e

echo "⏳ Executando migrações do banco de dados..."
alembic upgrade head
echo "✅ Migrações concluídas."

echo "🚀 Iniciando servidor FastAPI..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
