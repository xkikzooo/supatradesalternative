/*
  Warnings:

  - You are about to drop the column `entry` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `exit` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `profit` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `symbol` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `bias` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direction` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pnl` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `result` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tradingPairId` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TradeDirection" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "TradeBias" AS ENUM ('BULLISH', 'BEARISH', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "TradeResult" AS ENUM ('WIN', 'LOSS', 'BREAKEVEN');

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "entry",
DROP COLUMN "exit",
DROP COLUMN "imageUrl",
DROP COLUMN "notes",
DROP COLUMN "profit",
DROP COLUMN "quantity",
DROP COLUMN "status",
DROP COLUMN "symbol",
DROP COLUMN "type",
ADD COLUMN     "bias" "TradeBias" NOT NULL,
ADD COLUMN     "biasExplanation" TEXT,
ADD COLUMN     "direction" "TradeDirection" NOT NULL,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "pnl" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "psychology" TEXT,
ADD COLUMN     "result" "TradeResult" NOT NULL,
ADD COLUMN     "tradingPairId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "TradeStatus";

-- DropEnum
DROP TYPE "TradeType";

-- CreateTable
CREATE TABLE "TradingPair" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradingPair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TradingPair_name_userId_key" ON "TradingPair"("name", "userId");

-- AddForeignKey
ALTER TABLE "TradingPair" ADD CONSTRAINT "TradingPair_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_tradingPairId_fkey" FOREIGN KEY ("tradingPairId") REFERENCES "TradingPair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
