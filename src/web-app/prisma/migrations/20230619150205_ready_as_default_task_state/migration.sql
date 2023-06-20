-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "state" TEXT NOT NULL DEFAULT 'READY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "forUserId" TEXT NOT NULL,
    "createdByEmployeeId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "submissionId" TEXT
);
INSERT INTO "new_Task" ("createdAt", "createdByEmployeeId", "description", "forUserId", "formId", "id", "name", "state", "submissionId", "updatedAt") SELECT "createdAt", "createdByEmployeeId", "description", "forUserId", "formId", "id", "name", "state", "submissionId", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
