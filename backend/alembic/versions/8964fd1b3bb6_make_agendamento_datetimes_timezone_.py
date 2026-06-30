"""Make agendamento datetimes timezone-aware

Revision ID: 8964fd1b3bb6
Revises: b2c430ec9ef4
Create Date: 2026-06-30 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = '8964fd1b3bb6'
down_revision: Union[str, Sequence[str], None] = 'b2c430ec9ef4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Valores existentes são naive mas já tratados como UTC em todo o
    # código (datetime.now(timezone.utc) é usado nas comparações) — então
    # só etiquetamos o fuso, sem deslocar os valores.
    op.execute(
        "ALTER TABLE agendamento ALTER COLUMN data_hora_inicio "
        "TYPE TIMESTAMP WITH TIME ZONE USING data_hora_inicio AT TIME ZONE 'UTC'"
    )
    op.execute(
        "ALTER TABLE agendamento ALTER COLUMN criado_em "
        "TYPE TIMESTAMP WITH TIME ZONE USING criado_em AT TIME ZONE 'UTC'"
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE agendamento ALTER COLUMN data_hora_inicio "
        "TYPE TIMESTAMP WITHOUT TIME ZONE USING data_hora_inicio AT TIME ZONE 'UTC'"
    )
    op.execute(
        "ALTER TABLE agendamento ALTER COLUMN criado_em "
        "TYPE TIMESTAMP WITHOUT TIME ZONE USING criado_em AT TIME ZONE 'UTC'"
    )
