CREATE TABLE `course_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_path_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pathId` int NOT NULL,
	`courseId` int NOT NULL,
	`order` int DEFAULT 0,
	CONSTRAINT `course_path_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_paths` (
	`id` int AUTO_INCREMENT NOT NULL,
	`departmentId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`order` int DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_paths_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`userId` int,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lesson_watch_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userIdentifier` varchar(128) NOT NULL,
	`lessonId` int NOT NULL,
	`courseId` int NOT NULL,
	`watchedSeconds` int NOT NULL DEFAULT 0,
	`totalSeconds` int NOT NULL DEFAULT 0,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lesson_watch_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainee_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userIdentifier` varchar(128) NOT NULL,
	`fullName` varchar(128) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainee_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `trainee_profiles_userIdentifier_unique` UNIQUE(`userIdentifier`)
);
