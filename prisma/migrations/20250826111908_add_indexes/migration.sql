/*
  Warnings:

  - Made the column `endTime` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Session` MODIFY `endTime` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE INDEX `PageView_timestamp_idx` ON `PageView`(`timestamp`);

-- CreateIndex
CREATE INDEX `PageView_pageUrl_idx` ON `PageView`(`pageUrl`);

-- CreateIndex
CREATE INDEX `PageView_pageUrl_timestamp_idx` ON `PageView`(`pageUrl`, `timestamp`);

-- CreateIndex
CREATE INDEX `Session_visitorId_idx` ON `Session`(`visitorId`);

-- CreateIndex
CREATE INDEX `Session_startTime_idx` ON `Session`(`startTime`);

-- CreateIndex
CREATE INDEX `Session_endTime_idx` ON `Session`(`endTime`);

-- CreateIndex
CREATE INDEX `Session_os_idx` ON `Session`(`os`);

-- CreateIndex
CREATE INDEX `Session_browser_idx` ON `Session`(`browser`);

-- CreateIndex
CREATE INDEX `Session_referrer_idx` ON `Session`(`referrer`);

-- RenameIndex
ALTER TABLE `PageView` RENAME INDEX `PageView_sessionId_fkey` TO `PageView_sessionId_idx`;
