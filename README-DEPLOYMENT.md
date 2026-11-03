# CloudLab — Guía de despliegue en producción

Esta guía instala CloudLab en un servidor Linux limpio usando dos repositorios independientes.

## Arquitectura final

| Componente                        | Dónde corre       | Puerto / ruta                     |
| --------------------------------- | ----------------- | --------------------------------- |
| Backend REST (Node.js, PM2)       | Host              | `127.0.0.1:8000`                  |
| Frontend (archivos estáticos)     | Servido por Nginx | `/var/www/cloudlab/frontend/dist` |
| Nginx                             | Host              | `80` (y `443` si usas HTTPS)      |
| MariaDB                           | Docker Compose    | `127.0.0.1:3306`                  |
| Redis                             | Docker Compose    | `127.0.0.1:6379`                  |
| Contenedores de usuario (KasmVNC) | Docker            | red `cloudlab-network-aislada`    |

Nginx es el único punto público: sirve el frontend y hace proxy de `/api/` (al backend) y `/workspace/` (a los escritorios de usuario).

El backend y el frontend no comparten código ni dependencias. El único contrato entre ambos es HTTP.

## Cómo usar esta guía

- Sigue las secciones **en orden**. Cada una termina con un bloque **Verificación**: no pases a la siguiente si falla.
- Ejecuta todo como un **usuario normal con `sudo`** (ejemplo: `dialbertrack`). **Nunca** ejecutes la aplicación como `root`.
- Los valores entre `<...>` son marcadores: reemplázalos por valores reales.
- **Editar archivos:** donde la guía diga "edita" un archivo, usa `nano <archivo>` (por ejemplo `nano .env`, o `sudo nano <archivo>` si está en `/etc`) o tu editor de preferencia (`vim`, `nvim`, `code`, etc.). En `nano`: `Ctrl+O` y `Enter` guardan; `Ctrl+X` sale.
- Rutas usadas (puedes cambiarlas, pero deben coincidir con `root` y `proxy_pass` de Nginx):

```text
/var/www/cloudlab/backend
/var/www/cloudlab/frontend
/var/www/cloudlab/frontend/dist
```

---

## Paso 0. Verificar que los puertos estén libres

**Haz esto antes de instalar nada.** CloudLab necesita estos puertos en el servidor:

| Puerto | Lo usa        | Obligatorio                            |
| ------ | ------------- | -------------------------------------- |
| 80     | Nginx (HTTP)  | Sí                                     |
| 443    | Nginx (HTTPS) | Solo si configuras HTTPS (sección 9.3) |
| 8000   | Backend (API) | Sí                                     |
| 3306   | MariaDB       | Sí                                     |
| 6379   | Redis         | Sí                                     |

Los escritorios de los usuarios (workspaces) también publican puertos, pero los asigna el backend de forma dinámica en `127.0.0.1`; no hay que revisarlos ahora.

### Comprobar si están ocupados

```bash
for p in 80 443 8000 3306 6379; do
  if sudo ss -tlnH "sport = :$p" | grep -q .; then
    echo "OCUPADO: $p"; sudo ss -tlnp "sport = :$p"
  else
    echo "libre:   $p"
  fi
done
```

- Si todos dicen `libre`, continúa con la siguiente sección.
- Si alguno dice `OCUPADO`, la columna final de la salida (`users:(("nombre",pid=...))`) indica qué programa lo usa. Resuélvelo con **una** de las opciones siguientes.

> Si estás **reinstalando o actualizando** CloudLab, es normal que sus propios servicios (Nginx, PM2 `cloudlab-api`, contenedores `mariadb` y `redis`) ya ocupen esos puertos. En ese caso no hay conflicto.

### Opción 1: detener el servicio que usa el puerto

Hazlo solo si no necesitas ese servicio. Identifica el programa y deténlo:

```bash
sudo ss -tlnp "sport = :80"                 # muestra el proceso que lo usa
sudo systemctl stop <servicio>              # detiene el servicio ahora
sudo systemctl disable <servicio>           # evita que arranque al reiniciar
```

Casos comunes:

| Puerto     | Causa habitual                                     | Nombre del servicio                                            |
| ---------- | -------------------------------------------------- | -------------------------------------------------------------- |
| 80 / 443   | Apache u otro servidor web                         | `apache2` (Debian/Ubuntu) o `httpd` (Fedora/RHEL)              |
| 3306       | MariaDB o MySQL instalados directamente en el host | `mariadb` o `mysql`                                            |
| 6379       | Redis instalado directamente en el host            | `redis-server` (Debian/Ubuntu) o `redis` (Fedora/RHEL/Arch)    |
| cualquiera | Un contenedor Docker                               | `docker ps` para verlo y `docker stop <nombre>` para detenerlo |

Después de detenerlo, vuelve a ejecutar el comprobador de arriba.

### Opción 2: cambiar el puerto de CloudLab

Si no puedes detener el servicio que lo ocupa, usa otro puerto para CloudLab. Elige uno libre (por ejemplo `8080`, `8001`, `3307`, `6380`; confírmalo con el comprobador) y cámbialo **en todos** los lugares de la tabla. Después, en cada comando de la guía que mencione el puerto original, usa el nuevo.

