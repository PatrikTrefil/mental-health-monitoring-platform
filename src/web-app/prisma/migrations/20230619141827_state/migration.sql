/*
  Warnings:

  - The primary key for the `Task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isCompleted` on the `Task` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "state" TEXT NOT NULL DEFAULT 'CREATED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "forUserId" TEXT NOT NULL,
    "createdByEmployeeId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "submissionId" TEXT
);
INSERT INTO "new_Task" ("createdAt", "createdByEmployeeId", "description", "forUserId", "formId", "id", "name", "updatedAt") SELECT "createdAt", "createdByEmployeeId", "description", "forUserId", "formId", "id", "name", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
