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
  // Envelope idéntico al de HubNotificationListView. Antes devolvía un array pelado, y
  // esa divergencia con el backend real ocultó durante meses que el hook leía una clave
  // inexistente: el test pasaba por la rama `Array.isArray` mientras la app real
  // mostraba la bandeja siempre vacía.
  http.get(`${API}/api/v1/app/notifications/`, () =>
    HttpResponse.json({
      notifications: [mockNotification],
      pagination: { page: 1, per_page: 20, total: 1 },
    }),
  ),

  http.post(`${API}/api/v1/app/notifications/:id/read/`, () =>
    HttpResponse.json({ message: 'Marked as read' }),
  ),

  http.post(`${API}/api/v1/app/notifications/read-all/`, () =>
    HttpResponse.json({ message: 'All marked as read' }),
  ),
]
