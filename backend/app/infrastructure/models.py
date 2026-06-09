from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database import Base


class AdminModel(Base):
    __tablename__ = "admin"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    senha_hash: Mapped[str] = mapped_column(String, nullable=False)


class ServicoModel(Base):
    __tablename__ = "servico"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    preco: Mapped[float] = mapped_column(Float, nullable=False)
    slot_size: Mapped[int] = mapped_column(Integer, nullable=False, default=1)  # 1=30min, 2=60min
    ativo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    agendamentos: Mapped[list["AgendamentoModel"]] = relationship(
        back_populates="servico"
    )


class AgendamentoModel(Base):
    __tablename__ = "agendamento"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    servico_id: Mapped[int] = mapped_column(Integer, ForeignKey("servico.id"), nullable=False)
    data_hora_inicio: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="PENDENTE")
    nome_cliente: Mapped[str] = mapped_column(String, nullable=False)
    telefone_cliente: Mapped[str] = mapped_column(String, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    servico: Mapped[ServicoModel] = relationship(back_populates="agendamentos")
