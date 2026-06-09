from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ServicoCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    preco: float = Field(gt=0)
    slot_size: int = Field(ge=1, le=4)  # 1=30min, 2=60min, 3=90min, 4=120min


class ServicoUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=2, max_length=100)
    preco: float | None = Field(default=None, gt=0)
    slot_size: int | None = Field(default=None, ge=1, le=4)
    ativo: bool | None = None


class ServicoResponse(BaseModel):
    id: int
    nome: str
    preco: float
    slot_size: int
    ativo: bool

    model_config = ConfigDict(from_attributes=True)
