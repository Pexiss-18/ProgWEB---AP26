export interface IAdminRepository {
  login(email: string, senha: string): Promise<string>;
}