| Puerto         | Dónde cambiarlo                                                                                                                                                                                                                                                                          | Sección de esta guía                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 8000 (API)     | `.env`: `APP_PORT=<nuevo>`. Nginx: `server 127.0.0.1:<nuevo>;` en el bloque `upstream cloudlab_api`.                                                                                                                                                                                     | 3.2 (`.env`) y 9.2 (Nginx)                 |
| 6379 (Redis)   | `.env`: `REDIS_URL=redis://127.0.0.1:<nuevo>`. `docker-compose.yml`: en el servicio `redis`, cambia solo la parte izquierda de `ports:` (por ejemplo `127.0.0.1:6380:6379`).                                                                                                             | 3.2 (`.env`) y 4                           |
| 3306 (MariaDB) | `docker-compose.yml`: en el servicio `mariadb`, cambia solo la parte izquierda de `ports:` (por ejemplo `127.0.0.1:3307:3306`). `.env`: ajusta el puerto de la base de datos (revisa en `.env.example` si el nombre es `DB_PORT`; si no existe, agrégalo solo si el backend lo soporta). | 3.2 (`.env`) y 4                           |
| 80 (HTTP)      | Nginx: `listen 80;` → `listen <nuevo>;`. `.env`: `FRONTEND_URLS` debe incluir el puerto (por ejemplo `http://192.168.1.50:8080`). Firewall: abre el nuevo puerto en lugar del 80.                                                                                                        | 3.2 (`.env`), 9.2 (Nginx) y 9.4 (firewall) |
| 443 (HTTPS)    | Nginx: `listen <nuevo> ssl;`. `.env`: `FRONTEND_URLS` con `https://...:<nuevo>`. Firewall: abre el nuevo puerto.                                                                                                                                                                         | 3.2, 9.3 y 9.4                             |

Notas:

- En `docker-compose.yml`, el formato de `ports:` es `<puerto del host>:<puerto del contenedor>`. Cambia **solo el de la izquierda**; el de la derecha es interno del contenedor y no debe modificarse.
- La edición del `.env` se hace en el paso 3 (sección 3.2); por eso esa sección te recuerda aplicar aquí los puertos nuevos.
- Los cambios en el `.env` solo surten efecto al reiniciar la API: `pm2 restart cloudlab-api --update-env`.
- Los cambios en `docker-compose.yml` se aplican con `docker compose up -d --wait mariadb redis`.
- Si tu base de datos o Redis ya tienen datos, no uses `docker compose down -v`; cambiar el puerto no requiere borrar volúmenes.

---

## Despliegue local: ajusta los valores a tu IP

Aplica si instalas CloudLab en una red local (máquina virtual, servidor casero, laboratorio) y no tienes un dominio público. En ese caso, el valor `cloudlab.local` que aparece en esta guía debe reemplazarse por lo que realmente escribirás en el navegador. Hazlo **antes** de las secciones 3 y 9.

### Paso 1. Averiguar la IP del servidor

```bash
ip -4 -br addr
```

(también sirven `ip a` o `hostname -I`). Ejemplo de salida:

```text
lo               UNKNOWN        127.0.0.1/8
enp3s0           UP             192.168.1.50/24
docker0          DOWN           172.17.0.1/16
br-cloudlab      UP             172.30.0.1/16
```

Usa la IP de la interfaz de red real (`enp3s0`, `eth0`, `ens18`, `wlan0`, etc.; en el ejemplo, `192.168.1.50`). **Ignora** `lo` (`127.0.0.1`), `docker0`, `br-*` y `veth*`: son redes internas de Docker.

### Paso 2. Elegir cómo accederás

| Acceso                          | `FRONTEND_URLS` (en `.env`)                 | `server_name` (en Nginx)                              |
| ------------------------------- | ------------------------------------------- | ----------------------------------------------------- |
| Solo desde el propio servidor   | `http://localhost`                          | `localhost`                                           |
| Desde otros equipos, por IP     | `http://192.168.1.50`                       | `192.168.1.50`                                        |
| Desde otros equipos, por nombre | `http://cloudlab.local`                     | `cloudlab.local`                                      |
| Varias opciones a la vez        | `http://192.168.1.50,http://cloudlab.local` | `192.168.1.50 cloudlab.local` (separados por espacio) |

Reglas:

- `FRONTEND_URLS` debe coincidir **exactamente** con lo que se escribe en la barra del navegador: esquema (`http://`), host y puerto. Sin `/` final. Si Nginx escucha en un puerto distinto del 80, inclúyelo (por ejemplo `http://192.168.1.50:8080`).
- En local se usa `http://`; si en algún momento configuras HTTPS, cambia a `https://`.
- Algunas funciones del navegador (por ejemplo el portapapeles dentro del escritorio remoto) pueden requerir HTTPS o `localhost`. Si accedes por IP con `http://` y alguna no funciona, es probable que sea por eso.

### Paso 3. Aplicar los valores

Usa la IP que obtuviste en el paso 1 en estos tres lugares:

1. `.env` del backend (sección 3): `nano /var/www/cloudlab/backend/.env` y ajusta `FRONTEND_URLS`.
2. Configuración de Nginx (sección 9): `sudo nano /etc/nginx/sites-available/cloudlab` y ajusta `server_name`.
3. Reinicia para que los cambios surtan efecto:

