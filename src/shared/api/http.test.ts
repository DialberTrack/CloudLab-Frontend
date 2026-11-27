import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, NETWORK_ERROR_CODE } from './errors';
import { http } from './http';

const session = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
  notifySessionExpired: vi.fn(),
  refreshSession: vi.fn(),
}));

vi.mock('./session', () => session);

const fetchMock = vi.fn();
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status }); // arma una respuesta falsa

describe('cliente HTTP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    session.getAccessToken.mockReturnValue(null);
    session.refreshSession.mockResolvedValue(null);
  });

  it('devuelve el contenido de { data } en las lecturas', async () => {
    fetchMock.mockResolvedValue(reply({ data: { id: 1 } }));

    await expect(http.get('/workspaces/1')).resolves.toEqual({ id: 1 });
  });

  it('devuelve items y pagination en las listas paginadas', async () => {
    fetchMock.mockResolvedValue(reply({ data: [{ id: 1 }], pagination: { page: 1, total: 1 } }));

    await expect(http.page('/workspaces')).resolves.toEqual({
      items: [{ id: 1 }],
      pagination: { page: 1, total: 1 },
    });
  });

  it('envía el token de acceso como cabecera Bearer', async () => {
    session.getAccessToken.mockReturnValue('token-abc');
    fetchMock.mockResolvedValue(reply({ data: null }));

    await http.get('/auth/me');

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer token-abc');
  });

  it('maneja una respuesta 204 sin leer el cuerpo con .json()', async () => {
    const response = new Response(null, { status: 204 });
    const jsonSpy = vi.spyOn(response, 'json');
    fetchMock.mockResolvedValue(response);

    await expect(http.remove('/workspaces/1')).resolves.toBeUndefined();

    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it('reintenta una sola vez tras un 401 si la sesión se renueva', async () => {
    fetchMock
      .mockResolvedValueOnce(reply({ error: 'Token vencido' }, 401))
      .mockResolvedValueOnce(reply({ data: 'ok' }));
    session.refreshSession.mockResolvedValue('token-nuevo');

    await expect(http.get('/workspaces')).resolves.toBe('ok');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(session.refreshSession).toHaveBeenCalledTimes(1);
  });

  it('no entra en bucle si el reintento también devuelve 401', async () => {
    fetchMock.mockResolvedValue(reply({ error: 'Token inválido' }, 401));
    session.refreshSession.mockResolvedValue('token-nuevo');

    await expect(http.get('/workspaces')).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(session.refreshSession).toHaveBeenCalledTimes(1);
  });

  it('avisa que la sesión expiró cuando no se puede renovar', async () => {
    fetchMock.mockResolvedValue(reply({ error: 'Sesión expirada' }, 401));
    session.refreshSession.mockResolvedValue(null);

    await expect(http.get('/workspaces')).rejects.toBeInstanceOf(ApiError);

    expect(session.notifySessionExpired).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('no intenta renovar la sesión en endpoints sin autenticación', async () => {
    fetchMock.mockResolvedValue(reply({ error: 'Credenciales inválidas' }, 401));

    await expect(http.post('/auth/login', {}, { auth: false })).rejects.toBeInstanceOf(ApiError);

    expect(session.refreshSession).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('convierte el error de la API en ApiError con mensaje, estado y código', async () => {
    fetchMock.mockResolvedValue(reply({ error: 'Correo duplicado', code: 'EMAIL_IN_USE' }, 409));

    await expect(http.post('/users', {})).rejects.toMatchObject({
      message: 'Correo duplicado',
      status: 409,
      code: 'EMAIL_IN_USE',
    });
  });

  it('usa un mensaje genérico cuando la API no envía uno', async () => {
    fetchMock.mockResolvedValue(reply({}, 500));

    await expect(http.get('/workspaces')).rejects.toMatchObject({
      message: 'No se pudo completar la solicitud.',
      status: 500,
    });
  });

  it('informa un error de red cuando fetch falla', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(http.get('/workspaces')).rejects.toMatchObject({
      status: 0,
      code: NETWORK_ERROR_CODE,
    });
  });
});
