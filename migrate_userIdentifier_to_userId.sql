-- ============================================================================
-- ترحيل الأعمدة من userIdentifier إلى userId لجميع الجداول المعنية
-- بدون فقدان البيانات (idempotent - يمكن تشغيله أكثر من مرة بأمان)
-- ============================================================================

-- Helper: إضافة عمود إذا لم يكن موجوداً
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DELIMITER //
CREATE PROCEDURE add_column_if_not_exists(IN p_table VARCHAR(64), IN p_column VARCHAR(64), IN p_definition TEXT)
BEGIN
  SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = p_table AND column_name = p_column
  );
  SET @sql = IF(@col_exists = 0,
    CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition),
    'SELECT "column already exists" AS msg'
  );
  PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
END //
DELIMITER ;

-- Helper: حذف عمود إذا كان موجوداً
DROP PROCEDURE IF EXISTS drop_column_if_exists;
DELIMITER //
CREATE PROCEDURE drop_column_if_exists(IN p_table VARCHAR(64), IN p_column VARCHAR(64))
BEGIN
  SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = p_table AND column_name = p_column
  );
  SET @sql = IF(@col_exists > 0,
    CONCAT('ALTER TABLE `', p_table, '` DROP COLUMN `', p_column, '`'),
    'SELECT "column does not exist" AS msg'
  );
  PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
END //
DELIMITER ;

-- ============================================================================
-- 1. جدول trainee_profiles
-- ============================================================================
-- إضافة userId إذا لم يكن موجوداً
CALL add_column_if_not_exists('trainee_profiles', 'userId', 'int NULL');

-- تحديث userId عبر الربط مع جدول users باستخدام employeeNumber = employeeId
UPDATE trainee_profiles tp
INNER JOIN users u ON u.employeeNumber = tp.employeeId
SET tp.userId = u.id
WHERE tp.userId IS NULL;

-- حذف الصفوف التي لم يتم ربطها (اختياري - مطابق للسلوك الأصلي في migration 0009)
-- DELETE FROM trainee_profiles WHERE userId IS NULL;

-- جعل userId NOT NULL إذا كانت جميع الصفوف محدثة
-- (تأكد من عدم وجود NULL قبل تشغيل السطر التالي)
-- ALTER TABLE trainee_profiles MODIFY COLUMN userId int NOT NULL;

-- إضافة unique constraint إذا لم تكن موجودة
-- يتم التعامل معه في نهاية السكريبت لكل الجداول

-- حذف العمود القديم userIdentifier إذا كان موجوداً
CALL drop_column_if_exists('trainee_profiles', 'userIdentifier');

-- ============================================================================
-- 2. جدول lesson_watch_progress
-- ============================================================================
CALL add_column_if_not_exists('lesson_watch_progress', 'userId', 'int NULL');

UPDATE lesson_watch_progress p
INNER JOIN trainee_profiles tp ON tp.userIdentifier = p.userIdentifier
SET p.userId = tp.userId
WHERE p.userId IS NULL;

-- DELETE FROM lesson_watch_progress WHERE userId IS NULL;
-- ALTER TABLE lesson_watch_progress MODIFY COLUMN userId int NOT NULL;

CALL drop_column_if_exists('lesson_watch_progress', 'userIdentifier');

-- ============================================================================
-- 3. جدول course_ratings
-- ============================================================================
CALL add_column_if_not_exists('course_ratings', 'userId', 'int NULL');

UPDATE course_ratings r
INNER JOIN trainee_profiles tp ON tp.userIdentifier = r.userIdentifier
SET r.userId = tp.userId
WHERE r.userId IS NULL;

-- DELETE FROM course_ratings WHERE userId IS NULL;
-- ALTER TABLE course_ratings MODIFY COLUMN userId int NOT NULL;

CALL drop_column_if_exists('course_ratings', 'userIdentifier');

-- ============================================================================
-- 4. جدول course_exam_attempts
-- ============================================================================
CALL add_column_if_not_exists('course_exam_attempts', 'userId', 'int NULL');

UPDATE course_exam_attempts a
INNER JOIN trainee_profiles tp ON tp.userIdentifier = a.userIdentifier
SET a.userId = tp.userId
WHERE a.userId IS NULL;

-- DELETE FROM course_exam_attempts WHERE userId IS NULL;
-- ALTER TABLE course_exam_attempts MODIFY COLUMN userId int NOT NULL;

CALL drop_column_if_exists('course_exam_attempts', 'userIdentifier');

-- ============================================================================
-- 5. جدول course_completion_certs
-- ============================================================================
CALL add_column_if_not_exists('course_completion_certs', 'userId', 'int NULL');

UPDATE course_completion_certs c
INNER JOIN trainee_profiles tp ON tp.userIdentifier = c.userIdentifier
SET c.userId = tp.userId
WHERE c.userId IS NULL;

-- DELETE FROM course_completion_certs WHERE userId IS NULL;
-- ALTER TABLE course_completion_certs MODIFY COLUMN userId int NOT NULL;

CALL drop_column_if_exists('course_completion_certs', 'userIdentifier');

-- ============================================================================
-- 6. إضافة قيود UNIQUE على (userId, lessonId) و (userId, courseId) إذا لم تكن موجودة
-- ============================================================================

-- lesson_watch_progress: unique(userId, lessonId)
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'lesson_watch_progress'
    AND index_name = 'lesson_watch_progress_userId_lessonId_unique'
);
SET @sql = IF(@idx_exists = 0,
  'ALTER TABLE lesson_watch_progress ADD CONSTRAINT lesson_watch_progress_userId_lessonId_unique UNIQUE(userId, lessonId)',
  'SELECT "index already exists" AS msg'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- enrollments: unique(userId, courseId) (إذا كان الجدول موجوداً)
SET @table_exists = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'enrollments'
);
SET @sql = IF(@table_exists > 0,
  'SET @idx2 = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ''enrollments'' AND index_name = ''enrollments_userId_courseId_unique''); SET @sql2 = IF(@idx2 = 0, ''ALTER TABLE enrollments ADD CONSTRAINT enrollments_userId_courseId_unique UNIQUE(userId, courseId)'', ''SELECT ''index exists'''' AS msg''); PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;',
  'SELECT "enrollments table does not exist" AS msg'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================================================================
-- 7. مسح الإجراءات المخزنة المساعدة
-- ============================================================================
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS drop_column_if_exists;

-- ============================================================================
-- 8. التحقق من الهيكل النهائي للجداول
-- ============================================================================
SELECT 'trainee_profiles' AS tbl;
DESCRIBE trainee_profiles;

SELECT 'lesson_watch_progress' AS tbl;
DESCRIBE lesson_watch_progress;

SELECT 'course_ratings' AS tbl;
DESCRIBE course_ratings;

SELECT 'course_exam_attempts' AS tbl;
DESCRIBE course_exam_attempts;

SELECT 'course_completion_certs' AS tbl;
DESCRIBE course_completion_certs;

-- ============================================================================
-- انتهى السكريبت
-- ============================================================================
