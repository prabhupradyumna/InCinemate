import { sequelize } from '../db.js'

async function fixApprovalEnum() {
  try {
    console.log('[fix-approval-enum] Creating enum if not exists...')
    await sequelize.query(`DO $$
    BEGIN
      CREATE TYPE "public"."enum_movies_approval_status" AS ENUM ('draft','pending_review','approved','published','archived');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`)

    console.log('[fix-approval-enum] Altering column type using USING...')
    await sequelize.query(`ALTER TABLE "movies"
      ALTER COLUMN "approval_status" DROP DEFAULT,
      ALTER COLUMN "approval_status" TYPE "public"."enum_movies_approval_status"
      USING ("approval_status"::"public"."enum_movies_approval_status");`)

    console.log('[fix-approval-enum] Setting default...')
    await sequelize.query(`ALTER TABLE "movies" ALTER COLUMN "approval_status" SET DEFAULT 'draft';`)

    console.log('[fix-approval-enum] Adding comment...')
    await sequelize.query(`COMMENT ON COLUMN "movies"."approval_status" IS 'Movie approval workflow status';`)

    console.log('[fix-approval-enum] Done.')
  } catch (e) {
    console.error('[fix-approval-enum] Error:', e.message)
    process.exitCode = 1
  } finally {
    process.exit()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fixApprovalEnum()
}

export { fixApprovalEnum }
