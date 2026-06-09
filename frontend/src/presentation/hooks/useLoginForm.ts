import { useState } from "react";
import { useRouter } from "next/navigation";
import { RealizarLogin } from "@/application/use-cases/RealizarLogin";
import { ITokenStorage } from "@/domain/repositories/ITokenStorage";

export function useLoginForm(
  realizarLogin: RealizarLogin,
  tokenStorage: ITokenStorage
) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Preencha usuário e senha.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = await realizarLogin.execute(username, password);
      tokenStorage.saveToken(token);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.message && err.message.includes("E-mail inválido")) {
        setError("E-mail com formato inválido.");
      } else {
        setError("Usuário ou senha incorretos.");
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    error,
    handleSignIn,
  };
}
