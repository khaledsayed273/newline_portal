CREATE TABLE `consultations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userName` varchar(256),
	`userEmail` varchar(256),
	`department` varchar(256),
	`subject` varchar(512) NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','reviewed','replied','closed') NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultations_id` PRIMARY KEY(`id`)
);
