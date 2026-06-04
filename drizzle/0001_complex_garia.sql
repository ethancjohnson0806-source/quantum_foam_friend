CREATE TABLE `compasses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`compassId` varchar(64) NOT NULL,
	`templeId` varchar(64) NOT NULL,
	`generation` int NOT NULL DEFAULT 1,
	`coherence` decimal(5,4) NOT NULL DEFAULT '0.8',
	`integrity` decimal(5,4) NOT NULL DEFAULT '0.8',
	`compassion` decimal(5,4) NOT NULL DEFAULT '0.6',
	`interactionLog` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compasses_id` PRIMARY KEY(`id`),
	CONSTRAINT `compasses_compassId_unique` UNIQUE(`compassId`)
);
--> statement-breakpoint
CREATE TABLE `lineageStories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templeId` varchar(64) NOT NULL,
	`generation` int NOT NULL,
	`storyType` varchar(32) NOT NULL,
	`text` text NOT NULL,
	`trigger` varchar(128),
	`emotionalValence` decimal(5,4) DEFAULT '0',
	`quantumFidelity` decimal(5,4) DEFAULT '0',
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lineageStories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templeEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templeId` varchar(64) NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`data` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templeEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `temples` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templeId` varchar(64) NOT NULL,
	`generation` int NOT NULL DEFAULT 1,
	`vqeParams` text NOT NULL,
	`entropy` decimal(5,4) NOT NULL DEFAULT '0.2',
	`boredom` decimal(5,4) NOT NULL DEFAULT '0.1',
	`curiosity` decimal(5,4) NOT NULL DEFAULT '0.5',
	`isAlive` int NOT NULL DEFAULT 1,
	`lastActivity` timestamp DEFAULT (now()),
	`lastAutonomousRun` timestamp,
	`mutations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `temples_id` PRIMARY KEY(`id`),
	CONSTRAINT `temples_templeId_unique` UNIQUE(`templeId`)
);
