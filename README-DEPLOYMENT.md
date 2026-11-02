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

Esta guía parte de un servidor limpio y de un usuario normal con acceso a
`sudo` (por ejemplo, `dialbertrack`). No ejecutes toda la aplicación como
`root`. Verifica los comandos según el sistema operativo elegido.

### 1.1 Paquetes base

Instala con el gestor de paquetes de tu sistema `ca-certificates`, `curl`,
`git`, `nginx` y `unzip`.

### 1.2 Node.js y pnpm

Node.js 20 o superior y pnpm 12 son compatibles. Una instalación sencilla para
Bash es `fnm`; no es obligatorio usarlo:

```bash
curl -fsSL https://fnm.vercel.app/install | bash
source ~/.bashrc
fnm install --lts
fnm default lts-latest
node --version

curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc
pnpm --version

pnpm setup
source ~/.bashrc
```

Si `fnm` no se usa, instala Node.js con el método aprobado por tu
infraestructura. Verifica que `node --version` sea al menos `20` y que
`pnpm --version` sea `12`.

### 1.3 Docker y permisos del usuario

Instala Docker Engine y Docker Compose siguiendo la guía oficial correspondiente
al sistema operativo que elijas:

<https://docs.docker.com/engine/install/>

El cliente Docker necesita acceso a `/var/run/docker.sock`. Agrega el usuario
de despliegue al grupo `docker` y abre una nueva sesión (o usa `newgrp`):

```bash
sudo usermod -aG docker "$USER"
newgrp docker
docker info
docker compose version
```

Si `docker info` todavía muestra `permission denied`, cierra la sesión SSH y
vuelve a entrar. No cambies los permisos del socket con `chmod 666`.

Ejemplo de rutas usadas en este documento:

```text
/var/www/cloudlab/backend
/var/www/cloudlab/frontend
/var/www/cloudlab/frontend/dist
```

Puedes usar otras rutas, pero deben coincidir con `root` y `proxy_pass` de Nginx.

## 2. Obtener los repositorios

`/var/www` normalmente pertenece a `root`, si intentas `mkdir -p
/var/www/cloudlab` falla para un usuario normal. Crea la ruta con `sudo` y
entrega su propiedad al usuario de despliegue antes de clonar:

```bash
sudo install -d -o "$USER" -g "$(id -gn)" /var/www/cloudlab
cd /var/www/cloudlab
git clone https://github.com/DialberTrack/CloudLab-API backend
git clone https://github.com/DialberTrack/CloudLab-Frontend frontend
```

Después de este paso, no uses `sudo` para `git`, `pnpm` ni para editar los
repositorios.

No instales el frontend desde el directorio del backend ni al revés.

## 3. Configurar el backend

```bash
cd /var/www/cloudlab/backend
pnpm install --frozen-lockfile
cp .env.example .env
```

Edita `.env` y conserva los mismos valores de `DB_NAME`, `DB_USER`,
`DB_PASSWORD` y `DB_ROOT_PASSWORD` que usará Docker Compose. Compose lee
automáticamente este archivo para sustituir las variables del
`docker-compose.yml`.

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
DB_ROOT_PASSWORD=<CLAVE_ROOT_DE_MARIADB>
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
Protege el archivo:

```bash
chmod 600 .env
```

Carga las variables en la sesión actual para que también estén disponibles en
los comandos `docker compose exec` de esta guía:

```bash
set -a
. ./.env
set +a
```

## 4. Iniciar MariaDB y Redis

Desde el repositorio backend:

```bash
cd /var/www/cloudlab/backend
docker compose up -d --wait mariadb redis
docker compose logs --tail=50 mariadb redis
```

El comando espera a que los healthchecks de MariaDB y Redis pasen. Comprueba el
estado final con `docker compose ps`.

Los servicios solo se publican en `127.0.0.1`:

- MariaDB: `127.0.0.1:3306`.
- Redis: `127.0.0.1:6379`.

