// Path: packages/api-client/src/index.ts
// Cliente HTTP compartilhado (web). Sem dependências externas.

export interface ApiClientOptions {
  baseUrl: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ErrorEnvelope {
  error?: { message?: string; code?: string }
}

export function createApiClient(options: ApiClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/+$/, '')

  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const headers = new Headers(init.headers)
    if (init.body !== undefined && !headers.has('content-type')) {
      headers.set('content-type', 'application/json')
    }

    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers
    })

    if (!res.ok) {
      let message = 'Erro inesperado'
      let code = 'INTERNAL_ERROR'
      try {
        const body = (await res.json()) as ErrorEnvelope
        if (body.error?.message) message = body.error.message
        if (body.error?.code) code = body.error.code
      } catch {
        // corpo não-JSON: mantém mensagem padrão
      }
      throw new ApiError(message, res.status, code)
    }

    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  }

  return {
    request,
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' })
  }
}
