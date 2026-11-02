# CloudLab Frontend

Interfaz web de CloudLab basada en React 19, TypeScript, Vite y Tailwind CSS.
Incluye autenticación, catálogo de imágenes, workspaces, perfil y administración
de usuarios con rol `admin`.

## Requisitos y desarrollo

- Node.js 20 o superior.
- pnpm 12.15.0.

```bash
cd frontend
pnpm install
VITE_API_URL=http://localhost:8000/api pnpm dev
```

La API debe estar disponible en `http://localhost:8000`. Si no se define
`VITE_API_URL`, el cliente usa `/api`.

## Scripts

| Comando | Uso |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo Vite |
| `pnpm build` | Comprobación TypeScript y compilación |
| `pnpm lint` | Ejecutar Oxlint |
| `pnpm preview` | Previsualizar la compilación |

## Flujo de usuario

- `/images` muestra las imágenes disponibles.
- **Usar en workspace** abre un modal para nombrar y crear un workspace.
- `/workspaces` lista y permite operar workspaces existentes.
- `/workspaces/:id/desktop` abre el escritorio KasmVNC dentro de un iframe y
  permite abrirlo en el navegador.
- `/profile` gestiona el perfil y la contraseña.
- Las rutas `/admin/*` requieren rol `admin`.

## Estructura

- `src/app/`: autenticación y enrutado.
- `src/components/`: componentes reutilizables y modales.
- `src/features/workspaces/`: tarjetas, presentación y controles KasmVNC.
- `src/pages/`: pantallas por funcionalidad.
- `src/lib/api.ts`: cliente HTTP.
- `src/types/`: tipos de API.
- `src/index.css` y `src/styles/`: estilos globales.

El access token se mantiene en memoria. Las solicitudes incluyen credenciales para
usar la cookie HTTP-only de refresh. El backend es un servicio independiente:
configura su URL mediante `VITE_API_URL` y no se comparte código fuente ni
dependencias entre ambos repositorios.

Para publicar `dist` detrás de Nginx junto con el backend, consulta
[`README-DEPLOYMENT.md`](README-DEPLOYMENT.md).
