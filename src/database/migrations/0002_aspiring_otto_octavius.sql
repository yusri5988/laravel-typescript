CREATE TABLE `auth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`revoked_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `auth_sessions_user_id_idx` ON `auth_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `auth_sessions_expires_at_idx` ON `auth_sessions` (`expires_at`);--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_email_verification_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_email_verification_tokens`("id", "user_id", "token_hash", "expires_at", "created_at") SELECT "id", "user_id", "token_hash", "expires_at", "created_at" FROM `email_verification_tokens`;--> statement-breakpoint
DROP TABLE `email_verification_tokens`;--> statement-breakpoint
ALTER TABLE `__new_email_verification_tokens` RENAME TO `email_verification_tokens`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_tokens_token_hash_unique` ON `email_verification_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `email_verification_tokens_user_id_idx` ON `email_verification_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_verification_tokens_expires_at_idx` ON `email_verification_tokens` (`expires_at`);--> statement-breakpoint
CREATE TABLE `__new_password_reset_tokens` (
	`email` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`email`) REFERENCES `users`(`email`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_password_reset_tokens`("email", "token_hash", "expires_at", "created_at") SELECT "email", "token_hash", "expires_at", "created_at" FROM `password_reset_tokens`;--> statement-breakpoint
DROP TABLE `password_reset_tokens`;--> statement-breakpoint
ALTER TABLE `__new_password_reset_tokens` RENAME TO `password_reset_tokens`;--> statement-breakpoint
CREATE INDEX `password_reset_tokens_expires_at_idx` ON `password_reset_tokens` (`expires_at`);