import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000'

const mockMember = {
  id: 'm1',
  email: 'member@acme.com',
  name: 'Team Member',
  role: 'member',
  is_active: true,
  last_login: null,
  created_at: '2026-01-01T00:00:00Z',
}

export const teamHandlers = [
  http.get(`${API}/api/v1/admin/users/`, () => HttpResponse.json({ users: [mockMember] })),

  http.post(`${API}/api/v1/admin/users/invite/`, () =>
    HttpResponse.json({ message: 'Invitation sent' }, { status: 201 }),
  ),

  http.post(`${API}/api/v1/admin/users/:id/suspend/`, () =>
    HttpResponse.json({ message: 'User suspended' }),
  ),

  http.delete(`${API}/api/v1/admin/users/:id/`, () => new HttpResponse(null, { status: 204 })),
]
