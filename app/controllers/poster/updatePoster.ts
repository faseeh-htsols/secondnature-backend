import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const updatePoster = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const id = Number(req.params.id);

    if (!id) {
        res.status(400).json({
            messages: [{ type: "error", message: "Valid poster id is required." }],
            data: null,
        });
        return;
    }

    try {
        const {
            showCloseButton,
            buttonOneText,
            buttonOneUrl,
            buttonTwoText,
            buttonTwoUrl,
            isActive,
        } = req.body;

        const existingPoster = await prisma.poster.findUnique({
            where: { id },
            select: {
                id: true,
                imageUrl: true,
                showCloseButton: true,
                isActive: true,
            },
        });

        if (!existingPoster) {
            res.status(404).json({
                messages: [{ type: "error", message: "Poster not found." }],
                data: null,
            });
            return;
        }

        const imageUrl = req.file
            ? `${process.env.ADMIN_APP_URI}/images/${req.file.filename}`
            : existingPoster.imageUrl;

        const poster = await prisma.poster.update({
            where: { id },
            data: {
                imageUrl,
                showCloseButton:
                    showCloseButton !== undefined
                        ? String(showCloseButton) === "true"
                        : existingPoster.showCloseButton,
                buttonOneText: buttonOneText?.trim() || null,
                buttonOneUrl: buttonOneUrl?.trim() || null,
                buttonTwoText: buttonTwoText?.trim() || null,
                buttonTwoUrl: buttonTwoUrl?.trim() || null,
                isActive:
                    isActive !== undefined
                        ? String(isActive) === "true"
                        : existingPoster.isActive,
            },
            select: {
                id: true,
                imageUrl: true,
                showCloseButton: true,
                buttonOneText: true,
                buttonOneUrl: true,
                buttonTwoText: true,
                buttonTwoUrl: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.status(200).json({
            messages: [{ type: "success", message: "Poster updated successfully." }],
            data: { poster },
        });
    } catch (error: any) {
        console.error("Error updating poster:", error);

        res.status(500).json({
            messages: [{ type: "error", message: "Could not update poster." }],
            data: null,
        });
    }
};