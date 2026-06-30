"""Reinterpret data_hora_inicio as America/Sao_Paulo instead of UTC

Revision ID: 8b3759819ed2
Revises: 8964fd1b3bb6
Create Date: 2026-06-30 00:00:00.000001

"""
from typing import Sequence, Union

from alembic import op

revision: str = '8b3759819ed2'
down_revision: Union[str, Sequence[str], None] = '8964fd1b3bb6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # A migration anterior etiquetou data_hora_inicio como UTC, mas os
    # horários de expediente (09:00-18:00) sempre representaram a hora
    # local da barbearia (America/Sao_Paulo), não UTC. Aqui deslocamos o
    # instante armazenado para que o relógio de parede continue mostrando
    # o mesmo horário (ex: "09:00"), agora corretamente sob o fuso de
    # Brasília. criado_em não é tocado — já era um instante UTC correto.
    op.execute(
        "UPDATE agendamento SET data_hora_inicio = "
        "(data_hora_inicio AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo'"
    )


def downgrade() -> None:
    op.execute(
        "UPDATE agendamento SET data_hora_inicio = "
        "(data_hora_inicio AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'UTC'"
    )
