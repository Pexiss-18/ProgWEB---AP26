import {
  DomainError,
  ValorInvalidoError,
  TransicaoStatusInvalidaError,
  ValidationError,
  AgendamentoPassadoError,
  ServicoInativoError,
  SlotIndisponivelError,
  ServicoComAgendamentosFuturosError,
} from "../../domain/errors/DomainErrors";

export interface HttpRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

function mapToDomainError(status: number, message: string): Error {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("inativo") || lowerMsg.includes("inativa")) {
    return new ServicoInativoError(message);
  }
  if (lowerMsg.includes("passou") || lowerMsg.includes("passado")) {
    return new AgendamentoPassadoError(message);
  }
  if (
    lowerMsg.includes("transição") ||
    lowerMsg.includes("transicao") ||
    lowerMsg.includes("status")
  ) {
    return new TransicaoStatusInvalidaError(message);
  }
  if (
    lowerMsg.includes("preço") ||
    lowerMsg.includes("preco") ||
    lowerMsg.includes("slot_size") ||
    lowerMsg.includes("positivo")
  ) {
    return new ValorInvalidoError(message);
  }
  if (
    lowerMsg.includes("horário acabou de ser reservado") ||
    lowerMsg.includes("slot") ||
    lowerMsg.includes("indisponível") ||
    lowerMsg.includes("indisponivel")
  ) {
    return new SlotIndisponivelError(message);
  }
  if (lowerMsg.includes("agendamentos futuros") || lowerMsg.includes("futuros")) {
    return new ServicoComAgendamentosFuturosError(message);
  }
  if (
    status === 422 ||
    lowerMsg.includes("inválido") ||
    lowerMsg.includes("invalido") ||
    lowerMsg.includes("validation") ||
    lowerMsg.includes("validação") ||
    lowerMsg.includes("validacao")
  ) {
    return new ValidationError(message);
  }

  if (status >= 400 && status < 500) {
    return new DomainError(message);
  }

  return new Error(message);
}

export class HttpClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  }

  async request<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const config: RequestInit = {
      method: options.method ?? "GET",
      headers,
    };

    if (options.body !== undefined) {
      config.body = JSON.stringify(options.body);
    }

    const res = await fetch(url, config);
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      
      let errorMsg = "Erro na requisição HTTP";
      if (errorBody.detail) {
        if (typeof errorBody.detail === "string") {
          errorMsg = errorBody.detail;
        } else if (Array.isArray(errorBody.detail)) {
          errorMsg = errorBody.detail
            .map((err: any) => `${err.loc?.join(".") || "field"}: ${err.msg}`)
            .join("; ");
        } else {
          errorMsg = JSON.stringify(errorBody.detail);
        }
      } else if (res.statusText) {
        errorMsg = res.statusText;
      }

      throw mapToDomainError(res.status, errorMsg);
    }

    return res.json() as Promise<T>;
  }
}