```bash
pm2 restart cloudlab-api --update-env
sudo nginx -t && sudo systemctl reload nginx
```

### Paso 4. Si accedes por nombre (`cloudlab.local`), regístralo en cada equipo cliente

Un nombre que no existe en un DNS no se resuelve solo. En **cada equipo desde el que entres**, añade una línea al archivo `hosts` (con la IP del servidor):

```text
192.168.1.50  cloudlab.local
```

- Linux / macOS: `sudo nano /etc/hosts`
- Windows (editor abierto como administrador): `C:\Windows\System32\drivers\etc\hosts`

### Recomendaciones

- Asigna una **IP fija** al servidor (en el router, como reserva DHCP, o en la configuración de red del sistema). Si la IP cambia, el acceso por IP deja de funcionar y debes repetir el paso 3 con la nueva.
- Recuerda abrir el puerto 80 en el firewall (sección 9.4).

**Verificación** desde otro equipo de la red:

```bash
curl -I http://192.168.1.50/          # o http://cloudlab.local/ si lo registraste en hosts
```

---

## 1. Requisitos del servidor

### 1.1 Paquetes base

Instala `ca-certificates`, `curl`, `git`, `nginx` y `unzip` con el gestor de tu distribución:

| Distribución                               | Comando                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| Debian / Ubuntu / Linux Mint (APT)         | `sudo apt update && sudo apt install -y ca-certificates curl git nginx unzip` |
| Fedora / RHEL 8+ / Rocky / AlmaLinux (DNF) | `sudo dnf install -y ca-certificates curl git nginx unzip`                    |
| CentOS / RHEL antiguos (YUM)               | `sudo yum install -y ca-certificates curl git nginx unzip`                    |
| Arch / Manjaro / EndeavourOS (Pacman)      | `sudo pacman -Syu --needed ca-certificates curl git nginx unzip`              |

> Nota: esta guía usa rutas de Debian/Ubuntu para Nginx (`sites-available` / `sites-enabled`). En Fedora, RHEL y Arch la configuración va en `/etc/nginx/conf.d/cloudlab.conf` (ver sección 9).

**Verificación:**

```bash
nginx -v && git --version && curl --version | head -n 1
```

### 1.2 Node.js y pnpm

Se requiere **Node.js 20 o superior** y **pnpm 12**. Una opción sencilla es `fnm` (no es obligatorio):

```bash
curl -fsSL https://fnm.vercel.app/install | bash
source ~/.bashrc
fnm install --lts
fnm default lts-latest

npm install -g pnpm
```

Si no usas `fnm`, instala Node.js con el método aprobado por tu infraestructura.

**Verificación** (`node` debe ser `v20` o mayor y `pnpm` debe empezar con `12`):

```bash
node --version
pnpm --version
```

### 1.3 Docker y permisos del usuario

Instala Docker Engine y Docker Compose siguiendo la guía oficial de tu sistema: <https://docs.docker.com/engine/install/>

Da acceso al socket de Docker al usuario de despliegue y abre una sesión nueva del grupo:

```bash
sudo usermod -aG docker "$USER"
newgrp docker
```

**Verificación:**

```bash
docker info
docker compose version
```

Si `docker info` muestra `permission denied`, cierra la sesión SSH y vuelve a entrar. **No** uses `chmod 666` en el socket.

---

## 2. Obtener los repositorios

`/var/www` pertenece a `root`, así que `mkdir` sin `sudo` falla. Crea la ruta con `sudo` y entrégala al usuario de despliegue **antes** de clonar:

```bash
sudo install -d -o "$USER" -g "$(id -gn)" /var/www/cloudlab
cd /var/www/cloudlab
git clone https://github.com/DialberTrack/CloudLab-API backend
git clone https://github.com/DialberTrack/CloudLab-Frontend frontend
```

Reglas desde este punto:

- No uses `sudo` con `git`, `pnpm` ni para editar los repositorios.
- Instala cada proyecto **desde su propio directorio**; nunca el frontend desde `backend/` ni al revés.

**Verificación:**

```bash
ls /var/www/cloudlab        # debe mostrar: backend  frontend
```

---

## 3. Configurar el backend

### 3.1 Instalar dependencias y crear `.env`

```bash
cd /var/www/cloudlab/backend
pnpm install --frozen-lockfile
cp .env.example .env
```

Si `.env.example` no existe, crea `.env` manualmente con este contenido (reemplaza todos los `<...>`):

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

### 3.2 Reglas importantes del `.env`

Edita el archivo con `nano .env` (o tu editor de preferencia) y ten en cuenta:

