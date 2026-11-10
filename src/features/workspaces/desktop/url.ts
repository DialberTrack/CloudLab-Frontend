/** URL del escritorio KasmVNC de un workspace (servido por el proxy inverso). */
export const desktopUrl = (workspaceId: string) =>
  `/workspace/${workspaceId}/?path=workspace/${workspaceId}/websockify&resize=remote`;

/** URL de la terminal ttyd de un workspace (servida por el proxy inverso). */
export const terminalUrl = (workspaceId: string) => `/terminal/${workspaceId}/`;
