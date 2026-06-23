"""Add slot_size to agendamento, index on data_hora_inicio, unique partial index for active slots

Revision ID: b2c430ec9ef4
Revises: a1b329fb9de3
Create Date: 2026-06-23 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'b2c430ec9ef4'
down_revision: Union[str, Sequence[str], None] = 'a1b329fb9de3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'agendamento',
        sa.Column('slot_size', sa.Integer(), nullable=False, server_default='1'),
    )
    op.create_index(
        'ix_agendamento_data_hora_inicio',
        'agendamento',
        ['data_hora_inicio'],
    )
    # Unique partial index: dois agendamentos ativos não podem compartilhar o mesmo slot.
    # Cancelamentos ficam fora do índice e não bloqueiam a reutilização do horário.
    op.create_index(
        'uq_agendamento_slot_ativo',
        'agendamento',
        ['data_hora_inicio'],
        unique=True,
        postgresql_where=sa.text("status != 'CANCELADO'"),
    )


def downgrade() -> None:
    op.drop_index('uq_agendamento_slot_ativo', table_name='agendamento')
    op.drop_index('ix_agendamento_data_hora_inicio', table_name='agendamento')
    op.drop_column('agendamento', 'slot_size')
