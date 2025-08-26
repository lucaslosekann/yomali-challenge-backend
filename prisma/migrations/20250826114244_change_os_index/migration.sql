-- DropIndex
DROP INDEX `Session_os_idx` ON `Session`;

-- CreateIndex
CREATE INDEX `Session_os_endTime_startTime_idx` ON `Session`(`os`, `endTime`, `startTime`);
