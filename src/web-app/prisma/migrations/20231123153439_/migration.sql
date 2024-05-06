/*
  Warnings:

  - The values [READY] on the enum `TaskState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskState_new" AS ENUM ('UNCOMPLETED', 'PARTIALLY_COMPLETED', 'COMPLETED');
ALTER TABLE "Task" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "state" TYPE "TaskState_new" USING ("state"::text::"TaskState_new");
ALTER TYPE "TaskState" RENAME TO "TaskState_old";
ALTER TYPE "TaskState_new" RENAME TO "TaskState";
DROP TYPE "TaskState_old";
ALTER TABLE "Task" ALTER COLUMN "state" SET DEFAULT 'UNCOMPLETED';
COMMIT;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "state" SET DEFAULT 'UNCOMPLETED';
