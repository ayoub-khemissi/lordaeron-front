-- The shop's names and descriptions in the site's three other languages (Russian, Polish, Portuguese): until now an article showed its
-- English name and description there (lib/shop-utils.ts localizeShopItem reads name_<locale>, description_<locale>, English when empty).
-- Additive only (the site reads every column with SELECT *, an empty one falls back to English): safe before or after the site's deploy,
-- but the admin's item form writes these columns, so apply it before deploying a site that has them. Re-runnable (MySQL 8 has no
-- ADD COLUMN IF NOT EXISTS: each column is added only when information_schema does not list it).

DROP PROCEDURE IF EXISTS shop_items_add_column;
DELIMITER //
CREATE PROCEDURE shop_items_add_column(IN col VARCHAR(64), IN def VARCHAR(255))
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shop_items' AND COLUMN_NAME = col) THEN
    SET @ddl = CONCAT('ALTER TABLE shop_items ADD COLUMN `', col, '` ', def);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //
DELIMITER ;

CALL shop_items_add_column('name_ru', "VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' AFTER name_it");
CALL shop_items_add_column('name_pl', "VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' AFTER name_ru");
CALL shop_items_add_column('name_pt', "VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' AFTER name_pl");
CALL shop_items_add_column('description_ru', 'TEXT COLLATE utf8mb4_unicode_ci AFTER description_it');
CALL shop_items_add_column('description_pl', 'TEXT COLLATE utf8mb4_unicode_ci AFTER description_ru');
CALL shop_items_add_column('description_pt', 'TEXT COLLATE utf8mb4_unicode_ci AFTER description_pl');

DROP PROCEDURE shop_items_add_column;
