"""
Value Objects do domínio da Marlon Barber Shop.

Value Objects são imutáveis, identificados pelo seu valor (não por ID),
e encapsulam regras/cálculos que pertencem ao domínio mas não a uma entidade específica.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.domain.entities import Agendamento


# ---------------------------------------------------------------------------
# Constantes de domínio — regras de negócio do barbeiro
# ---------------------------------------------------------------------------

HORA_INICIO_BARBEIRO = 9   # 09:00
HORA_FIM_BARBEIRO = 18     # 18:00
SLOT_MINUTOS = 30


@dataclass(frozen=True)
class SlotGrid:
    """
    Grade de horários da barbearia.

    Encapsula as regras de negócio de geração e filtragem de slots:
    - O barbeiro trabalha das 09:00 às 18:00
    - Slots de 30 minutos cada
    - Um slot só é disponível se todo o intervalo [inicio, inicio + duracao)
      não colidir com nenhum agendamento existente e não ultrapassar 18:00

    Uso:
        grid = SlotGrid()
        disponiveis = grid.filtrar_disponiveis(data, duracao_slots=2, agendamentos=[...])
    """

    hora_inicio: int = HORA_INICIO_BARBEIRO
    hora_fim: int = HORA_FIM_BARBEIRO
    slot_minutos: int = SLOT_MINUTOS

    def gerar_todos(self, data: date) -> list[datetime]:
        """
        Gera todos os possíveis slots de início para o dia informado.
        O último slot incluído é aquele que ainda cabe antes do fim do expediente.
        """
        slots: list[datetime] = []
        atual = datetime(data.year, data.month, data.day, self.hora_inicio, 0)
        fim = datetime(data.year, data.month, data.day, self.hora_fim, 0)
        while atual < fim:
            slots.append(atual)
            atual += timedelta(minutes=self.slot_minutos)
        return slots

    def filtrar_disponiveis(
        self,
        data: date,
        duracao_slots: int,
        agendamentos: list[Agendamento],
    ) -> list[datetime]:
        """
        Retorna apenas os slots livres para a duração solicitada.

        Um slot é considerado livre quando:
        1. O intervalo [slot, slot + duracao) não ultrapassa o fim do expediente.
        2. Não colide com nenhum agendamento ativo existente.
        """
        # Importação local para evitar circular import (entities importa value_objects)
        fim_dia = datetime(data.year, data.month, data.day, self.hora_fim, 0)
        duracao = timedelta(minutes=duracao_slots * self.slot_minutos)

        # Agendamentos cancelados não bloqueiam slots
        ativos = [a for a in agendamentos if not a.esta_cancelado()]

        disponiveis: list[datetime] = []
        for slot in self.gerar_todos(data):
            slot_fim = slot + duracao
            if slot_fim > fim_dia:
                continue  # ultrapassa o expediente
            if any(self._colide(slot, slot_fim, a) for a in ativos):
                continue  # conflito com agendamento existente
            disponiveis.append(slot)

        return disponiveis

    # ------------------------------------------------------------------
    # Helpers internos
    # ------------------------------------------------------------------

    def _colide(
        self,
        slot_inicio: datetime,
        slot_fim: datetime,
        agendamento: Agendamento,
    ) -> bool:
        """
        Verifica se o intervalo [slot_inicio, slot_fim) se sobrepõe ao agendamento.
        Usa overlap padrão: A.inicio < B.fim AND A.fim > B.inicio
        """
        a_inicio = agendamento.data_hora_inicio
        a_fim = agendamento.hora_fim
        return slot_inicio < a_fim and slot_fim > a_inicio
