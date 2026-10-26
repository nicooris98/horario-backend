<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Initial roles, permissions, and administrator

The initial data seed is an explicit command; it does not run when the API
starts. Configure these values in `.env` before running it:

```env
SEED_ADMIN_EMAIL=your-admin-email@example.com
SEED_ADMIN_FIRST_NAME=Admin
SEED_ADMIN_LAST_NAME=Sistema
```

Then run:

```bash
pnpm run seed:initial-data
```

The command creates missing initial roles and permissions, adds their declared
role-permission links without removing existing links, and creates or assigns
the `admin` role only to the account identified by `SEED_ADMIN_EMAIL`. The
account is stored without a password. If it already exists, its password is
cleared and its personal details are not changed. Outside production, that
email opens the dashboard directly. In production nobody signs in with a
password: every account, including the administrator, receives a verification
code. All seed operations run in one database transaction and fail if the
admin email is missing or invalid. Do not run this command against production
without explicit authorization.

## Account activation by email

New users created through `POST /auth/register` or `POST /users` remain inactive
until they enter the one-time code sent through Brevo. Configure the following
variables in `.env`:

```env
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=verified-sender@example.com
BREVO_SENDER_NAME=SAHD
FRONTEND_URL=http://localhost:4200
ACTIVATION_OTP_SECRET=generate-a-random-secret-with-at-least-32-characters
```

The administrator endpoint accepts identity and optional role IDs without a
password:

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "ana@example.com",
  "role_ids": [2]
}
```

`FRONTEND_URL` is optional. When configured, the email links to
`/activate-account?email=...&code=...`; Angular's future activation view must
implement that route. Before starting the updated backend, execute the
"ACTIVACION DE CUENTAS Y CONFIGURACION INICIAL DE CONTRASENA" section in
`scripts/script_horario.sql` against the backend database. That SQL section is
idempotent and can be run against the current database without deleting users
or existing activation challenges. The rest of the schema script is not needed
for this update. In pgAdmin, open the file, select the activation section, and
execute it. It also removes only the obsolete TypeORM migration-history rows
for this activation schema, if that history table exists. For a new database,
execute the complete schema script.

Verify a code with `POST /auth/activation/verify-code`:

```json
{ "email": "user@example.com", "code": "012345" }
```

For accounts created by an administrator without a password, the response
contains a short-lived one-use `passwordSetupToken`:

```json
{
  "message": "Correo verificado correctamente",
  "requiresPassword": true,
  "passwordSetupToken": "<temporary-token>"
}
```

Set the user's password with `POST /auth/activation/set-password`:

```json
{
  "token": "<temporary-token>",
  "password": "a-strong-password",
  "passwordConfirmation": "a-strong-password"
}
```

The token expires after 15 minutes and is invalidated when used. Users who
already supplied a password during public registration do not receive this
temporary token. In production, `POST /auth/activation/set-password` is
rejected. Administrators cannot use `PATCH /users/:id` to set a password for a
passwordless account; its initial password must be set with this activation
token.

Start a session or send a code with `POST /auth/login`:

```json
{ "email": "user@example.com" }
```

Outside production, the email configured in `SEED_ADMIN_EMAIL` receives a
session cookie and `{ "verificationRequired": false }`. Every other account,
and every account in production, receives a verification code and
`{ "verificationRequired": true }`. That response is deliberately generic and
does not disclose whether the account exists. The same endpoint sends a new
code from the verification screen. Codes expire after 10 minutes, are
single-use, allow at most five verification attempts, and are limited to five
sends per hour with a one-minute cooldown. A failed initial delivery leaves the
account pending; retry through `POST /auth/login` rather than creating that
user again. The activation schema is managed by the SQL script and is not
applied automatically at application startup. The SQL preserves all existing
password values.

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
