"""
Use Case: Criar Agendamento.

Fluxo:
1. Valida que o serviço existe e está disponível (regra do domínio Servico)
2. Verifica que o slot solicitado não conflita com agendamentos existentes
   (regra do domínio SlotGrid)
3. Salva o agendamento com status PENDENTE
4. Tenta enviar confirmação via WhatsApp (falha silenciosa)
"""
import logging
from datetime import date, datetime

from app.domain.entities import Agendamento
from app.domain.exceptions import ServicoInativoError, SlotIndisponivelError
from app.domain.value_objects import SlotGrid
from app.use_cases.interfaces import IAgendamentoRepository, IServicoRepository, IWhatsAppGateway

logger = logging.getLogger(__name__)

_grid = SlotGrid()


class CriarAgendamento:
    def __init__(
        self,
        agendamento_repo: IAgendamentoRepository,
        servico_repo: IServicoRepository,
        whatsapp_gw: IWhatsAppGateway,
    ) -> None:
        self._agendamento_repo = agendamento_repo
        self._servico_repo = servico_repo
        self._whatsapp_gw = whatsapp_gw

    async def executar(
        self,
        servico_id: int,
        data_hora_inicio: datetime,
        nome_cliente: str,
        telefone_cliente: str,
    ) -> Agendamento:
        # 1. Valida serviço — a entidade sabe se está disponível
        servico = await self._servico_repo.buscar_por_id(servico_id)
        if servico is None:
            raise ValueError("Serviço não encontrado")
        if not servico.esta_disponivel():
            raise ServicoInativoError(f"O serviço '{servico.nome}' está inativo e não pode ser agendado.")

        # 2. Verifica disponibilidade do slot via SlotGrid (domínio)
        data = data_hora_inicio.date()
        agendamentos_do_dia = await self._agendamento_repo.buscar_por_data(data)
        disponiveis = _grid.filtrar_disponiveis(
            data=data,
            duracao_slots=servico.slot_size,
            agendamentos=agendamentos_do_dia,
        )
        if data_hora_inicio not in disponiveis:
            raise SlotIndisponivelError(
                "Este horário acabou de ser reservado. Escolha outro."
            )

        # 3. Salva agendamento — status PENDENTE é o padrão da entidade
        novo = Agendamento(
            servico_id=servico_id,
            data_hora_inicio=data_hora_inicio,
            nome_cliente=nome_cliente,
            telefone_cliente=telefone_cliente,
            slot_size=servico.slot_size,
        )
        salvo = await self._agendamento_repo.criar(novo)

        # 4. Notifica via WhatsApp (falha silenciosa)
        try:
            await self._whatsapp_gw.enviar_confirmacao(
                telefone=telefone_cliente,
                dados={
                    "nome": nome_cliente,
                    "servico": servico.nome,
                    "data_hora": data_hora_inicio,
                },
            )
        except Exception as e:
            logger.error("Falha ao enviar WhatsApp para %s: %s", telefone_cliente, e)

        return salvo
