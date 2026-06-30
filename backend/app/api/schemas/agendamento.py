from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, Field, field_validator


class AgendamentoCreate(BaseModel):
    servico_id: int
    data_hora_inicio: datetime
    nome_cliente: str = Field(min_length=2, max_length=100)
    telefone_cliente: str = Field(pattern=r"^\d{10,11}$")

    @field_validator("data_hora_inicio")
    @classmethod
    def _normalizar_para_utc(cls, v: datetime) -> datetime:
        # O frontend envia horários "naive" representando o horário local da
        # barbearia — tratamos como UTC (mesma convenção já usada no resto do
        # backend) em vez de deixar o driver do banco rejeitar o valor.
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)


class AgendamentoAdminCreate(AgendamentoCreate):
    """Usado pelo admin para criar walk-ins (criados como CONFIRMADO)."""


class AgendamentoResponse(BaseModel):
    id: int
    servico_id: int
    data_hora_inicio: datetime
    nome_cliente: str
    telefone_cliente: str
    status: str
    slot_size: int = 1

    model_config = ConfigDict(from_attributes=True)


class CancelamentoClienteRequest(BaseModel):
    telefone_cliente: str = Field(pattern=r"^\d{10,11}$")


class StatusUpdate(BaseModel):
    status: str = Field(pattern="^(PENDENTE|CONFIRMADO|CANCELADO)$")


class SlotDisponivel(BaseModel):
    data_hora: datetime


class SlotsDisponiveis(BaseModel):
    slots: list[datetime]
