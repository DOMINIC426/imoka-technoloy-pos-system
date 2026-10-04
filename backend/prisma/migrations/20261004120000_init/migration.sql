CREATE TYPE "UserRole" AS ENUM ('admin', 'cashier');

CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR(80) NOT NULL,
    "lastName" VARCHAR(80) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'cashier',
    "passwordSalt" VARCHAR(64) NOT NULL,
    "passwordHash" VARCHAR(128) NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "sku" VARCHAR(40) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "category" VARCHAR(32) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "stockTracked" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Product" ("id", "sku", "name", "category", "price", "stockTracked", "stock", "active", "updatedAt") VALUES
    ('10000000-0000-4000-8000-000000000001', 'P001', 'A4 Black & White Printing', 'Printing', 500, true, 100, true, CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000002', 'P002', 'A4 Colour Printing', 'Printing', 1000, true, 100, true, CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000003', 'P003', 'A3 Colour Printing', 'Printing', 2500, true, 50, true, CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000004', 'P004', 'Photocopy A4', 'Printing', 300, true, 200, true, CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000005', 'P005', 'Business Card Design', 'Graphics', 15000, true, 20, true, CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000006', 'P006', 'Lamination A4', 'Printing', 2000, true, 60, true, CURRENT_TIMESTAMP);

CREATE TABLE "Shift" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "openedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMPTZ(3),
    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Sale" (
    "id" UUID NOT NULL,
    "clientSaleId" VARCHAR(120) NOT NULL,
    "receiptNo" VARCHAR(80) NOT NULL,
    "cashierId" UUID NOT NULL,
    "shiftId" UUID,
    "customerName" VARCHAR(160) NOT NULL DEFAULT '',
    "payment" VARCHAR(40) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "change" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SaleItem" (
    "id" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "productId" UUID,
    "name" VARCHAR(160) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "userId" UUID NOT NULL,
    "shiftId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "actorName" VARCHAR(170) NOT NULL,
    "action" VARCHAR(80) NOT NULL,
    "entity" VARCHAR(40) NOT NULL,
    "entityId" VARCHAR(120),
    "details" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_createdAt_idx" ON "User"("role", "createdAt");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Product_active_name_idx" ON "Product"("active", "name");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Shift_userId_openedAt_idx" ON "Shift"("userId", "openedAt");
CREATE INDEX "Shift_closedAt_idx" ON "Shift"("closedAt");
CREATE UNIQUE INDEX "Shift_one_open_per_user_key" ON "Shift"("userId") WHERE "closedAt" IS NULL;
CREATE UNIQUE INDEX "Sale_cashierId_clientSaleId_key" ON "Sale"("cashierId", "clientSaleId");
CREATE INDEX "Sale_createdAt_idx" ON "Sale"("createdAt");
CREATE INDEX "Sale_shiftId_createdAt_idx" ON "Sale"("shiftId", "createdAt");
CREATE INDEX "Sale_cashierId_createdAt_idx" ON "Sale"("cashierId", "createdAt");
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");
CREATE INDEX "SaleItem_productId_idx" ON "SaleItem"("productId");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");
CREATE INDEX "Session_shiftId_idx" ON "Session"("shiftId");
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");
CREATE INDEX "AuditEvent_entity_entityId_idx" ON "AuditEvent"("entity", "entityId");
CREATE INDEX "AuditEvent_actorId_createdAt_idx" ON "AuditEvent"("actorId", "createdAt");

ALTER TABLE "Shift" ADD CONSTRAINT "Shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
