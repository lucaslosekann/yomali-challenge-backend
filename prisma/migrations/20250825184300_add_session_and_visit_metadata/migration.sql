/*
  Warnings:

  - You are about to drop the `Visit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Visit`;

-- CreateTable
CREATE TABLE `Session` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `visitorId` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(191) NOT NULL,
    `userAgent` VARCHAR(191) NOT NULL,
    `browser` VARCHAR(191) NULL,
    `os` VARCHAR(191) NULL,
    `referrer` VARCHAR(191) NULL,
    `startTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endTime` DATETIME(3) NULL,

    INDEX `Session_visitorId_startTime_idx`(`visitorId`, `startTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageView` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` INTEGER NOT NULL,
    `pageUrl` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PageView_pageUrl_timestamp_idx`(`pageUrl`, `timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PageView` ADD CONSTRAINT `PageView_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
