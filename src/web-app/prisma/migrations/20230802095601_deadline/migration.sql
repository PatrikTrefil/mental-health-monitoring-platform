/*
  Warnings:

  - The `state` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TaskState" AS ENUM ('READY', 'PARTIALLY_COMPLETED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "state",
ADD COLUMN     "state" "TaskState" NOT NULL DEFAULT 'READY';

-- CreateTable
CREATE TABLE "Deadline" (
    "dueDateTime" TIMESTAMP(3) NOT NULL,
    "canBeCompletedAfterDeadline" BOOLEAN NOT NULL,
    "taskId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Deadline_taskId_key" ON "Deadline"("taskId");

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
