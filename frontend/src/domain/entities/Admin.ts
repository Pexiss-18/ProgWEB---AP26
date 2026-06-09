import { Entity } from "./Entity";
import { Email } from "../value-objects/Email";

interface AdminProps {
  email: Email;
}

export class Admin extends Entity<AdminProps> {
  constructor(props: AdminProps, id?: number, criadoEm?: Date) {
    super(props, id, criadoEm);
  }

  get email(): Email {
    return this.props.email;
  }
}
