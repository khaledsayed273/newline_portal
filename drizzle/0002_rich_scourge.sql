ALTER TABLE `enrollments` MODIFY COLUMN `completedLessons` json;--> statement-breakpoint
ALTER TABLE `job_descriptions` MODIFY COLUMN `responsibilities` json;--> statement-breakpoint
ALTER TABLE `job_descriptions` MODIFY COLUMN `requirements` json;--> statement-breakpoint
ALTER TABLE `quiz_attempts` MODIFY COLUMN `answers` json;--> statement-breakpoint
ALTER TABLE `quizzes` MODIFY COLUMN `questions` json;