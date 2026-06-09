export interface ITokenStorage {
  saveToken(token: string): void;
  getToken(): string | null;
  removeToken(): void;
  isAuthenticated(): boolean;
}
