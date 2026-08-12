CREATE TABLE `sharedLearningItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(32) NOT NULL,
	`shareType` enum('material','examResult') NOT NULL,
	`title` varchar(500) NOT NULL,
	`level` enum('Başlangıç','Orta','İleri') NOT NULL,
	`sourceKind` enum('youtube','pdf') NOT NULL,
	`sourceTitle` varchar(500) NOT NULL,
	`payload` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sharedLearningItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `sharedLearningItems_slug_unique` UNIQUE(`slug`)
);
