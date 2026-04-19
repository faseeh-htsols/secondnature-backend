import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const getPoster = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const poster = await prisma.poster.findFirst({
            orderBy: {
                id: "desc",
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

        if (!poster) {
            res.status(404).json({
                messages: [{ type: "error", message: "Poster not found." }],
                data: null,
            });
            return;
        }

        res.status(200).json({
            messages: [{ type: "success", message: "Poster fetched successfully." }],
            data: { poster },
        });
    } catch (error: any) {
        console.error("Error fetching poster:", error);

        res.status(500).json({
            messages: [{ type: "error", message: "Could not fetch poster." }],
            data: null,
        });
    }
};