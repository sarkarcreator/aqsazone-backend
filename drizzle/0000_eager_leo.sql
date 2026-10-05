CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` text NOT NULL,
	`details` text,
	`user_email` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `case_studies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int,
	`related_service_id` int,
	`title` varchar(255) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`client_business` varchar(255) NOT NULL,
	`problem` text NOT NULL,
	`objectives` text NOT NULL,
	`strategy` text NOT NULL,
	`work_performed` text NOT NULL,
	`tools` text,
	`implementation` text NOT NULL,
	`results` text NOT NULL,
	`cover_image` text,
	`is_featured` boolean NOT NULL DEFAULT false,
	`is_published` boolean NOT NULL DEFAULT true,
	`views_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `case_studies_id` PRIMARY KEY(`id`),
	CONSTRAINT `case_studies_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `client_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int NOT NULL,
	`project_name` varchar(255) NOT NULL,
	`service_name` text,
	`status` varchar(32) NOT NULL DEFAULT 'in_progress',
	`budget` text,
	`notes` text,
	`start_date` text,
	`end_date` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lead_id` int,
	`name` varchar(255) NOT NULL,
	`company` text,
	`email` varchar(320) NOT NULL,
	`phone` text,
	`whatsapp` text,
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`company` text,
	`email` varchar(320) NOT NULL,
	`phone` text,
	`whatsapp` text,
	`interested_service` text,
	`related_project` text,
	`budget` text,
	`message` text NOT NULL,
	`source` varchar(32) NOT NULL DEFAULT 'website',
	`status` varchar(32) NOT NULL DEFAULT 'new',
	`priority` varchar(32) NOT NULL DEFAULT 'medium',
	`notes` text,
	`follow_up_date` text,
	`assigned_person` varchar(255) DEFAULT 'Aqsa',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filename` varchar(255) NOT NULL,
	`file_type` varchar(32) NOT NULL,
	`url` text NOT NULL,
	`size` int NOT NULL DEFAULT 0,
	`alt_text` text,
	`caption` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`media_type` varchar(32) NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`caption` text,
	`alt_text` text,
	`embed_code` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`client_name` text,
	`category_id` int,
	`service_id` int,
	`short_description` text NOT NULL,
	`description` text NOT NULL,
	`challenge` text,
	`solution` text,
	`work_completed` text,
	`tools` json NOT NULL,
	`results` text,
	`project_date` text,
	`source_type` varchar(32) NOT NULL DEFAULT 'aqsa',
	`is_source_visible` boolean NOT NULL DEFAULT false,
	`format` varchar(32) NOT NULL DEFAULT 'multiple',
	`status` varchar(32) NOT NULL DEFAULT 'published',
	`is_featured` boolean NOT NULL DEFAULT false,
	`thumbnail_url` text,
	`live_url` text,
	`external_url` text,
	`views_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `service_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`description` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `service_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `service_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int,
	`name` varchar(255) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`icon` varchar(100) NOT NULL DEFAULT 'Sparkles',
	`short_description` text NOT NULL,
	`full_description` text NOT NULL,
	`features` json NOT NULL,
	`process` json NOT NULL,
	`faqs` json NOT NULL,
	`source_type` varchar(32) NOT NULL DEFAULT 'aqsa',
	`is_featured` boolean NOT NULL DEFAULT false,
	`is_published` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`views_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(191) NOT NULL,
	`value` text NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_name` varchar(255) NOT NULL,
	`position` varchar(255) NOT NULL,
	`company` varchar(255) NOT NULL,
	`avatar_url` text,
	`testimonial` text NOT NULL,
	`rating` int NOT NULL DEFAULT 5,
	`is_featured` boolean NOT NULL DEFAULT true,
	`is_published` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uid` varchar(128) NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`role` varchar(32) NOT NULL DEFAULT 'admin',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_uid_unique` UNIQUE(`uid`)
);
--> statement-breakpoint
ALTER TABLE `case_studies` ADD CONSTRAINT `case_studies_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `case_studies` ADD CONSTRAINT `case_studies_related_service_id_services_id_fk` FOREIGN KEY (`related_service_id`) REFERENCES `services`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `client_projects` ADD CONSTRAINT `client_projects_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_lead_id_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_media` ADD CONSTRAINT `project_media_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_category_id_service_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `service_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `services` ADD CONSTRAINT `services_category_id_service_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `service_categories`(`id`) ON DELETE no action ON UPDATE no action;