- `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `DB_ROOT_PASSWORD` son los mismos que usa Docker Compose: lo lee automáticamente para sustituir variables en `docker-compose.yml`.
- **Puertos:** si en el Paso 0 cambiaste algún puerto de CloudLab, este es el momento de reflejarlo en el `.env`: `APP_PORT` (API), `REDIS_URL` (Redis), el puerto de la base de datos si aplica, y `FRONTEND_URLS` si cambiaste el puerto de Nginx. El resto de cambios (Nginx y `docker-compose.yml`) están en la tabla del Paso 0.
- `JWT_SECRET` y `JWT_REFRESH_SECRET` deben ser **distintos entre sí**, largos y aleatorios. Puedes generarlos con `openssl rand -hex 48`. Guárdalos fuera del repositorio.
- `FRONTEND_URLS` debe incluir **todos** los orígenes reales del frontend, separados por comas (con esquema y sin `/` final). Ejemplo: `https://cloudlab.midominio.com,https://www.midominio.com`. **Despliegue local:** cámbialo por la IP o el nombre con el que accederás (ver "Despliegue local" al inicio), por ejemplo `http://192.168.1.50`.
- Evita caracteres especiales (`$`, `#`, espacios, comillas) en las contraseñas, o ponlas entre comillas simples, porque el archivo se carga con `source` en el paso 3.3.

Protege el archivo:

```bash
chmod 600 .env
```

### 3.3 Cargar las variables en la sesión actual

Los comandos `docker compose exec` de esta guía usan `$DB_USER`, `$DB_PASSWORD`, etc. Cárgalas en **cada terminal nueva** que uses:

```bash
cd /var/www/cloudlab/backend
set -a
. ./.env
set +a
```

**Verificación:**

```bash
echo "$DB_NAME"      # debe imprimir: cloudlab
stat -c '%a' .env     # debe imprimir: 600
```

---

## 4. Iniciar MariaDB y Redis

```bash
cd /var/www/cloudlab/backend
docker compose up -d --wait mariadb redis
docker compose ps
docker compose logs --tail=50 mariadb redis
```

`--wait` espera a que pasen los healthchecks de ambos servicios.

Ambos se publican solo en `127.0.0.1` (MariaDB `:3306`, Redis `:6379`). Los volúmenes `mariadb_data` y `redis_data` **deben conservarse**.

**Verificación:** `docker compose ps` debe mostrar `mariadb` y `redis` en estado `healthy`.

---

## 5. Crear y verificar las tablas

El archivo [`database-schema.sql`](database-schema.sql) crea las tablas `users`, `container_images` y `workspaces` con sus índices, claves únicas y relaciones. Docker lo ejecuta **automáticamente solo la primera vez** que se crea el volumen `mariadb_data`.

### 5.1 Verificar las tablas

```bash
cd /var/www/cloudlab/backend
docker compose exec -T mariadb mariadb \
    -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    -e 'SHOW TABLES;'
```

La salida debe incluir exactamente estas tres tablas:

```text
container_images
users
workspaces
```

### 5.2 Crear el administrador inicial

El hash está generado con Argon2id. `INSERT IGNORE` evita duplicar el usuario si el correo ya existe.

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
Email:      admin@cloudlab.local
Contraseña: cambiarcontraseña
Rol:        admin
```

> **Obligatorio:** inicia sesión con estas credenciales y cambia la contraseña de inmediato. Nunca la reutilices en otro entorno.

### 5.3 Cargar el catálogo de imágenes

Se puede hacer después de crear las tablas. Ejemplo con Ubuntu:

```bash
docker compose exec -T mariadb mariadb \
    -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<'SQL'
INSERT INTO container_images (id, name, image, description, sort_order)
VALUES (UUID(), 'Ubuntu', 'ubuntu:24.04', 'Ubuntu 24.04', 1);
SQL
```

### 5.4 Solución de problemas de esta sección

**Las tablas no aparecen (el volumen ya existía).** Aplica el esquema manualmente. Es idempotente y no borra datos:

```bash
docker compose exec -T mariadb mariadb \
    -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    < database-schema.sql
```

**`Access denied for user 'cloudlab'`.** El contenedor funciona, pero `DB_PASSWORD` no coincide con la contraseña guardada en MariaDB. `MYSQL_USER` y `MYSQL_PASSWORD` solo crean el usuario en la **primera** inicialización del volumen; editar `.env` después no cambia una cuenta existente. Primero confirma que cargaste el `.env` correcto:

```bash
cd /var/www/cloudlab/backend
set -a
. ./.env
set +a
docker compose up -d --wait mariadb redis
```

Si el error persiste y quieres conservar los datos, cambia la contraseña usando la contraseña **root original** (si no la conoces, no ejecutes esto):

```bash
docker compose exec -T mariadb mariadb \
    -uroot -p"${DB_ROOT_PASSWORD}" "$DB_NAME" <<SQL
ALTER USER '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';
FLUSH PRIVILEGES;
SQL
```

**Instalación nueva sin datos que conservar:** puedes reinicializar los volúmenes.

```bash
docker compose down -v
docker compose up -d --wait mariadb redis
```

> **Peligro:** `docker compose down -v` elimina de forma permanente los datos de MariaDB y Redis. No lo uses en una instalación existente.

**`errno: 150` (error de clave foránea).** Las columnas relacionadas deben tener el mismo tipo `uuid` en las tablas existentes. Revísalo con:

```bash
docker compose exec -T mariadb mariadb \
    -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    -e 'SHOW CREATE TABLE users\G SHOW CREATE TABLE container_images\G'
