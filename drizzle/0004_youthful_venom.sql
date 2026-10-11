CREATE TABLE `library_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`url` text NOT NULL,
	`source` varchar(128) NOT NULL,
	`sourceName` varchar(256),
	`category` varchar(128) NOT NULL,
	`subcategory` varchar(128),
	`level` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`duration` int,
	`contentType` enum('video','article','pdf','course','quiz','tool') DEFAULT 'video',
	`isFree` boolean NOT NULL DEFAULT true,
	`language` varchar(8) DEFAULT 'ar',
	`tags` json,
	`isPublished` boolean NOT NULL DEFAULT true,
	`viewCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `library_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_map_courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`departmentId` int,
	`departmentName` varchar(128),
	`pathName` varchar(128),
	`targetRole` varchar(256),
	`level` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`duration` int,
	`isRequired` boolean NOT NULL DEFAULT true,
	`contentTypes` json,
	`source` varchar(256),
	`sourceUrl` text,
	`category` varchar(128),
	`order` int DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `training_map_courses_id` PRIMARY KEY(`id`)
);
