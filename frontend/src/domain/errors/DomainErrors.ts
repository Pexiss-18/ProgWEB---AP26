export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValorInvalidoError extends DomainError {}
export class TransicaoStatusInvalidaError extends DomainError {}
export class ValidationError extends DomainError {}
export class AgendamentoPassadoError extends DomainError {}
export class ServicoInativoError extends DomainError {}
export class SlotIndisponivelError extends DomainError {}
export class ServicoComAgendamentosFuturosError extends DomainError {}