```

En una instalación nueva, reinicializa los volúmenes. En una existente, haz una copia de seguridad y corrige la migración sin borrar datos.

No compartas contraseñas en el repositorio ni en capturas de pantalla.

---

## 6. Crear la red aislada de workspaces

Créala **una sola vez** (el comando es seguro de repetir). La opción `-o com.docker.network.bridge.name=br-cloudlab` fija un nombre estable a la interfaz de red; las reglas de UFW de la sección 6.1 dependen de ese nombre (`br-cloudlab`):

```bash
docker network inspect cloudlab-network-aislada >/dev/null 2>&1 || \
docker network create --driver bridge --subnet 172.30.0.0/16 \
    -o com.docker.network.bridge.name=br-cloudlab \
    cloudlab-network-aislada
```

**Verificación:**

```bash
ip link show br-cloudlab     # debe existir la interfaz
```

> Si la red ya existía sin ese nombre, el nombre real de la interfaz será `br-<id>`. En una instalación sin workspaces activos puedes eliminarla (`docker network rm cloudlab-network-aislada`) y crearla de nuevo con el comando anterior.

El backend comprueba que esta red exista antes de crear un workspace. **No** conectes esta red a MariaDB, Redis ni a otros servicios internos. No montes `docker.sock` en ningún contenedor de usuario.

### 6.1 Firewall (obligatorio)

Docker inserta reglas que pueden permitir acceso a redes privadas. Configura el firewall del host para que los contenedores de `172.30.0.0/16` puedan salir **solo** por DNS (53), HTTP (80) y HTTPS (443) hacia Internet, y no alcancen la LAN, el host, el gateway Docker ni otros contenedores.

Primero averigua si tu servidor usa UFW:

```bash
sudo ufw status
```

- Si muestra `Status: active` → usa la **Opción B (UFW)** más abajo y **no** mezcles reglas manuales de `iptables`.
- Si muestra `Status: inactive` o el comando no existe → usa la **Opción A (iptables)**. Opcionalmente, puedes habilitar UFW (ver el apartado siguiente) y entonces usar la **Opción B**.

#### Opcional: habilitar UFW

No es obligatorio. Si prefieres administrar el firewall con UFW, instálalo (si no existe), permite SSH y el puerto 80, y habilítalo. **Permite SSH antes de ejecutar `ufw enable`**; de lo contrario perderás el acceso remoto al servidor. Si tu SSH usa otro puerto, reemplaza `22`.

```bash
sudo apt install -y ufw        # solo si el comando no existe (Debian/Ubuntu)
sudo ufw allow 22/tcp          # SSH
sudo ufw allow 80/tcp          # HTTP (Nginx)
sudo ufw enable
sudo ufw status verbose
```

Solo se abre el puerto 80. El 443 se abre únicamente si más adelante configuras HTTPS (sección 9.3). Después de habilitar UFW, continúa con la **Opción B**. Si no quieres usar UFW, sigue con la Opción A.

#### Opción A: iptables (sin UFW)

Ejemplo con `iptables` (usa `-I`, por eso las reglas se escriben en orden inverso al de evaluación; adáptalo a tu firewall y valídalo con las pruebas de 6.2):

```bash
SUBNET=172.30.0.0/16

# Salida desde los workspaces (cadena DOCKER-USER). Orden final de evaluación:
# 1) DNS  2) bloquear redes privadas  3) permitir 80/443  4) bloquear el resto
sudo iptables -I DOCKER-USER -s $SUBNET -j DROP
sudo iptables -I DOCKER-USER -s $SUBNET -p tcp -m multiport --dports 80,443 -j ACCEPT
sudo iptables -I DOCKER-USER -s $SUBNET -d 10.0.0.0/8     -j DROP
sudo iptables -I DOCKER-USER -s $SUBNET -d 172.16.0.0/12  -j DROP
sudo iptables -I DOCKER-USER -s $SUBNET -d 192.168.0.0/16 -j DROP
sudo iptables -I DOCKER-USER -s $SUBNET -p tcp --dport 53 -j ACCEPT
sudo iptables -I DOCKER-USER -s $SUBNET -p udp --dport 53 -j ACCEPT

# Tráfico de los workspaces hacia el propio host (cadena INPUT): solo respuestas
sudo iptables -I INPUT -s $SUBNET -j DROP
sudo iptables -I INPUT -s $SUBNET -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
```

Aplica reglas equivalentes con `ip6tables`, o deshabilita IPv6 de forma controlada. Para que las reglas persistan tras reiniciar, usa el mecanismo de tu distribución (por ejemplo `iptables-persistent` en Debian/Ubuntu).

#### Opción B: UFW activo

UFW no controla por sí solo el tráfico de los contenedores Docker, así que hay que añadir reglas propias en dos archivos de `/etc/ufw/`. Ambos usan la interfaz `br-cloudlab` creada en la sección 6.

**Paso 1. Haz una copia de seguridad:**

```bash
sudo cp /etc/ufw/before.rules /etc/ufw/before.rules.bak
sudo cp /etc/ufw/after.rules  /etc/ufw/after.rules.bak
```

**Paso 2. Edita `/etc/ufw/before.rules`** (`sudo nano /etc/ufw/before.rules`). Estas reglas controlan el tráfico de los workspaces hacia el propio servidor: solo permiten respuestas a conexiones ya iniciadas por el host (por ejemplo, las de Nginx) y descartan todo lo demás. Pégalas justo después de la línea `# End required lines` y antes de cualquier otra regla:

