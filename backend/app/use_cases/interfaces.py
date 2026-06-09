"""
Interfaces (ABCs) para os repositórios e gateways externos.
Os use cases dependem apenas dessas abstrações — nunca de SQLAlchemy ou Twilio direto.
"""
from abc import ABC, abstractmethod
from datetime import date

from app.domain.entities import Admin, Agendamento, Servico


class IServicoRepository(ABC):
    @abstractmethod
    async def listar_ativos(self) -> list[Servico]: ...

    @abstractmethod
    async def buscar_por_id(self, id: int) -> Servico | None: ...

    @abstractmethod
    async def criar(self, servico: Servico) -> Servico: ...

    @abstractmethod
    async def atualizar(self, servico: Servico) -> Servico: ...

    @abstractmethod
    async def desativar(self, id: int) -> Servico: ...


class IAgendamentoRepository(ABC):
    @abstractmethod
    async def buscar_por_data(self, data: date) -> list[Agendamento]: ...

    @abstractmethod
    async def criar(self, agendamento: Agendamento) -> Agendamento: ...

    @abstractmethod
    async def atualizar_status(self, id: int, status: str) -> Agendamento: ...

    @abstractmethod
    async def buscar_por_id(self, id: int) -> Agendamento | None: ...

    @abstractmethod
    async def possui_agendamentos_futuros(self, servico_id: int) -> bool: ...


class IAdminRepository(ABC):
    @abstractmethod
    async def buscar_por_email(self, email: str) -> Admin | None: ...


class IWhatsAppGateway(ABC):
    @abstractmethod
    async def enviar_confirmacao(self, telefone: str, dados: dict) -> None: ...
