import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";
import { TeamMemberCategory } from "@prisma/client";

export const updateTeamMember = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!id || Number.isNaN(id)) {
            res.status(400).json({
                messages: [
                    { type: "error", message: "Valid team member id is required." },
                ],
                data: null,
            });
            return;
        }

        const existingTeamMember = await prisma.teamMember.findUnique({
            where: { id },
        });

        if (!existingTeamMember) {
            res.status(404).json({
                messages: [{ type: "error", message: "Team member not found." }],
                data: null,
            });
            return;
        }

        const { fullName, degree, designation, category, description } = req.body;

        let normalizedCategory: TeamMemberCategory | undefined;

        if (
            category !== undefined &&
            category !== null &&
            String(category).trim() !== ""
        ) {
            const formattedCategory = String(category).trim().toUpperCase();

            const allowedCategories = Object.values(TeamMemberCategory);

            if (!allowedCategories.includes(formattedCategory as TeamMemberCategory)) {
                res.status(400).json({
                    messages: [
                        {
                            type: "error",
                            message:
                                "Invalid category. Allowed values are CLINICAL, EDUCATION, BOTH.",
                        },
                    ],
                    data: null,
                });
                return;
            }

            normalizedCategory = formattedCategory as TeamMemberCategory;
        }

        if (fullName !== undefined && String(fullName).trim() === "") {
            res.status(400).json({
                messages: [{ type: "error", message: "Full name cannot be empty." }],
                data: null,
            });
            return;
        }

        let pictureUrl = existingTeamMember.pictureUrl;

        if (req.file) {
            pictureUrl = `${process.env.ADMIN_APP_URI}/images/${req.file.filename}`;
        }

        const updatedTeamMember = await prisma.teamMember.update({
            where: { id },
            data: {
                fullName:
                    fullName !== undefined
                        ? String(fullName).trim()
                        : existingTeamMember.fullName,

                degree:
                    degree !== undefined
                        ? String(degree).trim() || null
                        : existingTeamMember.degree,

                designation:
                    designation !== undefined
                        ? String(designation).trim() || null
                        : existingTeamMember.designation,

                category: normalizedCategory ?? existingTeamMember.category,

                description:
                    description !== undefined
                        ? String(description).trim() || null
                        : existingTeamMember.description,

                pictureUrl,
            },
        });

        res.status(200).json({
            messages: [
                { type: "success", message: "Team member updated successfully." },
            ],
            data: updatedTeamMember,
        });
    } catch (error: any) {
        console.error("Error updating team member:", error);

        res.status(500).json({
            messages: [{ type: "error", message: "Could not update team member." }],
            data: null,
        });
    }
};