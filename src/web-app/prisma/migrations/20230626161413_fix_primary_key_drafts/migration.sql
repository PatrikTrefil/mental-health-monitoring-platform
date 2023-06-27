/*
  Warnings:

  - The primary key for the `Draft` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Draft" (
    "formId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" TEXT NOT NULL,

    PRIMARY KEY ("formId", "userId")
);
INSERT INTO "new_Draft" ("data", "formId", "userId") SELECT "data", "formId", "userId" FROM "Draft";
DROP TABLE "Draft";
ALTER TABLE "new_Draft" RENAME TO "Draft";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
