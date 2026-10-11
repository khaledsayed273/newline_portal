CREATE TABLE `course_completion_certs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`userIdentifier` varchar(128) NOT NULL,
	`fullName` varchar(256) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`courseName` varchar(512) NOT NULL,
	`departmentName` varchar(128),
	`score` int NOT NULL DEFAULT 0,
	`certCode` varchar(64) NOT NULL,
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_completion_certs_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_completion_certs_certCode_unique` UNIQUE(`certCode`)
);
--> statement-breakpoint
CREATE TABLE `course_exam_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`userIdentifier` varchar(128) NOT NULL,
	`answers` json NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`isPassed` boolean NOT NULL DEFAULT false,
	`attemptedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_exam_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`questions` json NOT NULL,
	`passingScore` int NOT NULL DEFAULT 70,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_exams_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_exams_courseId_unique` UNIQUE(`courseId`)
);
--> statement-breakpoint
CREATE TABLE `course_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`userIdentifier` varchar(128) NOT NULL,
	`q1` int NOT NULL,
	`q2` int NOT NULL,
	`q3` int NOT NULL,
	`q4` int NOT NULL,
	`q5` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_ratings_id` PRIMARY KEY(`id`)
);
