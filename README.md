# CloudLab Frontend

Interfaz web de CloudLab basada en React 19, TypeScript, Vite y Tailwind CSS.
Incluye login, sesión con refresh token, workspaces, catálogo de imágenes,
perfil y administración para usuarios con rol `admin`.

## Requisitos

- Node.js 20 o superior.
- pnpm 12.15.0.

## Desarrollo

```bash
cd frontend
pnpm install
pnpm dev
```

Vite mostrará la URL local en la terminal y habilitará recarga en caliente.

La API debe estar disponible en `http://localhost:8000`. Puedes cambiarla con:

```bash
VITE_API_URL=http://localhost:8000/api pnpm dev
```

## Scripts

| Comando | Uso |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Comprobación TypeScript y compilación de producción |
| `pnpm lint` | Ejecutar Oxlint |
| `pnpm preview` | Previsualizar la compilación |

## Estructura

- `src/App.tsx`: componente raíz de la pantalla actual.
- `src/App.css` y `src/index.css`: estilos.
- `src/main.tsx`: punto de entrada React.
- `src/assets/`: imágenes y recursos estáticos.
- `public/`: archivos servidos sin transformación.

El access token se mantiene en memoria; las solicitudes incluyen credenciales para
usar la cookie HTTP-only de refresh. La API y su contrato están documentados en
[`../backend/doc/README.md`](../backend/doc/README.md).
