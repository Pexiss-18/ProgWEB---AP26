"""
Exceções de domínio da Marlon Barber Shop.

Todas as regras de negócio violadas levantam subclasses de DomainError.
Isso permite que as camadas externas (API, use cases) tratem erros de domínio
de forma uniforme, sem depender de strings mágicas ou tipos genéricos como ValueError.
"""


class DomainError(Exception):
    """Base para todas as exceções de domínio."""


class TransicaoStatusInvalidaError(DomainError):
    """
    Levantada quando uma transição de status inválida é tentada.
    Ex: confirmar um agendamento já cancelado.
    """


class AgendamentoPassadoError(DomainError):
    """Levantada quando se tenta modificar um agendamento com data no passado."""


class ServicoInativoError(DomainError):
    """Levantada quando se tenta usar um serviço inativo para criar um agendamento."""


class ValorInvalidoError(DomainError):
    """
    Levantada quando um campo recebe um valor fora do domínio permitido.
    Ex: preço negativo, slot_size inválido.
    """


class SlotIndisponivelError(DomainError):
    """Levantada quando o slot de horário solicitado já está ocupado."""


class ServicoComAgendamentosFuturosError(DomainError):
    """Levantada quando se tenta remover um serviço que possui agendamentos futuros."""
