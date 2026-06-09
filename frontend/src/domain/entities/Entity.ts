export abstract class Entity<Props> {
  readonly id?: number;
  readonly criadoEm?: Date;
  protected props: Props;

  constructor(props: Props, id?: number, criadoEm?: Date) {
    this.props = props;
    this.id = id;
    this.criadoEm = criadoEm ?? new Date();
  }

  equals(objeto?: Entity<Props>): boolean {
    if (objeto === null || objeto === undefined) {
      return false;
    }
    if (this === objeto) {
      return true;
    }
    if (this.id === undefined || objeto.id === undefined) {
      return false;
    }
    return this.id === objeto.id;
  }
}
