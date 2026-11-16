import { MigrationInterface, QueryRunner } from 'typeorm';

// Baseline: el esquema actual lo crea scripts/script_horario.sql.
// Esta migración no ejecuta DDL; solo registra el punto de partida en la
// tabla `migrations` para que las migraciones futuras se apliquen encima.
// En bases existentes basta correr `pnpm migration:run` una vez.
export class Baseline1700000000000 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