```text
# Don't delete these required lines, otherwise there will be errors
*filter
:ufw-before-input - [0:0]
:ufw-before-output - [0:0]
:ufw-before-forward - [0:0]
:ufw-not-local - [0:0]
# End required lines

# --- Aislamiento CloudLab ---
-A ufw-before-input -i br-cloudlab -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
-A ufw-before-input -i br-cloudlab -j DROP
# --- Fin aislamiento CloudLab ---
```

**Paso 3. Edita `/etc/ufw/after.rules`** (`sudo nano /etc/ufw/after.rules`). Estas reglas controlan el tráfico que los workspaces envían a través del host (Internet, LAN y otros contenedores). Ve al bloque `# BEGIN UFW AND DOCKER` (si no existe, créalo al final del archivo, **después** del primer `COMMIT`, y ciérralo con su propio `COMMIT`). Pega las reglas de CloudLab **antes** de cualquier otra línea `-A DOCKER-USER`; deben ir primero para que se evalúen primero:

```text
# BEGIN UFW AND DOCKER
*filter
:ufw-user-forward - [0:0]
:ufw-docker-logging-deny - [0:0]
:DOCKER-USER - [0:0]

# --- Aislamiento CloudLab (debe ir primero) ---
-A DOCKER-USER -i br-cloudlab -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
-A DOCKER-USER -i br-cloudlab -d 10.0.0.0/8 -j DROP
-A DOCKER-USER -i br-cloudlab -d 172.16.0.0/12 -j DROP
-A DOCKER-USER -i br-cloudlab -d 192.168.0.0/16 -j DROP
-A DOCKER-USER -i br-cloudlab -d 169.254.0.0/16 -j DROP
-A DOCKER-USER -i br-cloudlab -d 100.64.0.0/10 -j DROP
-A DOCKER-USER -i br-cloudlab -d 224.0.0.0/4 -j DROP
-A DOCKER-USER -i br-cloudlab -o br-cloudlab -j DROP
# --- Fin aislamiento CloudLab ---

-A DOCKER-USER -j ufw-user-forward
# ... conserva aquí el resto de tu bloque existente (reglas de ufw-docker, etc.) y su COMMIT ...
```

Qué hace cada regla de `DOCKER-USER`:

| Regla                                                       | Efecto                                                                                                                             |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `RELATED,ESTABLISHED` → `ACCEPT`                            | Permite las respuestas a conexiones ya establecidas.                                                                               |
| `-d 10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` → `DROP` | Bloquea las redes privadas (LAN y otros contenedores, porque la red de workspaces `172.30.0.0/16` está dentro de `172.16.0.0/12`). |
| `-d 169.254.0.0/16` → `DROP`                                | Bloquea direcciones link-local (incluye los servicios de metadatos de la nube).                                                    |
| `-d 100.64.0.0/10` → `DROP`                                 | Bloquea el rango CGNAT.                                                                                                            |
| `-d 224.0.0.0/4` → `DROP`                                   | Bloquea multicast.                                                                                                                 |
| `-i br-cloudlab -o br-cloudlab` → `DROP`                    | Impide que los contenedores se comuniquen entre sí.                                                                                |

> Importante: estas reglas dejan pasar el tráfico hacia Internet (cualquier puerto público). Si además quieres limitarlo solo a DNS (53) y HTTP/HTTPS (80, 443), añade estas líneas **entre** la regla `-d 224.0.0.0/4` y la regla `-o br-cloudlab`, y cierra con un descarte general:
>
> ```text
> -A DOCKER-USER -i br-cloudlab -p udp --dport 53 -j ACCEPT
> -A DOCKER-USER -i br-cloudlab -p tcp --dport 53 -j ACCEPT
> -A DOCKER-USER -i br-cloudlab -p tcp -m multiport --dports 80,443 -j ACCEPT
> -A DOCKER-USER -i br-cloudlab -j DROP
> ```

**Paso 4. Recarga UFW y verifica:**

```bash
sudo ufw reload
sudo ufw status verbose
sudo iptables -S DOCKER-USER | grep br-cloudlab
sudo iptables -S ufw-before-input | grep br-cloudlab
```

Los dos últimos comandos deben listar las reglas de CloudLab. Si `ufw reload` muestra un error de sintaxis, restaura la copia (`sudo cp /etc/ufw/after.rules.bak /etc/ufw/after.rules`, y lo mismo con `before.rules`) y revisa que cada bloque `*filter` termine con su `COMMIT`. Reinicia Docker si las reglas no aparecen: `sudo systemctl restart docker`.

### 6.2 Comprobar la política

Estas pruebas se hacen **desde dentro de un workspace** (cuando ya puedas crear uno, en la sección 10):

```bash
curl -I https://example.com                          # DEBE funcionar
curl --connect-timeout 3 http://192.168.1.1          # DEBE fallar
curl --connect-timeout 3 http://172.30.0.1           # DEBE fallar
```

Si alguno de los dos últimos responde, el firewall no está aislando correctamente: corrígelo antes de abrir CloudLab a usuarios.

---

## 7. Compilar el frontend

```bash
cd /var/www/cloudlab/frontend
pnpm install --frozen-lockfile
pnpm build
```

