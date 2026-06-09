import { ValidationError } from "../errors/DomainErrors";

export class Email {
  readonly valor: string;

  constructor(valor: string) {
    const emailLimpo = valor.trim();
    if (!Email.validar(emailLimpo)) {
      throw new ValidationError(`E-mail inválido: ${valor}`);
    }
    this.valor = emailLimpo.toLowerCase();
    Object.freeze(this);
  }

  static validar(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}
