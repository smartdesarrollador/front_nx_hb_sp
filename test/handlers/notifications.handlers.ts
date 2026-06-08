import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000'

const mockNotification = {
  id: 'n1',
  title: 'Bienvenido al Hub',
  message: 'Tu cuenta está lista',
  category: 'system',
  read: false,
  created_at: '2026-03-01T00:00:00Z',
}

export const notificationsHandlers = [
  http.get(`${API}/api/v1/app/notifications/`, () => HttpResponse.json([mockNotification])),

  http.post(`${API}/api/v1/app/notifications/:id/read/`, () =>
    HttpResponse.json({ message: 'Marked as read' }),
  ),

  http.post(`${API}/api/v1/app/notifications/read-all/`, () =>
    HttpResponse.json({ message: 'All marked as read' }),
  ),
]
