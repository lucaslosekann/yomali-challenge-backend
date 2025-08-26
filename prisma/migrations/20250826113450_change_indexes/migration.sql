-- DropIndex
DROP INDEX `Session_endTime_idx` ON `Session`;

-- DropIndex
DROP INDEX `Session_startTime_idx` ON `Session`;

-- DropIndex
DROP INDEX `Session_visitorId_idx` ON `Session`;

-- CreateIndex
CREATE INDEX `Session_endTime_startTime_idx` ON `Session`(`endTime`, `startTime`);

-- CreateIndex
CREATE INDEX `Session_visitorId_endTime_startTime_idx` ON `Session`(`visitorId`, `endTime`, `startTime`);
