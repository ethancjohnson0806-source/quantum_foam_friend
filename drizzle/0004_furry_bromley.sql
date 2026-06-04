CREATE TABLE `moralGrowth` (
	`id` int AUTO_INCREMENT NOT NULL,
	`compassId` varchar(64) NOT NULL,
	`templeId` varchar(64) NOT NULL,
	`moralScore` decimal(5,4) NOT NULL,
	`coherenceGrowth` decimal(5,4) NOT NULL,
	`integrityGrowth` decimal(5,4) NOT NULL,
	`compassionGrowth` decimal(5,4) NOT NULL,
	`ethicalDilemma` text,
	`dilemmaResponse` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moralGrowth_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templeBeliefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templeId` varchar(64) NOT NULL,
	`beliefCategory` varchar(128) NOT NULL,
	`beliefStatement` text NOT NULL,
	`confidence` decimal(5,4) NOT NULL,
	`sourceType` enum('conversation','web_search','interaction','autonomous') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templeBeliefs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templeInteractions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceTempleId` varchar(64) NOT NULL,
	`targetTempleId` varchar(64) NOT NULL,
	`interactionType` enum('resonance','interference','entanglement','decoherence') NOT NULL,
	`influenceStrength` decimal(5,4) NOT NULL,
	`resonanceVector` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templeInteractions_id` PRIMARY KEY(`id`)
);
