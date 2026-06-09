import { IAdminRepository } from "../../domain/repositories/IAdminRepository";
import { HttpClient } from "../http/HttpClient";

export class HttpAdminRepository implements IAdminRepository {
  constructor(private http: HttpClient) {}

  async login(email: string, senha: string): Promise<string> {
    const data = await this.http.request<{ access_token: string }>("/api/admin/login", {
      method: "POST",
      body: { email, senha },
    });
    return data.access_token;
  }
}
