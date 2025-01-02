-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `referrer_id` INTEGER NULL,
    `referral_code` VARCHAR(191) NOT NULL,
    `telegram_id` INTEGER NOT NULL,
    `telegram_username` VARCHAR(191) NULL,
    `telegram_firstname` VARCHAR(191) NULL,
    `telegram_lastname` VARCHAR(191) NULL,
    `cricket_balance` DOUBLE NOT NULL DEFAULT 0,
    `this_match_apple_earning` DOUBLE NOT NULL DEFAULT 0,
    `previous_match_apple_earning` DOUBLE NOT NULL DEFAULT 0,
    `direct_referral_count` INTEGER NOT NULL DEFAULT 0,
    `downline_referral_count` INTEGER NOT NULL DEFAULT 0,
    `pets` JSON NULL,
    `closed_golden_modal` BOOLEAN NULL DEFAULT false,
    `apple_balance` DOUBLE NOT NULL DEFAULT 0,
    `apple_per_second` DOUBLE NOT NULL DEFAULT 0,
    `last_heartbeat` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_referral_code_key`(`referral_code`),
    UNIQUE INDEX `User_telegram_id_key`(`telegram_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Referral` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `referrer_id` INTEGER NOT NULL,
    `referred_id` INTEGER NOT NULL,
    `telegram_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBusiness` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `business_id` INTEGER NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `UserBusiness_user_id_business_id_key`(`user_id`, `business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Referral` ADD CONSTRAINT `Referral_referrer_id_fkey` FOREIGN KEY (`referrer_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Referral` ADD CONSTRAINT `Referral_referred_id_fkey` FOREIGN KEY (`referred_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBusiness` ADD CONSTRAINT `UserBusiness_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
