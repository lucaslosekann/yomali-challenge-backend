-- DropIndex
DROP INDEX `Session_browser_idx` ON `Session`;

-- DropIndex
DROP INDEX `Session_referrer_idx` ON `Session`;

-- CreateIndex
CREATE INDEX `Session_browser_endTime_startTime_idx` ON `Session`(`browser`, `endTime`, `startTime`);

-- CreateIndex
CREATE INDEX `Session_referrer_endTime_startTime_idx` ON `Session`(`referrer`, `endTime`, `startTime`);
