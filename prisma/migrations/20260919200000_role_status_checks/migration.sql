-- SQLite has no native enum support and no ALTER TABLE ... ADD CHECK.
-- Rebuild User and AttendanceRecord to enforce allowed role/status values.

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Rebuild User with role CHECK constraint
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL CHECK ("role" IN ('ADMIN','TEACHER','STUDENT','PARENT')),
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "passwordHash", "role", "updatedAt")
SELECT "createdAt", "email", "id", "name", "passwordHash", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Rebuild AttendanceRecord with status CHECK constraint
CREATE TABLE "new_AttendanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentProfileId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL CHECK ("status" IN ('PRESENT','ABSENT','LATE','EXCUSED')),
    "markedById" TEXT NOT NULL,
    CONSTRAINT "AttendanceRecord_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AttendanceRecord_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AttendanceRecord_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AttendanceRecord" ("classId", "date", "id", "markedById", "status", "studentProfileId")
SELECT "classId", "date", "id", "markedById", "status", "studentProfileId" FROM "AttendanceRecord";
DROP TABLE "AttendanceRecord";
ALTER TABLE "new_AttendanceRecord" RENAME TO "AttendanceRecord";
CREATE INDEX "AttendanceRecord_classId_date_idx" ON "AttendanceRecord"("classId", "date");
CREATE INDEX "AttendanceRecord_studentProfileId_idx" ON "AttendanceRecord"("studentProfileId");
CREATE UNIQUE INDEX "AttendanceRecord_studentProfileId_classId_date_key" ON "AttendanceRecord"("studentProfileId", "classId", "date");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;