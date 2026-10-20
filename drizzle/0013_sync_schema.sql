ALTER TABLE `users` DROP COLUMN `openId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `email`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;--> statement-breakpoint
ALTER TABLE `users` ADD `employeeNumber` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `jobTitle` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_employeeNumber_unique` UNIQUE(`employeeNumber`);--> statement-breakpoint
ALTER TABLE `course_lessons` ADD `fileUrl` text;--> statement-breakpoint
ALTER TABLE `course_lessons` ADD `fileType` varchar(16);--> statement-breakpoint
ALTER TABLE `lesson_watch_progress` DROP COLUMN `userIdentifier`;--> statement-breakpoint
ALTER TABLE `lesson_watch_progress` ADD `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `course_ratings` DROP COLUMN `userIdentifier`;--> statement-breakpoint
ALTER TABLE `course_ratings` ADD `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `course_exam_attempts` DROP COLUMN `userIdentifier`;--> statement-breakpoint
ALTER TABLE `course_exam_attempts` ADD `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `course_completion_certs` DROP COLUMN `userIdentifier`;--> statement-breakpoint
ALTER TABLE `course_completion_certs` ADD `userId` int NOT NULL;
