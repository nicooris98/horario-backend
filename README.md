# SAHD — Backend

API del Sistema de Administración de Horarios Docentes. NestJS, TypeORM y PostgreSQL.

La API queda en `http://localhost:3000`. La documentación interactiva queda en `http://localhost:3000/api/docs`.

El frontend es otro proyecto y se explica en su propio README.

## Qué hace falta instalar

1. [Node.js 20 o superior](https://nodejs.org/).
2. [pnpm](https://pnpm.io/installation). Con Node 20 o superior alcanza este comando:

```bash
corepack enable
corepack prepare pnpm@10.28.1 --activate
```

3. [Docker Desktop](https://www.docker.com/products/docker-desktop/). Tiene que estar abierto antes de levantar la base.

Comprobá que los tres respondan:

```bash
node -v
pnpm -v
docker --version
```

## Orden para dejarlo funcionando

Los pasos van en este orden. Si se salta el esquema o el seed, la API arranca pero el ingreso falla.

1. Instalar dependencias.
2. Crear `.env`.
3. Levantar PostgreSQL.
4. Cargar el esquema.
5. Cargar roles y administrador.
6. Configurar Brevo si se van a enviar correos.
7. Arrancar la API.

### 1. Instalar dependencias

Desde la carpeta `horario-backend`:

```bash
pnpm install
```

Descarga las librerías del proyecto. No levanta la API ni la base.

### 2. Crear el archivo de entorno

```bash
# PowerShell
Copy-Item .env.template .env

# Git Bash
cp .env.template .env
```

Crea `.env` a partir de la plantilla. La API y Docker leen ese archivo. No se sube al repositorio.

Completá al menos estos valores. Tienen que ser los mismos que usa el contenedor:

```env
PORT=3000
DB_USER=horario
DB_PASS=Aa123456
DB_HOST=localhost
DB_PORT=5433
DB_NAME=horarioDB
JWT_SECRET=cambiá-este-secreto
JWT_EXPIRES_IN=8h
```

`DB_PORT` es **5433**. Docker publica ese puerto en la máquina. El `5432` queda dentro del contenedor.

`JWT_SECRET` firma la cookie de sesión. Cambialo por un texto propio. `JWT_EXPIRES_IN=8h` hace que la sesión dure 8 horas.

### 3. Levantar PostgreSQL

`.env` tiene que existir antes de este comando, porque Docker toma de ahí el usuario, la clave y el nombre de la base.

```bash
docker compose up -d
```

Crea y deja corriendo el contenedor `postgres_database` (PostgreSQL 15). Los datos se guardan en un volumen, así que sobreviven si apagás el contenedor.

Para ver que está arriba:

```bash
docker ps
```

Tiene que aparecer `postgres_database` con el puerto `0.0.0.0:5433->5432/tcp`.

Otros comandos de la base:

```bash
docker compose stop
```

Apaga el contenedor y conserva los datos.

```bash
docker compose up -d
```

Lo vuelve a encender.

```bash
docker compose down
```

Borra el contenedor y conserva el volumen con los datos.

```bash
docker compose down -v
```

Borra el contenedor y también los datos. Después hay que volver a cargar el esquema y el seed.

### 4. Cargar el esquema

La API no crea las tablas al arrancar (`synchronize` está apagado). Hay que ejecutar una vez el script `scripts/script_horario.sql`.

```bash
# PowerShell
Get-Content .\scripts\script_horario.sql -Raw | docker exec -i postgres_database psql -U horario -d horarioDB

# Git Bash
docker exec -i postgres_database psql -U horario -d horarioDB < scripts/script_horario.sql
```

Crea las tablas, las claves y los datos de catálogo del script.

Para comprobar que quedaron creadas:

```bash
docker exec postgres_database psql -U horario -d horarioDB -c "\dt"
```

Tiene que listar tablas como `users`, `docente` y `asignacion_docente`.

Si la base ya existía y solo falta la columna de cuentas deshabilitadas, alcanza con:

```bash
docker exec postgres_database psql -U horario -d horarioDB -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT FALSE;"
```

En una base nueva no hace falta: el script completo ya la incluye.

### 5. Cargar roles y administrador

El seed no corre al arrancar la API. Se ejecuta a mano, con la base ya creada.

En `.env`:

```env
SEED_ADMIN_EMAIL=admin@horario.local
SEED_ADMIN_FIRST_NAME=Admin
SEED_ADMIN_LAST_NAME=Sistema
```

`SEED_ADMIN_EMAIL` tiene que ser un correo válido. Es el correo que, fuera de producción, entra directo al dashboard. La cuenta se crea **sin contraseña**.

```bash
pnpm run seed:initial-data
```

Crea los roles `admin` y `docente`, los permisos de usuarios, roles y permisos, y la cuenta administradora. Si ese correo ya existía, le borra la contraseña y le asegura el rol `admin`. No cambia el nombre. Todo va en una sola transacción: si el correo falta o es inválido, no deja datos a medias.

No lo ejecutes en producción sin autorización.

### 6. Configurar Brevo

Sin esta parte la API arranca, pero no puede mandar el código de ingreso ni el correo de activación.

1. Creá una cuenta en [Brevo](https://www.brevo.com/).
2. Verificá un remitente en [Remitentes](https://app.brevo.com/senders). El correo de `BREVO_SENDER_EMAIL` tiene que ser exactamente ese remitente verificado. Si no está verificado, Brevo rechaza el envío.
3. Creá una clave de API en [Claves API](https://app.brevo.com/settings/keys/api). La guía está en [Crear y administrar claves API](https://help.brevo.com/hc/en-us/articles/209467485-Create-and-manage-your-API-keys).
4. Pegá los valores en `.env`:

```env
BREVO_API_KEY=xkeysib-la-clave-que-copia-brevo
BREVO_SENDER_EMAIL=remitente-verificado@tudominio.com
BREVO_SENDER_NAME=SAHD
FRONTEND_URL=http://localhost:4200
ACTIVATION_OTP_SECRET=
```

`BREVO_API_KEY` autoriza el envío. `BREVO_SENDER_EMAIL` y `BREVO_SENDER_NAME` son el remitente que ve la persona. Los dos correos del sistema usan esas tres variables:

- El código de ingreso, asunto `Código para ingresar — Gestión de Horarios`. Lleva el código de 6 dígitos y no lleva enlace de activación.
- El correo de activación de una cuenta nueva, con el botón hacia `/activate-account`.

`FRONTEND_URL` arma ese enlace. En local tiene que ser `http://localhost:4200`.

`ACTIVATION_OTP_SECRET` firma los códigos. Generá uno de al menos 32 caracteres y no lo compartas:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copiá el resultado en `ACTIVATION_OTP_SECRET`.

La referencia del envío está en la [documentación de correo transaccional de Brevo](https://developers.brevo.com/docs/send-a-transactional-email).

Reiniciá la API después de cambiar `.env`. Nest no recarga solo las variables de entorno.

### 7. Arrancar la API

```bash
pnpm run start:dev
```

Compila el proyecto y lo vuelve a levantar cada vez que guardás un archivo. Es el comando de trabajo diario. Queda escuchando en `http://localhost:3000`.

Para saber que quedó bien:

1. Abrí `http://localhost:3000/api/docs`. Tiene que cargar Swagger.
2. Con la base y el seed listos, `POST /auth/login` con el correo de `SEED_ADMIN_EMAIL` responde `{ "verificationRequired": false }` fuera de producción.

## Comandos del proyecto

Cada comando se ejecuta dentro de `horario-backend`.

```bash
pnpm run start:dev
```

Desarrollo con recarga. Es el que se usa para trabajar.

```bash
pnpm run start
```

Arranca una sola vez, sin quedar mirando los cambios.

```bash
pnpm run build
```

Compila TypeScript a la carpeta `dist`. No levanta el servidor.

```bash
pnpm run start:prod
```

Ejecuta lo compilado en `dist`. Primero hay que correr `pnpm run build`. Hace falta `NODE_ENV=production` para que el ingreso se comporte como producción.

```bash
pnpm run seed:initial-data
```

Carga roles, permisos y el administrador. No arranca la API.

```bash
pnpm run lint
```

Revisa el estilo del código y corrige lo que puede corregir solo.

```bash
pnpm run test
```

Corre los tests unitarios.

```bash
pnpm run test:e2e
```

Corre los tests de punta a punta.

```bash
pnpm run test:cov
```

Corre los tests y muestra el porcentaje de cobertura.

## Cómo funciona el ingreso

Hay un solo ingreso: `POST /auth/login` con `{ "email" }`.

- Fuera de producción, si el correo es `SEED_ADMIN_EMAIL` y la cuenta está activa, responde `{ "verificationRequired": false }` y deja la cookie `access_token`.
- En cualquier otro caso, y siempre que `NODE_ENV` sea `production`, manda el código de ingreso y responde `{ "verificationRequired": true }`.
- `POST /auth/activation/verify-code` con `{ "email", "code" }` valida el código y abre la sesión.

El código dura 10 minutos, se usa una vez, permite 5 intentos y se puede reenviar hasta 5 veces por hora, con 1 minuto de espera. El reenvío vuelve a llamar a `POST /auth/login`.

En producción nadie entra con contraseña. `POST /auth/activation/set-password` se rechaza en ese entorno.

La cookie es httpOnly, dura 8 horas y el navegador la manda solo si el frontend está en `http://localhost:4200`.
