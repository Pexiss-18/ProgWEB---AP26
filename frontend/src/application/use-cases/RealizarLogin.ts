import { IAdminRepository } from "@/domain/repositories/IAdminRepository";
import { Email } from "@/domain/value-objects/Email";

export class RealizarLogin {
  constructor(private adminRepo: IAdminRepository) {}

  async execute(emailRaw: string, senhaRaw: string): Promise<string> {
    const email = new Email(emailRaw);
    return await this.adminRepo.login(email.valor, senhaRaw);
  }
}
