-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "description" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Order_orderDate_idx" ON "Order"("orderDate");
