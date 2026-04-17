-- CreateTable
CREATE TABLE `cta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` VARCHAR(191) NOT NULL,
    `heading` VARCHAR(255) NOT NULL,
    `paragraph` TEXT NOT NULL,
    `buttonText` VARCHAR(100) NOT NULL,
    `buttonHref` VARCHAR(500) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_cta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blogId` INTEGER NOT NULL,
    `ctaId` INTEGER NOT NULL,
    `sectionIndex` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `blog_cta_blogId_idx`(`blogId`),
    INDEX `blog_cta_ctaId_idx`(`ctaId`),
    UNIQUE INDEX `blog_cta_blogId_ctaId_sectionIndex_key`(`blogId`, `ctaId`, `sectionIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blog_cta` ADD CONSTRAINT `blog_cta_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `blog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_cta` ADD CONSTRAINT `blog_cta_ctaId_fkey` FOREIGN KEY (`ctaId`) REFERENCES `cta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
