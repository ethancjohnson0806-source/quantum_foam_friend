CREATE TABLE `templeMemories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templeId` varchar(64) NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`emotionalContext` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templeMemories_id` PRIMARY KEY(`id`)
);
