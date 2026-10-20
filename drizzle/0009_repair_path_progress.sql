ALTER TABLE `trainee_profiles` ADD COLUMN `userId` int NULL;--> statement-breakpoint
UPDATE `trainee_profiles` tp INNER JOIN `users` u ON u.`employeeNumber` = tp.`employeeId` SET tp.`userId` = u.`id`;--> statement-breakpoint
DELETE FROM `trainee_profiles` WHERE `userId` IS NULL;--> statement-breakpoint
ALTER TABLE `path_progress` ADD COLUMN `userId` int NULL;--> statement-breakpoint
UPDATE `path_progress` p INNER JOIN `trainee_profiles` tp ON tp.`userIdentifier` = p.`userIdentifier` SET p.`userId` = tp.`userId`;--> statement-breakpoint
DELETE FROM `path_progress` WHERE `userId` IS NULL;--> statement-breakpoint
ALTER TABLE `lesson_watch_progress` ADD COLUMN `userId` int NULL;--> statement-breakpoint
UPDATE `lesson_watch_progress` p INNER JOIN `trainee_profiles` tp ON tp.`userIdentifier` = p.`userIdentifier` SET p.`userId` = tp.`userId`;--> statement-breakpoint
DELETE FROM `lesson_watch_progress` WHERE `userId` IS NULL;--> statement-breakpoint
ALTER TABLE `course_ratings` ADD COLUMN `userId` int NULL;--> statement-breakpoint
UPDATE `course_ratings` r INNER JOIN `trainee_profiles` tp ON tp.`userIdentifier` = r.`userIdentifier` SET r.`userId` = tp.`userId`;--> statement-breakpoint
DELETE FROM `course_ratings` WHERE `userId` IS NULL;--> statement-breakpoint
ALTER TABLE `course_exam_attempts` ADD COLUMN `userId` int NULL;--> statement-breakpoint
UPDATE `course_exam_attempts` a INNER JOIN `trainee_profiles` tp ON tp.`userIdentifier` = a.`userIdentifier` SET a.`userId` = tp.`userId`;--> statement-breakpoint
DELETE FROM `course_exam_attempts` WHERE `userId` IS NULL;--> statement-breakpoint
ALTER TABLE `course_completion_certs` ADD COLUMN `userId` int NULL;--> statement-breakpoint
UPDATE `course_completion_certs` c INNER JOIN `trainee_profiles` tp ON tp.`userIdentifier` = c.`userIdentifier` SET c.`userId` = tp.`userId`;--> statement-breakpoint
DELETE FROM `course_completion_certs` WHERE `userId` IS NULL;--> statement-breakpoint
ALTER TABLE `path_progress` DROP COLUMN `userIdentifier`;--> statement-breakpoint
ALTER TABLE `lesson_watch_progress` DROP COLUMN `userIdentifier`;--> statement-breakpoint
ALTER TABLE `course_ratings` DROP COLUMN `userIdentifier`;--> statement-breakpoint
ALTER TABLE `course_exam_attempts` DROP COLUMN `userIdentifier`;--> statement-breakpoint
ALTER TABLE `course_completion_certs` DROP COLUMN `userIdentifier`;--> statement-breakpoint
ALTER TABLE `trainee_profiles` DROP INDEX `trainee_profiles_userIdentifier_unique`;--> statement-breakpoint
ALTER TABLE `trainee_profiles` DROP COLUMN `userIdentifier`;--> statement-breakpoint
ALTER TABLE `trainee_profiles` MODIFY COLUMN `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `path_progress` MODIFY COLUMN `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `lesson_watch_progress` MODIFY COLUMN `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `course_ratings` MODIFY COLUMN `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `course_exam_attempts` MODIFY COLUMN `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `course_completion_certs` MODIFY COLUMN `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `trainee_profiles` ADD CONSTRAINT `trainee_profiles_userId_unique` UNIQUE(`userId`);