La compilación genera la carpeta `dist/`, que Nginx servirá. No uses `pnpm dev` en producción.

**Verificación:**

```bash
ls /var/www/cloudlab/frontend/dist/index.html
ls /var/www/cloudlab/frontend/dist/assets/
```

Ambos deben existir. Repite esta verificación después de cada actualización, antes de recargar Nginx.

---

## 8. Ejecutar el backend

### 8.1 Validar y compilar

```bash
cd /var/www/cloudlab/backend
pnpm typecheck
pnpm test
pnpm build
```

Si alguno falla, no continúes: corrige el error antes de arrancar el servicio.

### 8.2 Iniciar con PM2

Instala PM2 y arranca la API como el usuario de despliegue. Debe escuchar solo en `127.0.0.1:8000`:

```bash
cd /var/www/cloudlab/backend
npm install -g pm2
pm2 start dist/app.js --name cloudlab-api
pm2 status
pm2 logs cloudlab-api --lines 100
```

> PM2 hereda las variables de `.env` solo si la aplicación las carga por sí misma. Si el log muestra errores de configuración, inicia PM2 desde una terminal donde hayas cargado el `.env` (sección 3.3) y vuelve a lanzar con `pm2 restart cloudlab-api --update-env`.

### 8.3 Arranque automático tras reinicio

```bash
pm2 save
pm2 startup
```

`pm2 startup` imprime un comando que empieza con `sudo`. **Cópialo y ejecútalo tal cual**, y después guarda de nuevo:

```bash
pm2 save
```

**Verificación:**

```bash
curl -i http://127.0.0.1:8000/api/no-existe
```

La API debe responder (normalmente `404`). Confirma también que el puerto **no** está expuesto a la red externa:

```bash
ss -tlnp | grep 8000      # debe mostrar 127.0.0.1:8000, nunca 0.0.0.0:8000
```

---

## 9. Configurar Nginx

### 9.1 Configuración de referencia (solo lectura)

**En este apartado no ejecutes nada.** Es el contenido que debe tener el archivo de Nginx del sitio, y sirve para dos cosas:

- **Comparar:** la versión del repositorio (`backend/nginx.conf`) debe coincidir con este bloque. La acción real se hace en el paso 9.2.
- **Crear el archivo a mano:** solo si `backend/nginx.conf` no existe en tu repositorio. En ese caso, copia este bloque completo en el archivo, como se indica en la Opción B del paso 9.2.

Los valores que debes personalizar después de instalarlo son `server_name` (tu dominio, tu IP o `cloudlab.local`) y `root` (ruta de `frontend/dist`).

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

### 9.2 Instalar la configuración (aquí sí ejecutas comandos)

Este es el paso donde se crea y activa el archivo de Nginx. Elige **una** de las dos opciones:

- **Opción A (recomendada):** copiar `backend/nginx.conf` del repositorio, como se muestra a continuación.
- **Opción B:** si ese archivo no existe, crea el archivo vacío con `sudo nano /etc/nginx/sites-available/cloudlab` (o `/etc/nginx/conf.d/cloudlab.conf` en Fedora, RHEL y Arch), pega el bloque completo de 9.1, guarda y salta a la activación del enlace (`ln -sfn`) y las líneas siguientes.

**Opción A en Debian / Ubuntu** (copia la versión del repositorio y actívala):

```bash
sudo cp /var/www/cloudlab/backend/nginx.conf /etc/nginx/sites-available/cloudlab
sudo ln -sfn /etc/nginx/sites-available/cloudlab /etc/nginx/sites-enabled/cloudlab
sudo rm -f /etc/nginx/sites-enabled/default
```

**Fedora / RHEL / Arch:** no existen `sites-available`/`sites-enabled`; copia el archivo a `/etc/nginx/conf.d/cloudlab.conf` (en Arch, asegúrate de que `nginx.conf` incluya `conf.d/*.conf` dentro de `http {}`).

Edita el archivo instalado con `sudo nano /etc/nginx/sites-available/cloudlab` (o `/etc/nginx/conf.d/cloudlab.conf` en Fedora, RHEL y Arch; o tu editor de preferencia) y ajusta:

1. `server_name`: pon tu dominio real (si el repositorio trae `server_name _;`, reemplázalo). **Despliegue local:** usa la IP del servidor (obtenida con `ip -4 -br addr`) o el nombre que registraste en el archivo `hosts` de tus equipos; puedes poner varios separados por espacio, por ejemplo `server_name 192.168.1.50 cloudlab.local;`.
2. `root`: debe ser `/var/www/cloudlab/frontend/dist` (o tu ruta real).
3. Si usas otro dominio para el frontend, actualiza también `FRONTEND_URLS` en `.env` y reinicia la API (`pm2 restart cloudlab-api --update-env`).
4. Si cambiaste puertos en el Paso 0: ajusta `listen` (80/443) y el puerto del bloque `upstream cloudlab_api` (API), según la tabla del Paso 0.

Valida y activa Nginx:

