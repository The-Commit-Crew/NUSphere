-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false;
