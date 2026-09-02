CREATE TABLE `donations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organization_id` integer NOT NULL,
	`created_by` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`servings` integer NOT NULL,
	`quantity_kg` real NOT NULL,
	`prepared_at` text NOT NULL,
	`pickup_by` text NOT NULL,
	`storage` text NOT NULL,
	`diet` text NOT NULL,
	`allergens` text DEFAULT 'None declared' NOT NULL,
	`address` text NOT NULL,
	`area` text NOT NULL,
	`distance_km` real DEFAULT 0 NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `donations_status_idx` ON `donations` (`status`);--> statement-breakpoint
CREATE INDEX `donations_area_idx` ON `donations` (`area`);--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pickup_id` integer NOT NULL,
	`rating` integer NOT NULL,
	`comment` text DEFAULT '' NOT NULL,
	`submitted_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`pickup_id`) REFERENCES `pickups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `impact_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`donation_id` integer NOT NULL,
	`meals_served` integer NOT NULL,
	`food_kg` real NOT NULL,
	`people_reached` integer NOT NULL,
	`carbon_kg_avoided` real NOT NULL,
	`completed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`donation_id`) REFERENCES `donations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `impact_donation_unique` ON `impact_events` (`donation_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`kind` text DEFAULT 'info' NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`user_email`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`address` text NOT NULL,
	`area` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`capacity` integer DEFAULT 0 NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `organizations_type_idx` ON `organizations` (`type`);--> statement-breakpoint
CREATE TABLE `pickups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`donation_id` integer NOT NULL,
	`receiver_organization_id` integer NOT NULL,
	`volunteer_name` text NOT NULL,
	`volunteer_phone` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'accepted' NOT NULL,
	`eta_minutes` integer DEFAULT 30 NOT NULL,
	`verification_code` text NOT NULL,
	`accepted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`collected_at` text,
	`delivered_at` text,
	FOREIGN KEY (`donation_id`) REFERENCES `donations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`receiver_organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pickup_donation_unique` ON `pickups` (`donation_id`);--> statement-breakpoint
CREATE INDEX `pickups_status_idx` ON `pickups` (`status`);--> statement-breakpoint
CREATE TABLE `safety_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`donation_id` integer NOT NULL,
	`sealed` integer DEFAULT false NOT NULL,
	`temperature_controlled` integer DEFAULT false NOT NULL,
	`allergen_labelled` integer DEFAULT false NOT NULL,
	`donor_declaration` integer DEFAULT false NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`checked_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`donation_id`) REFERENCES `donations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `safety_donation_unique` ON `safety_checks` (`donation_id`);--> statement-breakpoint
CREATE TABLE `status_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pickup_id` integer NOT NULL,
	`status` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`actor_email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`pickup_id`) REFERENCES `pickups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`email` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'donor' NOT NULL,
	`organization_id` integer,
	`phone` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
