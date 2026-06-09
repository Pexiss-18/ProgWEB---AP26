import { ValorInvalidoError } from "../errors/DomainErrors";

export class Preco {
  readonly valor: number;

  constructor(valor: number) {
    if (valor <= 0) {
      throw new ValorInvalidoError(`Preço deve ser positivo. Recebido: ${valor}`);
    }
    this.valor = valor;
    Object.freeze(this);
  }

  get formatado(): string {
    return this.valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
}
