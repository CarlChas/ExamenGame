-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "equipment" JSONB,
ADD COLUMN     "maxHp" INTEGER,
ADD COLUMN     "maxMp" INTEGER,
ALTER COLUMN "currentHp" DROP DEFAULT,
ALTER COLUMN "currentMp" DROP DEFAULT;
