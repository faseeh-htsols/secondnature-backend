-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(300) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `reset_token` VARCHAR(500) NULL,
    `reset_token_expiry` DATETIME(3) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `author` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `pictureUrl` VARCHAR(191) NOT NULL,
    `bio` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `pictureUrl` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `authorId` INTEGER NOT NULL,
    `publishedDate` DATETIME(3) NULL,
    `scheduledDate` DATETIME(3) NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `shouldAutoPublish` BOOLEAN NOT NULL DEFAULT true,
    `contentJson` JSON NOT NULL,
    `contentHtml` MEDIUMTEXT NULL,
    `faqs` JSON NULL,
    `wordCount` INTEGER NULL DEFAULT 0,
    `readingTimeMin` INTEGER NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_slug_key`(`slug`),
    INDEX `blog_authorId_idx`(`authorId`),
    INDEX `blog_isPublished_publishedDate_idx`(`isPublished`, `publishedDate`),
    INDEX `blog_scheduledDate_idx`(`scheduledDate`),
    FULLTEXT INDEX `blog_title_contentHtml_idx`(`title`, `contentHtml`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_seo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blogId` INTEGER NOT NULL,
    `seoTitle` VARCHAR(255) NULL,
    `seoDescription` VARCHAR(500) NULL,
    `seoImageAlt` VARCHAR(255) NULL,
    `schemaJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_seo_blogId_key`(`blogId`),
    INDEX `blogseo_blogId_idx`(`blogId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tag_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blogId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `blog_tag_blogId_idx`(`blogId`),
    INDEX `blog_tag_tagId_idx`(`tagId`),
    UNIQUE INDEX `blog_tag_blogId_tagId_key`(`blogId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blog` ADD CONSTRAINT `blog_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `author`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_seo` ADD CONSTRAINT `blog_seo_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `blog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_tag` ADD CONSTRAINT `blog_tag_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `blog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_tag` ADD CONSTRAINT `blog_tag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