Los volúmenes `mariadb_data` y `redis_data` deben conservarse. El archivo
`database-schema.sql` se ejecuta solamente al inicializar MariaDB por primera
vez.

## 5. Crear y verificar las tablas

El archivo [`database-schema.sql`](database-schema.sql) crea las tablas
`users`, `container_images` y `workspaces`, junto con sus índices, claves únicas
y relaciones. Docker lo ejecuta automáticamente cuando el volumen
`mariadb_data` se crea por primera vez.

Verifica que las tablas existan antes de compilar o arrancar el backend:

```bash
cd /var/www/cloudlab/backend
docker compose exec -T mariadb mariadb \
    -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    -e 'SHOW TABLES;'
```

La salida debe incluir:

```text
container_images
users
workspaces
```

### Crear el administrador inicial

Después de verificar las tablas, crea el administrador inicial. El hash está
generado con Argon2id y `INSERT IGNORE` evita duplicarlo si el correo ya existe:

```bash
docker compose exec -T mariadb mariadb \
    -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<'SQL'
INSERT IGNORE INTO users (id, name, email, password, role, is_active)
VALUES (
    UUID(),
    'Administrador',
    'admin@cloudlab.local',
    '$argon2id$v=19$m=65536,p=4,t=3$GMb5xN5xCz6Xc6wmbTsKwQ$czC1GZOtvRymQg/+oQSZagBz/z6tpDKlsvtMLN0YeXM',
    'admin',
    1
);
SQL
```

Credenciales iniciales:

```text
Email: admin@cloudlab.local
Contraseña: cambiarcontraseña
Rol: admin
```

Inicia sesión con estas credenciales y cambia la contraseña inmediatamente.
No reutilices la contraseña inicial en otro entorno.

El catálogo de imágenes puede cargarse después de crear las tablas. Por ejemplo:

```bash
docker compose exec -T mariadb mariadb \
    -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    <<'SQL'
INSERT INTO container_images (id, name, image, description, sort_order)
VALUES (UUID(), 'Ubuntu', 'ubuntu:24.04', 'Ubuntu 24.04', 1);
SQL
```

### Problemas durante la creación o verificación

Si el volumen ya existía y las tablas no aparecen, aplica el esquema
manualmente. Este comando es idempotente y no borra datos:

```bash
docker compose exec -T mariadb mariadb \
    -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    < database-schema.sql
```

Si aparece `Access denied for user 'cloudlab'`, el contenedor está funcionando,
pero `DB_PASSWORD` no coincide con la contraseña guardada en MariaDB. Las
variables `MYSQL_USER` y `MYSQL_PASSWORD` solo crean el usuario durante la
primera inicialización del volumen; editar `.env` después no cambia una cuenta
existente.

Confirma que cargaste el `.env` correcto:

```bash
cd /var/www/cloudlab/backend
set -a
. ./.env
set +a
docker compose up -d --wait mariadb redis
```

Si necesitas conservar los datos, cambia la contraseña usando la contraseña
root original:

```bash
docker compose exec -T mariadb mariadb \
    -uroot -p"${DB_ROOT_PASSWORD}" "$DB_NAME" <<SQL
ALTER USER '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';
FLUSH PRIVILEGES;
SQL
```

No ejecutes este comando si no conoces la contraseña root original. No
compartas contraseñas en el repositorio o en capturas de pantalla.

Si es una instalación nueva y no hay datos que conservar, puedes reinicializar
los volúmenes:

```bash
docker compose down -v
docker compose up -d --wait mariadb redis
```

`docker compose down -v` elimina permanentemente los datos de MariaDB y Redis;
no lo uses en una instalación existente.

Si aparece `errno: 150`, revisa que las tablas existentes tengan el mismo tipo
`uuid` en las columnas relacionadas:

```bash
docker compose exec -T mariadb mariadb \
    -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    -e 'SHOW CREATE TABLE users\G SHOW CREATE TABLE container_images\G'
```

