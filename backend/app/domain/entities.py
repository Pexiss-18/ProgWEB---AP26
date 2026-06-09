"""
Entidades de domínio da Marlon Barber Shop.
Puras — sem dependência de SQLAlchemy, Pydantic ou FastAPI.

Domínio Rico: cada entidade conhece suas regras e protege sua própria consistência.
"""
from __future__ import annotations

from abc import ABC
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Callable

from app.domain.exceptions import (
    AgendamentoPassadoError,
    ServicoInativoError,
    TransicaoStatusInvalidaError,
    ValorInvalidoError,
)
from app.domain.value_objects import SLOT_MINUTOS


# ---------------------------------------------------------------------------
# Classe Base: Entity
# ---------------------------------------------------------------------------

@dataclass(kw_only=True)
class Entity(ABC):
    """
    Classe base para todas as entidades do domínio.
    Garante igualdade baseada em ID e rastreamento de criação comum.
    """
    id: int | None = None
    criado_em: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __eq__(self, outro: object) -> bool:
        if not isinstance(outro, type(self)):
            return False
        # Se algum dos IDs for None, não podemos garantir igualdade em memória
        # (são objetos novos não persistidos) a menos que sejam a mesma instância.
        if self.id is None or outro.id is None:
            return id(self) == id(outro)
        return self.id == outro.id

    def __hash__(self) -> int:
        return hash(self.id) if self.id is not None else id(self)


# ---------------------------------------------------------------------------
# Enum de Status
# ---------------------------------------------------------------------------

class StatusAgendamento(str, Enum):
    PENDENTE = "PENDENTE"
    CONFIRMADO = "CONFIRMADO"
    CANCELADO = "CANCELADO"


# ---------------------------------------------------------------------------
# Entidade: Admin
# ---------------------------------------------------------------------------

@dataclass(kw_only=True)
class Admin(Entity):
    """Administrador da barbearia."""
    email: str
    senha_hash: str

    def verificar_senha(self, verify_fn: Callable[[str, str], bool], senha_plain: str) -> bool:
        return verify_fn(senha_plain, self.senha_hash)


# ---------------------------------------------------------------------------
# Entidade: Servico
# ---------------------------------------------------------------------------

_SLOT_SIZES_VALIDOS = {1, 2}  # 30min ou 60min


@dataclass(kw_only=True)
class Servico(Entity):
    """Serviço oferecido pela barbearia."""
    nome: str
    preco: float
    slot_size: int  # 1 = 30min, 2 = 60min
    ativo: bool = True

    def __post_init__(self) -> None:
        self._validar()

    def _validar(self) -> None:
        if self.preco <= 0:
            raise ValorInvalidoError(f"Preço deve ser positivo. Recebido: {self.preco}")
        if self.slot_size not in _SLOT_SIZES_VALIDOS:
            raise ValorInvalidoError(
                f"slot_size deve ser 1 (30min) ou 2 (60min). Recebido: {self.slot_size}"
            )

    @property
    def duracao_minutos(self) -> int:
        return self.slot_size * SLOT_MINUTOS

    def esta_disponivel(self) -> bool:
        return self.ativo

    def atualizar(
        self,
        nome: str | None = None,
        preco: float | None = None,
        slot_size: int | None = None,
    ) -> None:
        if nome is not None:
            self.nome = nome
        if preco is not None:
            if preco <= 0:
                raise ValorInvalidoError(f"Preço deve ser positivo. Recebido: {preco}")
            self.preco = preco
        if slot_size is not None:
            if slot_size not in _SLOT_SIZES_VALIDOS:
                raise ValorInvalidoError(
                    f"slot_size deve ser 1 (30min) ou 2 (60min). Recebido: {slot_size}"
                )
            self.slot_size = slot_size

    def desativar(self) -> None:
        self.ativo = False


# ---------------------------------------------------------------------------
# Entidade: Agendamento
# ---------------------------------------------------------------------------

@dataclass
class Agendamento(Entity):
    """Agendamento de um cliente na barbearia."""
    servico_id: int
    data_hora_inicio: datetime
    nome_cliente: str
    telefone_cliente: str
    status: StatusAgendamento = StatusAgendamento.PENDENTE
    slot_size: int = 1  # herdado do Servico no momento da criação

    @property
    def duracao_minutos(self) -> int:
        return self.slot_size * SLOT_MINUTOS

    @property
    def hora_fim(self) -> datetime:
        return self.data_hora_inicio + timedelta(minutes=self.duracao_minutos)

    def esta_cancelado(self) -> bool:
        return self.status == StatusAgendamento.CANCELADO

    def esta_confirmado(self) -> bool:
        return self.status == StatusAgendamento.CONFIRMADO

    def confirmar(self) -> None:
        if self.status != StatusAgendamento.PENDENTE:
            raise TransicaoStatusInvalidaError(
                f"Não é possível confirmar um agendamento com status '{self.status.value}'. "
                "Apenas agendamentos PENDENTES podem ser confirmados."
            )
        self.status = StatusAgendamento.CONFIRMADO

    def cancelar(self) -> None:
        if self.esta_cancelado():
            raise TransicaoStatusInvalidaError(
                "Este agendamento já está cancelado."
            )
        agora = datetime.now(timezone.utc).replace(tzinfo=None)
        inicio = self.data_hora_inicio.replace(tzinfo=None)
        if inicio < agora:
            raise AgendamentoPassadoError(
                "Não é possível cancelar um agendamento que já passou."
            )
        self.status = StatusAgendamento.CANCELADO

    def colide_com(self, outro: Agendamento) -> bool:
        if outro.esta_cancelado() or self.esta_cancelado():
            return False
        return self.data_hora_inicio < outro.hora_fim and self.hora_fim > outro.data_hora_inicio
