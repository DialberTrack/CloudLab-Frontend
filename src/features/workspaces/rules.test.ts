import { describe, expect, it } from 'vitest';
import { getActionAvailability, getActionState, isTransitional } from './rules';

describe('reglas de acciones de workspaces', () => {
  it('considera transitorios solo creating y deleting', () => {
    expect(isTransitional('creating')).toBe(true);
    expect(isTransitional('deleting')).toBe(true);
    expect(isTransitional('running')).toBe(false);
    expect(isTransitional('stopped')).toBe(false);
    expect(isTransitional('error')).toBe(false);
  });

  it('bloquea todas las acciones mientras el workspace cambia de estado', () => {
    for (const action of ['start', 'stop', 'restart', 'retry', 'delete'] as const) {
      expect(getActionAvailability('creating', action).allowed).toBe(false);
      expect(getActionAvailability('deleting', action).allowed).toBe(false);
    }
  });

  it('solo permite iniciar un workspace que no está activo', () => {
    expect(getActionAvailability('stopped', 'start').allowed).toBe(true);
    expect(getActionAvailability('running', 'start').allowed).toBe(false);
  });

  it('solo permite detener un workspace que no está detenido', () => {
    expect(getActionAvailability('running', 'stop').allowed).toBe(true);
    expect(getActionAvailability('stopped', 'stop').allowed).toBe(false);
  });

  it('solo permite reiniciar un workspace activo', () => {
    expect(getActionAvailability('running', 'restart').allowed).toBe(true);
    expect(getActionAvailability('stopped', 'restart').allowed).toBe(false);
  });

  it('solo permite reintentar un workspace con error', () => {
    expect(getActionAvailability('error', 'retry').allowed).toBe(true);
    expect(getActionAvailability('running', 'retry').allowed).toBe(false);
  });

  it('permite eliminar en cualquier estado estable', () => {
    for (const status of ['running', 'stopped', 'error'] as const) {
      expect(getActionAvailability(status, 'delete').allowed).toBe(true);
    }
  });

  it('deshabilita el botón y explica el motivo cuando la acción no aplica', () => {
    expect(getActionState('running', 'start')).toEqual({
      disabled: true,
      title: 'El workspace ya está activo',
    });
  });

  it('deshabilita el botón mientras hay una operación en curso', () => {
    expect(getActionState('stopped', 'start', true)).toEqual({
      disabled: true,
      title: undefined,
    });
  });
});
