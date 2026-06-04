ALTER TABLE `temples` ADD `coherence` decimal(5,4) DEFAULT '0.8' NOT NULL;--> statement-breakpoint
ALTER TABLE `temples` ADD `parentTempleId` varchar(64);