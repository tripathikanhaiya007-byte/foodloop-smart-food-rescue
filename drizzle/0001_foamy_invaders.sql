CREATE TABLE `system_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `organizations` ADD `email` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `contact_person` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `registration_number` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `description` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `approval_status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
CREATE INDEX `organizations_approval_idx` ON `organizations` (`approval_status`);--> statement-breakpoint
ALTER TABLE `users` ADD `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `onboarding_complete` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `approved_at` text;--> statement-breakpoint
ALTER TABLE `users` ADD `approved_by` text;--> statement-breakpoint
CREATE INDEX `users_status_idx` ON `users` (`status`);--> statement-breakpoint
CREATE INDEX `users_organization_idx` ON `users` (`organization_id`);