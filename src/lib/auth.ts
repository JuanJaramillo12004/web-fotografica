import type { Credentials, LoginResult, Role, Session, User } from '../types/auth'

const STORAGE_KEY = 'web-fotografica.session'

/** Duración de la sesión simulada: 8 horas. */
const SESSION_TTL_MS = 8 * 60 * 60 * 1000

/** Latencia artificial para que los estados de carga sean reales en desarrollo. */
const MOCK_LATENCY_MS = 450

interface DemoAccount extends User {
  password: string
}

const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    id: 'usr_admin',
    name: 'Juan Eduardo Jaramillo',
    email: 'admin@webfotografica.test',
    password: 'admin1234',
    role: 'admin',
  },
  {
    id: 'usr_client',
    name: 'Cliente de Prueba',
    email: 'cliente@webfotografica.test',
    password: 'cliente1234',
    role: 'client',
  },
]

/** Credenciales de demostración para poder mostrarlas en el formulario de login. */
export const DEMO_CREDENTIALS = DEMO_ACCOUNTS.map(({ email, password, role }) => ({
  email,
  password,
  role,
}))

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function createToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function isRole(value: unknown): value is Role {
  return value === 'admin' || value === 'client'
}

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false

  const candidate = value as Record<string, unknown>
  if (typeof candidate.token !== 'string' || candidate.token.length === 0) return false
  if (typeof candidate.expiresAt !== 'number' || !Number.isFinite(candidate.expiresAt)) return false

  const user = candidate.user
  if (typeof user !== 'object' || user === null) return false

  const candidateUser = user as Record<string, unknown>
  return (
    typeof candidateUser.id === 'string' &&
    typeof candidateUser.name === 'string' &&
    typeof candidateUser.email === 'string' &&
    isRole(candidateUser.role)
  )
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // localStorage puede lanzar en modo privado o con cookies bloqueadas.
  }
}

function persistSession(session: Session): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Si no se puede persistir, la sesión sigue viva en memoria.
  }
}

/**
 * Recupera la sesión persistida. Descarta sesiones corruptas o caducadas en
 * lugar de confiar en lo que haya en el almacenamiento.
 */
export function readSession(): Session | null {
  let raw: string | null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }

  if (raw === null) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    clearSession()
    return null
  }

  if (!isSession(parsed)) {
    clearSession()
    return null
  }

  if (parsed.expiresAt <= Date.now()) {
    clearSession()
    return null
  }

  return parsed
}

export async function login({ email, password }: Credentials): Promise<LoginResult> {
  await delay(MOCK_LATENCY_MS)

  const normalizedEmail = email.trim().toLowerCase()
  const account = DEMO_ACCOUNTS.find((candidate) => candidate.email === normalizedEmail)

  if (!account || account.password !== password) {
    return { ok: false, message: 'Email o contraseña incorrectos.' }
  }

  const user: User = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  }

  const session: Session = {
    user,
    token: createToken(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  }

  persistSession(session)

  return { ok: true, session }
}

export function logout(): void {
  clearSession()
}
