/*
  Warnings:

  - Added the required column `formId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "forUserId" TEXT NOT NULL,
    "createdByEmployeeId" TEXT NOT NULL,
    "formId" TEXT NOT NULL
);
INSERT INTO "new_Task" ("createdAt", "createdByEmployeeId", "description", "forUserId", "id", "isCompleted", "name", "updatedAt") SELECT "createdAt", "createdByEmployeeId", "description", "forUserId", "id", "isCompleted", "name", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
