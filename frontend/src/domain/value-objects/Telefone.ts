import { ValidationError } from "../errors/DomainErrors";

export class Telefone {
  readonly valor: string;

  constructor(valor: string) {
    const limpo = valor.replace(/\D/g, "");
    if (!Telefone.validar(limpo)) {
      throw new ValidationError(
        `Telefone deve estar no formato 55 + DDD + número (ex: 5511999999999).`
      );
    }
    this.valor = limpo;
    Object.freeze(this);
  }

  static validar(telefone: string): boolean {
    // Apenas números, iniciando com 55, e tendo 12 ou 13 caracteres (55 + DDD + 8 ou 9 dígitos)
    return /^55\d{10,11}$/.test(telefone);
  }

  get formatado(): string {
    if (this.valor.length === 13) {
      return `+55 (${this.valor.slice(2, 4)}) ${this.valor.slice(4, 9)}-${this.valor.slice(9)}`;
    }
    if (this.valor.length === 12) {
      return `+55 (${this.valor.slice(2, 4)}) ${this.valor.slice(4, 8)}-${this.valor.slice(8)}`;
    }
    return `+${this.valor}`;
  }
}
