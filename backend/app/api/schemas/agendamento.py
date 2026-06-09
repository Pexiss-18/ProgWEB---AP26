from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class AgendamentoCreate(BaseModel):
    servico_id: int
    data_hora_inicio: datetime
    nome_cliente: str = Field(min_length=2, max_length=100)
    telefone_cliente: str = Field(pattern=r"^\d{10,11}$")


class AgendamentoAdminCreate(AgendamentoCreate):
    """Usado pelo admin para criar walk-ins (criados como CONFIRMADO)."""


class AgendamentoResponse(BaseModel):
    id: int
    servico_id: int
    data_hora_inicio: datetime
    nome_cliente: str
    telefone_cliente: str
    status: str

    model_config = ConfigDict(from_attributes=True)


class StatusUpdate(BaseModel):
    status: str = Field(pattern="^(PENDENTE|CONFIRMADO|CANCELADO)$")


class SlotDisponivel(BaseModel):
    data_hora: datetime


class SlotsDisponiveis(BaseModel):
    slots: list[datetime]
