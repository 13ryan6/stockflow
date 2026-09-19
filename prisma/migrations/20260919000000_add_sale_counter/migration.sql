-- CreateTable
CREATE TABLE "sale_counter" (
    "id" INTEGER NOT NULL,
    "last" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sale_counter_pkey" PRIMARY KEY ("id")
);

-- Inicializa el contador con el mayor número de venta existente (formato SF-0001)
INSERT INTO "sale_counter" ("id", "last")
SELECT 1, COALESCE(MAX(CAST(SUBSTRING("number" FROM 4) AS INTEGER)), 0)
FROM "sales"
WHERE "number" ~ '^SF-[0-9]+$';
