-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Request" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "equipmentType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'новая',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "clientEmail" TEXT,
    "serviceId" TEXT,
    "clientId" INTEGER,
    "masterId" INTEGER,
    "equipmentId" INTEGER,
    "price" TEXT NOT NULL,
    CONSTRAINT "Request_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Request_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Request_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Request" ("clientEmail", "clientId", "clientName", "clientPhone", "completedAt", "createdAt", "description", "equipmentId", "equipmentType", "id", "masterId", "price", "serviceId", "status") SELECT "clientEmail", "clientId", "clientName", "clientPhone", "completedAt", "createdAt", "description", "equipmentId", "equipmentType", "id", "masterId", "price", "serviceId", "status" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
