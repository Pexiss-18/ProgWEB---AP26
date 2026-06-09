import { ITokenStorage } from "@/domain/repositories/ITokenStorage";

export class LocalStorageTokenStorage implements ITokenStorage {
  private readonly KEY = "marlon_admin_token";

  saveToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.KEY, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.KEY);
    }
    return null;
  }

  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.KEY);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
