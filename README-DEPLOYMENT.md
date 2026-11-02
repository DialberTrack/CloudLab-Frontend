# CloudLab — Despliegue actual

Esta guía describe la instalación de producción de CloudLab usando dos
repositorios independientes:

- Backend REST ejecutándose en `127.0.0.1:8000`.
- Frontend compilado como archivos estáticos en `frontend/dist`.
- Nginx sirviendo el frontend y haciendo proxy de `/api/` y `/workspace/`.
- MariaDB y Redis gestionados con Docker Compose.
- Contenedores de usuario en `cloudlab-network-aislada`.

El backend y el frontend no comparten código ni dependencias. El único contrato
entre ambos es HTTP.

## 1. Requisitos del servidor

- Linux.
- Node.js 20 o superior.
- pnpm 12.15.0.
- Docker y Docker Compose.
- Nginx.
- Un usuario de despliegue con permisos para administrar Docker.

Ejemplo de rutas usadas en este documento:

```text
/var/www/cloudlab/backend
/var/www/cloudlab/frontend
/var/www/cloudlab/frontend/dist
```

Puedes usar otras rutas, pero deben coincidir con `root` y `proxy_pass` de Nginx.

## 2. Obtener los repositorios

Clona cada repositorio por separado:

```bash
mkdir -p /var/www/cloudlab
cd /var/www/cloudlab
git clone <URL_DEL_BACKEND> backend
git clone <URL_DEL_FRONTEND> frontend
```

No instales el frontend desde el directorio del backend ni al revés.

## 3. Configurar el backend

```bash
cd /var/www/cloudlab/backend
pnpm install --frozen-lockfile
cp .env.example .env
```

Si no existe `.env.example`, crea `.env` con valores reales y secretos únicos:

```dotenv
NODE_ENV=production
LOG_LEVEL=info
LOG_FORMAT=json
APP_HOST=127.0.0.1
APP_PORT=8000
FRONTEND_URLS=http://cloudlab.local
DB_HOST=127.0.0.1
DB_USER=cloudlab
DB_PASSWORD=<CLAVE_DE_BASE_DE_DATOS>
DB_NAME=cloudlab
REDIS_URL=redis://127.0.0.1:6379
WORKSPACE_SESSION_TTL_SECONDS=900
WORKSPACE_BASIC_AUTH_USERNAME=kasm_user
JWT_SECRET=<SECRETO_LARGO_Y_UNICO>
JWT_REFRESH_SECRET=<OTRO_SECRETO_LARGO_Y_UNICO>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
MAX_REFRESH_TOKENS_PER_USER=5
```

Genera y almacena los secretos fuera del repositorio. `FRONTEND_URLS` debe
contener todos los orígenes reales del frontend, separados por comas.

## 4. Iniciar MariaDB y Redis

Desde el repositorio backend:

```bash
cd /var/www/cloudlab/backend
export DB_ROOT_PASSWORD='<CLAVE_ROOT>'
export DB_NAME='cloudlab'
export DB_USER='cloudlab'
export DB_PASSWORD='<CLAVE_DE_BASE_DE_DATOS>'
docker compose up -d mariadb redis
docker compose ps
```

Los servicios solo se publican en `127.0.0.1`:

- MariaDB: `127.0.0.1:3306`.
- Redis: `127.0.0.1:6379`.

Los volúmenes `mariadb_data` y `redis_data` deben conservarse. Los scripts de
`db/init/` se ejecutan solamente al inicializar MariaDB por primera vez.

## 5. Crear la red aislada de workspaces

Créala una sola vez:

```bash
docker network inspect cloudlab-network-aislada >/dev/null 2>&1 || \
docker network create --driver bridge --subnet 172.30.0.0/16 cloudlab-network-aislada
```

El backend verifica que esta red exista antes de crear un workspace. No conectes
esta red a MariaDB, Redis ni a otros servicios internos.

### Firewall obligatorio

Docker puede insertar reglas que permitan acceso a redes privadas. Configura el
firewall del host en `DOCKER-USER` para permitir solo DNS, HTTP y HTTPS de
salida, y bloquear LAN, host, gateway Docker y otros contenedores. Aplica reglas
equivalentes para IPv6 o deshabilita IPv6 de forma controlada.

La política debe comprobarse desde un workspace:

```bash
curl -I https://example.com
curl --connect-timeout 3 http://192.168.1.1
curl --connect-timeout 3 http://172.30.0.1
```

El primer comando debe funcionar; los dos últimos deben fallar.

## 6. Compilar y publicar el frontend

Ejecuta estos comandos dentro del repositorio frontend:

```bash
cd /var/www/cloudlab/frontend
pnpm install --frozen-lockfile
pnpm build
```

La compilación genera `dist/`. Nginx debe servir esa carpeta:

```text
/var/www/cloudlab/frontend/dist
```

No uses `pnpm dev` en producción. Después de cada actualización, valida que
`dist/index.html` y `dist/assets/` existan antes de recargar Nginx.

## 7. Ejecutar el backend

Compila y valida desde el repositorio backend:

```bash
cd /var/www/cloudlab/backend
pnpm typecheck
pnpm test
pnpm build
```

Ejecuta `dist/app.js` con el gestor de procesos elegido por la infraestructura,
por ejemplo systemd, y haz que escuche solo en `127.0.0.1:8000`. Nginx será el
único punto público.

## 8. Configurar Nginx

Instala la configuración del servidor usando como referencia `nginx.conf` del
repositorio backend. Debe cumplir estas condiciones:

- `root /var/www/cloudlab/frontend/dist`.
- `/api/` hace proxy a `http://127.0.0.1:8000`.
- `/workspace/<uuid>/...` valida la sesión mediante
  `/api/internal/workspace-auth`.
- El proxy de workspace conserva Upgrade/Connection para WebSocket.
- La ruta `/` usa fallback a `/index.html` para React Router.

Valida y recarga:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 9. Orden de actualización

```text
1. Actualizar backend y ejecutar typecheck, tests y build.
2. Reiniciar el proceso del backend.
3. Actualizar frontend y ejecutar build.
4. Confirmar que frontend/dist contiene la nueva compilación.
5. Validar nginx -t y recargar Nginx.
6. Probar login, imágenes, creación de workspace y escritorio KasmVNC.
```

## 10. Checklist

- `.env` existe solo en el servidor y no está versionado.
- MariaDB y Redis están saludables.
- `cloudlab-network-aislada` existe.
- El firewall bloquea redes privadas y otros contenedores.
- El backend escucha solo en `127.0.0.1:8000`.
- `frontend/dist/index.html` existe.
- Nginx usa el `root` correcto.
- `/api/` responde mediante proxy.
- `/workspace/<uuid>/...` permite el escritorio y WebSocket.
- No se montó `docker.sock` en ningún contenedor de usuario.
