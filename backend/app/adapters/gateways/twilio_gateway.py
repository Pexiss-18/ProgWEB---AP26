"""
Twilio implementation of IWhatsAppGateway (Async).
Falha silenciosa: exceções são logadas mas nunca propagadas para o caller.
Usa asyncio.to_thread para não bloquear o loop assíncrono.
"""
import asyncio
import logging

from app.infrastructure.settings import settings
from app.use_cases.interfaces import IWhatsAppGateway

logger = logging.getLogger(__name__)

MENSAGEM_TEMPLATE = (
    "Olá, {nome}! 👋\n\n"
    "Seu agendamento na *Marlon Barber Shop* foi registrado com sucesso!\n\n"
    "✂️ Serviço: {servico}\n"
    "📅 Data: {data}\n"
    "🕐 Horário: {hora}\n\n"
    "Qualquer dúvida, responda esta mensagem. Te esperamos! 💈"
)


def _enviar_sincrono(telefone: str, body: str) -> None:
    """Função bloqueante que envia via Twilio"""
    from twilio.rest import Client
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        from_=f"whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}",
        to=f"whatsapp:+55{telefone}",
        body=body,
    )


class TwilioWhatsAppGateway(IWhatsAppGateway):
    async def enviar_confirmacao(self, telefone: str, dados: dict) -> None:
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            logger.warning("Twilio não configurado. Pulando envio de WhatsApp.")
            return

        try:
            data_hora = dados.get("data_hora")
            body = MENSAGEM_TEMPLATE.format(
                nome=dados.get("nome", ""),
                servico=dados.get("servico", ""),
                data=data_hora.strftime("%d/%m/%Y") if data_hora else "",
                hora=data_hora.strftime("%H:%M") if data_hora else "",
            )
            # Executa a chamada de rede bloqueante em uma thread separada
            await asyncio.to_thread(_enviar_sincrono, telefone, body)
            logger.info("WhatsApp enviado para +55%s", telefone)
        except Exception as e:
            logger.error("Falha ao enviar WhatsApp para %s: %s", telefone, e)
