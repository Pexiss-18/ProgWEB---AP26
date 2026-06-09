import { Entity } from "./Entity";
import { Preco } from "../value-objects/Preco";
import { ValorInvalidoError } from "../errors/DomainErrors";

interface ServicoProps {
  nome: string;
  preco: Preco;
  slotSize: number; // 1 = 30min, 2 = 60min
  ativo: boolean;
}

export class Servico extends Entity<ServicoProps> {
  constructor(props: ServicoProps, id?: number, criadoEm?: Date) {
    if (props.slotSize !== 1 && props.slotSize !== 2) {
      throw new ValorInvalidoError(
        `slotSize deve ser 1 (30min) ou 2 (60min). Recebido: ${props.slotSize}`
      );
    }
    super(props, id, criadoEm);
  }

  get nome(): string {
    return this.props.nome;
  }

  get preco(): Preco {
    return this.props.preco;
  }

  get slotSize(): number {
    return this.props.slotSize;
  }

  get ativo(): boolean {
    return this.props.ativo;
  }

  get duracaoMinutos(): number {
    return this.props.slotSize * 30;
  }
}
