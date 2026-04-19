import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const createPoster = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const {
            showCloseButton,
            buttonOneText,
            buttonOneUrl,
            buttonTwoText,
            buttonTwoUrl,
            isActive,
        } = req.body;

        if (!req.file) {
            res.status(400).json({
                messages: [{ type: "error", message: "Image is required." }],
                data: null,
            });
            return;
        }

        const existingPoster = await prisma.poster.findFirst({
            select: { id: true },
        });

        if (existingPoster) {
            res.status(400).json({
                messages: [
                    {
                        type: "error",
                        message: "Poster already exists. You cannot create another poster.",
                    },
                ],
                data: null,
            });
            return;
        }

        const imageUrl = `${process.env.ADMIN_APP_URI}/images/${req.file.filename}`;

        const poster = await prisma.poster.create({
            data: {
                imageUrl,
                showCloseButton:
                    showCloseButton !== undefined
                        ? String(showCloseButton) === "true"
                        : true,
                buttonOneText: buttonOneText?.trim() || null,
                buttonOneUrl: buttonOneUrl?.trim() || null,
                buttonTwoText: buttonTwoText?.trim() || null,
                buttonTwoUrl: buttonTwoUrl?.trim() || null,
                isActive:
                    isActive !== undefined ? String(isActive) === "true" : true,
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

        res.status(201).json({
            messages: [{ type: "success", message: "Poster created successfully." }],
            data: { poster },
        });
    } catch (error: any) {
        console.error("Error creating poster:", error);

        res.status(500).json({
            messages: [{ type: "error", message: "Could not create poster." }],
            data: null,
        });
    }
};