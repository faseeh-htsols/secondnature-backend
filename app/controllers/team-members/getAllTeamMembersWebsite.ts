import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const getAllTeamMembersWebsite = async (
    req: Request,
    res: Response
): Promise<void> => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);

    const skip = (page - 1) * limit;

    try {
        const [teamMembers, total] = await Promise.all([
            prisma.teamMember.findMany({
                skip,
                take: limit,
                orderBy: {
                    id: "asc",
                },
                select: {
                    id: true,
                    fullName: true,
                    degree: true,
                    designation: true,
                    category: true,
                    description: true,
                    pictureUrl: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),

            prisma.teamMember.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            messages: [
                { type: "success", message: "Team members fetched successfully." },
            ],
            data: {
                teamMembers,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            },
        });
    } catch (error: any) {
        console.error("Error fetching team members:", error);

        res.status(500).json({
            messages: [{ type: "error", message: "Could not fetch team members." }],
            data: null,
        });
    }
};