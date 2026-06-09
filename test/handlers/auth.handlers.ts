import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000'

const mockUser = {
  id: 'u1',
  email: 'user@acme.com',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  roles: ['Owner'],
  permissions: [],
  status: 'active',
  mfaEnabled: false,
  tenantId: 't1',
  lastLogin: null,
  createdAt: '2026-01-01T00:00:00Z',
}

const mockTenant = {
  id: 't1',
  name: 'Acme Corp',
  subdomain: 'acme',
  plan: 'professional',
}

const loginResponse = {
  access_token: 'mock-hub-access-token',
  refresh_token: 'mock-hub-refresh-token',
  user: mockUser,
  tenant: mockTenant,
}

export const authHandlers = [
  // AuthContext.login() llama /auth/login (sin trailing slash)
  http.post(`${API}/api/v1/auth/login`, () => HttpResponse.json(loginResponse)),
  // Compatibilidad con otros usos que puedan tener trailing slash
  http.post(`${API}/api/v1/auth/login/`, () => HttpResponse.json(loginResponse)),

  // AuthContext.register() llama /auth/register (sin trailing slash)
  http.post(`${API}/api/v1/auth/register`, () =>
    HttpResponse.json({ message: 'Registration successful' }, { status: 201 }),
  ),
  http.post(`${API}/api/v1/auth/register/`, () =>
    HttpResponse.json({ message: 'Registration successful' }, { status: 201 }),
  ),

  // AuthContext.logout() llama /auth/logout (sin trailing slash via apiClient)
  http.post(`${API}/api/v1/auth/logout`, () => new HttpResponse(null, { status: 204 })),
  http.post(`${API}/api/v1/auth/logout/`, () => new HttpResponse(null, { status: 204 })),

  // AuthContext session restore llama /auth/refresh-token (sin trailing slash)
  http.post(`${API}/api/v1/auth/refresh-token`, () =>
    HttpResponse.json({
      access_token: 'mock-hub-access-token-refreshed',
      refresh_token: 'mock-hub-refresh-token-refreshed',
    }),
  ),
  // axios interceptor también puede usar /auth/token/refresh/
  http.post(`${API}/api/v1/auth/token/refresh/`, () =>
    HttpResponse.json({
      access_token: 'mock-hub-access-token-refreshed',
      refresh_token: 'mock-hub-refresh-token-refreshed',
    }),
  ),

  http.post(`${API}/api/v1/auth/forgot-password`, () => HttpResponse.json({ message: 'Email sent' })),
  http.post(`${API}/api/v1/auth/verify-email`, () =>
    HttpResponse.json({ message: 'Email verified successfully.' }),
  ),
  http.post(`${API}/api/v1/auth/resend-verification`, () =>
    HttpResponse.json({ message: 'If your email is registered and unverified, a new link has been sent.' }),
  ),
]
