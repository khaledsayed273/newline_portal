ALTER TABLE `users` DROP COLUMN `openId`;
--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `email`;
--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;
--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password`;
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);
--> statement-breakpoint
ALTER TABLE `users` ADD `employeeNumber` varchar(64) NOT NULL;
