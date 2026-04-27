import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";
import { TeamMemberCategory } from "@prisma/client";

export const createTeamMember = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { fullName, degree, designation, category, description } = req.body;

        if (!fullName?.trim()) {
            res.status(400).json({
                messages: [{ type: "error", message: "Full name is required." }],
                data: null,
            });
            return;
        }

        // if (!degree?.trim()) {
        //     res.status(400).json({
        //         messages: [{ type: "error", message: "Degree is required." }],
        //         data: null,
        //     });
        //     return;
        // }

        // if (!designation?.trim()) {
        //     res.status(400).json({
        //         messages: [{ type: "error", message: "Designation is required." }],
        //         data: null,
        //     });
        //     return;
        // }

        if (!category?.trim()) {
            res.status(400).json({
                messages: [{ type: "error", message: "Category is required." }],
                data: null,
            });
            return;
        }

        // if (!description?.trim()) {
        //     res.status(400).json({
        //         messages: [{ type: "error", message: "Description is required." }],
        //         data: null,
        //     });
        //     return;
        // }

        if (!req.file) {
            res.status(400).json({
                messages: [{ type: "error", message: "Image is required." }],
                data: null,
            });
            return;
        }

        const normalizedCategory = String(category).trim().toUpperCase();

        const allowedCategories = Object.values(TeamMemberCategory);

        if (!allowedCategories.includes(normalizedCategory as TeamMemberCategory)) {
            res.status(400).json({
                messages: [
                    {
                        type: "error",
                        message: "Invalid category. Allowed values are CLINICAL, EDUCATION, BOTH.",
                    },
                ],
                data: null,
            });
            return;
        }

        const pictureUrl = `${process.env.ADMIN_APP_URI}/images/${req.file.filename}`;

        const teamMember = await prisma.teamMember.create({
            data: {
                fullName: fullName.trim(),
                degree: degree.trim(),
                designation: designation.trim(),
                category: normalizedCategory as TeamMemberCategory,
                description: description.trim(),
                pictureUrl,
            },
        });

        res.status(201).json({
            messages: [
                { type: "success", message: "Team member created successfully." },
            ],
            data: teamMember,
        });
    } catch (error: any) {
        console.error("Error creating team member:", error);

        res.status(500).json({
            messages: [{ type: "error", message: "Could not create team member." }],
            data: null,
        });
    }
};