```bash
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

`nginx -t` debe terminar con `syntax is ok` y `test is successful`; si no, no recargues.

### 9.3 HTTPS (opcional)

**Solo si quieres usar HTTPS** (recomendado si el servicio será accesible desde Internet): configura certificados (por ejemplo con Certbot) y añade `listen 443 ssl;` con `ssl_certificate` y `ssl_certificate_key` en la configuración de Nginx. Con HTTPS, `FRONTEND_URLS` debe usar `https://` y debes abrir también el puerto 443 en el paso 9.4.

**Si no vas a usar HTTPS** (por ejemplo, en un despliegue local), no hagas nada aquí: este paso ya terminó y puedes continuar con 9.4.

### 9.4 Abrir el puerto 80 (y 443) en el firewall del servidor

Para que otros equipos accedan a CloudLab, el firewall debe permitir el tráfico entrante a Nginx. Primero identifica qué firewall usa tu sistema:

```bash
sudo ufw status                    # ¿"active"? → UFW
sudo firewall-cmd --state          # ¿"running"? → firewalld
sudo nft list ruleset | head -n 20 # reglas nftables
sudo iptables -S | head -n 20      # reglas iptables
```

**Si usas UFW** (activo):

```bash
sudo ufw allow OpenSSH          # asegúrate de no perder el acceso SSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp          # solo si configuraste HTTPS
sudo ufw status numbered
```

Si UFW está `inactive`, no lo actives sin antes permitir SSH (`sudo ufw allow OpenSSH`), o perderás el acceso remoto al servidor.

**Si usas otro firewall** (investiga la opción de tu sistema):

| Firewall                                   | Comandos                                                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| firewalld (Fedora, RHEL, Rocky, AlmaLinux) | `sudo firewall-cmd --permanent --add-service=http` y `sudo firewall-cmd --reload` (añade `--add-service=https` si usas HTTPS) |
| iptables directo                           | `sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT` (persiste con el mecanismo de tu distribución)                           |
| nftables                                   | Añade una regla `tcp dport 80 accept` en la cadena `input` de `/etc/nftables.conf` y ejecuta `sudo systemctl reload nftables` |
| Firewall del proveedor (VPS o nube)        | Abre el puerto 80 (y 443) en el panel: grupo de seguridad o reglas de red de la instancia                                     |

Si tu sistema usa otro firewall, consulta su documentación con la búsqueda "abrir puerto 80 en <nombre del firewall> <tu distribución>".

**Verificación** desde **otro equipo** de la red:

```bash
curl -I http://<IP_O_DOMINIO_DEL_SERVIDOR>/    # debe responder 200
```

**Verificación local:**

```bash
curl -I http://cloudlab.local/                  # 200: sirve el frontend (usa tu dominio o añade el host con -H "Host: ...")
curl -i  http://cloudlab.local/api/no-existe    # responde la API (404), pasando por Nginx
```

---

## 10. Orden de actualización

Sigue siempre este orden:

```text
1. Backend: git pull, pnpm install --frozen-lockfile, pnpm typecheck, pnpm test, pnpm build.
2. Reiniciar la API: pm2 restart cloudlab-api
3. Frontend: git pull, pnpm install --frozen-lockfile, pnpm build.
4. Confirmar que frontend/dist/index.html y frontend/dist/assets/ existen y son recientes.
5. sudo nginx -t  y, si es correcto, sudo systemctl reload nginx
6. Probar: login, listado de imágenes, creación de workspace y escritorio KasmVNC.
```

Después de la primera instalación, usa este paso 6 también para ejecutar las pruebas de firewall de la sección 6.2.

---

## 11. Checklist final

Marca cada punto antes de dar el despliegue por terminado:

- [ ] `.env` existe solo en el servidor, con permisos `600`, y no está versionado.
- [ ] MariaDB y Redis están en estado `healthy` (`docker compose ps`).
- [ ] Existen las tablas `users`, `container_images` y `workspaces`.
- [ ] Se cambió la contraseña del administrador inicial.
- [ ] La red `cloudlab-network-aislada` existe.
- [ ] El firewall bloquea redes privadas, el host y otros contenedores (pruebas 6.2 superadas).
- [ ] Si usas UFW: las reglas de `br-cloudlab` están en `before.rules` y `after.rules`, y `sudo ufw status` muestra los puertos 80 (y 443) permitidos.
- [ ] Si no usas UFW: el puerto 80 (y 443) está abierto en el firewall de tu sistema o proveedor.
- [ ] El backend escucha solo en `127.0.0.1:8000` y PM2 está guardado (`pm2 save`, `pm2 startup`).
- [ ] Se verificaron los puertos en el Paso 0 y, si hubo conflictos, se resolvieron (servicio detenido o puerto cambiado en `.env`, Nginx, `docker-compose.yml` y firewall).
- [ ] `frontend/dist/index.html` existe.
- [ ] Nginx usa el `root` y `server_name` correctos, y `nginx -t` pasa.
- [ ] `/api/` responde mediante el proxy de Nginx.
- [ ] `/workspace/<uuid>/...` abre el escritorio y la conexión WebSocket funciona.
- [ ] `FRONTEND_URLS` coincide con los orígenes reales del frontend.
- [ ] Despliegue local: `FRONTEND_URLS` y `server_name` usan la IP actual del servidor (o el nombre registrado en `hosts`), y la IP es fija.
- [ ] No se montó `docker.sock` en ningún contenedor de usuario.