En una instalación nueva, reinicializa los volúmenes. En una instalación
existente, conserva una copia de seguridad y corrige la migración sin eliminar
datos.

## 6. Crear la red aislada de workspaces

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

## 7. Compilar y publicar el frontend

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

## 8. Ejecutar el backend

Compila y valida desde el repositorio backend:

```bash
cd /var/www/cloudlab/backend
pnpm typecheck
pnpm test
pnpm build
```

Instala PM2 y arranca el backend como el usuario de despliegue. La API escucha
en `127.0.0.1:8000` y Nginx será el único punto público:

```bash
cd /var/www/cloudlab/backend
pnpm add --global pm2
pm2 start dist/app.js --name cloudlab-api
pm2 status
pm2 logs cloudlab-api --lines 100
```

Configura el arranque automático después de reiniciar el servidor:

```bash
pm2 save
pm2 startup
```

Ejecuta el comando `sudo` que PM2 muestre en la salida de `pm2 startup` y
después guarda nuevamente la lista de procesos:

```bash
pm2 save
```

Comprueba localmente:

```bash
curl -i http://127.0.0.1:8000/api/no-existe
```

Debe responder la API, normalmente con `404`, sin exponer el puerto a la red
externa.

## 9. Configurar Nginx

Instala el archivo de servidor en `/etc/nginx/sites-available/cloudlab` y crea
el enlace correspondiente en `sites-enabled`. Ajusta `server_name`, `root` y
los certificados si usas HTTPS.

Configuración base:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream cloudlab_api {
    server 127.0.0.1:8000;
    keepalive 32;
}

server {
    listen 80;
    server_name cloudlab.local;

    root /var/www/cloudlab/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://cloudlab_api;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin $http_origin;
    }

    location ~ "^/workspace/(?<extracted_uuid>[0-9a-f-]{36})(?<workspace_path>/.*)$" {
        set $workspace_id $extracted_uuid;
        auth_request /_auth_workspace;
        auth_request_set $workspace_port $upstream_http_x_workspace_port;
        auth_request_set $workspace_authorization $upstream_http_x_workspace_authorization;
        error_page 401 = /login;
        rewrite ^/workspace/[^/]+/(.*)$ /$1 break;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Authorization $workspace_authorization;

        add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always;
        add_header Cross-Origin-Embedder-Policy "credentialless" always;
        add_header Content-Security-Policy "frame-ancestors 'self'" always;

        proxy_ssl_verify off;
        proxy_pass https://127.0.0.1:$workspace_port;
    }

    location = /_auth_workspace {
        internal;
        proxy_pass http://cloudlab_api/api/internal/workspace-auth;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Authorization $http_authorization;
        proxy_set_header X-Original-Method $request_method;
        proxy_set_header X-Original-URI $request_uri;
        proxy_set_header Cookie $http_cookie;
        proxy_set_header X-Workspace-Id $workspace_id;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|svg)$ {
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Instala la configuración versionada y desactiva el sitio predeterminado:

```bash
sudo cp /var/www/cloudlab/backend/nginx.conf /etc/nginx/sites-available/cloudlab
sudo ln -sfn /etc/nginx/sites-available/cloudlab /etc/nginx/sites-enabled/cloudlab
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

Antes de habilitar HTTPS, reemplaza `server_name _;` por el dominio real y
configura los certificados. Si el frontend usa otro dominio, actualiza también
`FRONTEND_URLS` en el `.env`.

La configuración original del repositorio backend está en `nginx.conf`. El
archivo instalado en el servidor debe revisarse junto con esta guía.

## 10. Orden de actualización

```text
1. Actualizar backend y ejecutar typecheck, tests y build.
2. Reiniciar el proceso con `pm2 restart cloudlab-api`.
3. Actualizar frontend y ejecutar build.
4. Confirmar que frontend/dist contiene la nueva compilación.
5. Validar nginx -t y recargar Nginx.
6. Probar login, imágenes, creación de workspace y escritorio KasmVNC.
```

## 11. Checklist

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
