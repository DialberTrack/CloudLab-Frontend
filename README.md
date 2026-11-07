# CloudLab Frontend

Interfaz web de CloudLab basada en React 19, TypeScript, Vite, Tailwind CSS y
TanStack Query. Incluye autenticación, catálogo de imágenes, workspaces, perfil y
administración de usuarios con rol `admin`.

## Requisitos y desarrollo

- Node.js 20 o superior.
- pnpm 12.15.0.

```bash
cd frontend
pnpm install
pnpm dev
```

La API debe estar disponible en `http://localhost:8000`. En desarrollo Vite
reenvía `/api` a ese servidor (mismo origen, así la cookie de refresh funciona
sin CORS), por lo que no hace falta configurar nada. Para apuntar a otra API,
define `VITE_API_URL`; si no se define, el cliente usa `/api`.

## Scripts

| Comando        | Uso                                   |
| -------------- | ------------------------------------- |
| `pnpm dev`     | Servidor de desarrollo Vite           |
| `pnpm build`   | Comprobación TypeScript y compilación |
| `pnpm lint`    | Ejecutar Oxlint                       |
| `pnpm preview` | Previsualizar la compilación          |

## Rutas

| Ruta                      | Descripción                                           |
| ------------------------- | ----------------------------------------------------- |
| `/login`                  | Inicio de sesión (solo visitantes)                    |
| `/`                       | Resumen de workspaces                                 |
| `/images`                 | Catálogo; **Usar en workspace** abre el modal de alta |
| `/workspaces`             | Listado paginado con búsqueda y operaciones           |
| `/workspaces/:id`         | Detalle, operaciones y métricas Docker                |
| `/workspaces/:id/desktop` | Escritorio KasmVNC en iframe                          |
| `/profile`                | Perfil y cambio de contraseña                         |
| `/admin/users`            | Gestión de usuarios (rol `admin`)                     |
| `/admin/users/:id`        | Detalle de usuario y sus workspaces                   |
| `/admin/workspaces`       | Inventario global de workspaces                       |
| `/admin/images`           | Gestión del catálogo de imágenes                      |

Las rutas `/admin/*` requieren rol `admin`. Los administradores también pueden
usar imágenes inactivas para crear workspaces (con fines de prueba). Los
listados paginados guardan la página y la búsqueda en la URL (`?page=2&q=texto`).

## Estructura

```
src/
├── app/            Providers, router (carga diferida), guards, QueryClient
├── layouts/        AppLayout (sidebar y header) y navigation.ts
├── shared/
│   ├── api/        Cliente HTTP, sesión/refresh, errores y tipos de paginación
│   ├── hooks/      useListParams, useErrorMessage
│   ├── ui/         Alert, Modal, Fields, Pagination, QueryContent, confirm...
│   ├── lib/        Formato de fechas y bytes, cx
│   └── config/     routes.ts (rutas como constantes)
├── features/
│   ├── auth/             Login, perfil, AuthContext
│   ├── workspaces/       Listado, detalle, escritorio remoto, vista admin
│   ├── users/            Administración de usuarios
│   ├── container-images/ Catálogo y su administración
│   └── dashboard/        Resumen
└── styles/         CSS por dominio (base, layout, ui, auth, workspaces)
```

Cada feature sigue el mismo patrón:

| Archivo        | Responsabilidad                                    |
| -------------- | -------------------------------------------------- |
| `types.ts`     | Tipos según `openapi.yaml`                         |
| `api.ts`       | Una función por endpoint, sin lógica de UI         |
| `keys.ts`      | Claves de caché de TanStack Query                  |
| `queries.ts`   | Hooks de lectura                                   |
| `mutations.ts` | Hooks de escritura; invalidan la caché al terminar |
| `components/`  | Piezas de UI propias del dominio                   |
| `pages/`       | Pantallas que conectan hooks y componentes         |

`workspaces` incluye además `rules.ts` (acciones permitidas por estado),
`presentation.ts` (etiquetas y colores) y `desktop/` (iframe y calidad KasmVNC).

Reglas de dependencia: `shared` no importa de `features` ni de `app`; una
feature usa `shared` y, puntualmente, otras features; `app` y `layouts`
ensamblan el conjunto. El alias `@/` apunta a `src/`.

## Datos y API

Las páginas no hacen `fetch`: usan los hooks de cada feature y pintan con
`QueryContent` (cargando, error, vacío, datos).

```
Page → hook (queries/mutations) → api.ts → shared/api/http.ts → backend
```

- El cliente desempaqueta `{ data }`, devuelve `{ items, pagination }` en los
  listados y lanza siempre `ApiError`.
- El access token se mantiene en memoria. Las solicitudes incluyen credenciales
  para usar la cookie HTTP-only de refresh. Ante un 401 se renueva el token con
  una sola petición compartida y, si falla, se cierra la sesión local.
- Los permisos se validan en el backend por rol. El frontend solo oculta o
  deshabilita acciones según el rol y el estado del workspace
  (`workspaces/rules.ts`).
- El backend es un servicio independiente: configura su URL mediante
  `VITE_API_URL` y no se comparte código fuente ni dependencias entre ambos
  repositorios.

### Pendientes respecto a `openapi.yaml`

- `POST /workspaces/{id}/container-session` lo usa el escritorio remoto pero no
  está documentado.
- `GET /admin/workspaces` no filtra por usuario; el detalle de usuario recorre
  las páginas y filtra en cliente.
- A futuro: un endpoint con los permisos del usuario autenticado para sustituir
  las comprobaciones `role === 'admin'` (en `app/guards.tsx`, `AppLayout` e
  `ImagesPage`).

Para publicar `dist` detrás de Nginx junto con el backend, consulta
[`README-DEPLOYMENT.md`](README-DEPLOYMENT.md).
