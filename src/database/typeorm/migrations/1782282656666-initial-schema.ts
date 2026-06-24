import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1782282656666 implements MigrationInterface {
  name = 'InitialSchema1782282656666';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "gift_campaigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying(150) NOT NULL, "description" text, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_f1f443f32fb22c8c6061706beb6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "gift_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "code" character varying(50) NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "gift_id" uuid NOT NULL, CONSTRAINT "UQ_2ab475f14dfa3594af8a80c2e9b" UNIQUE ("code"), CONSTRAINT "PK_a18bf56cdcac2e27f2d22bc2f69" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "gifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(150) NOT NULL, "description" text, "type" character varying NOT NULL DEFAULT 'PHYSICAL', "status" character varying NOT NULL DEFAULT 'ACTIVE', "stock" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_54242922934e1f322861d116af7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "gift_claims" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" character varying(50) NOT NULL, "gift_id" uuid NOT NULL, "code" character varying, "status" character varying NOT NULL DEFAULT 'PENDING', "claimed_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_c6a4fb6ee3ea2e949c32cac8545" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'USER', "status" character varying NOT NULL DEFAULT 'active', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "gift_codes" ADD CONSTRAINT "FK_12483f2e7959a11115e1b005f33" FOREIGN KEY ("gift_id") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gift_claims" ADD CONSTRAINT "FK_74caf98026971b9b8e472215f9c" FOREIGN KEY ("gift_id") REFERENCES "gifts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gift_claims" DROP CONSTRAINT "FK_74caf98026971b9b8e472215f9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gift_codes" DROP CONSTRAINT "FK_12483f2e7959a11115e1b005f33"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "gift_claims"`);
    await queryRunner.query(`DROP TABLE "gifts"`);
    await queryRunner.query(`DROP TABLE "gift_codes"`);
    await queryRunner.query(`DROP TABLE "gift_campaigns"`);
  }
}
