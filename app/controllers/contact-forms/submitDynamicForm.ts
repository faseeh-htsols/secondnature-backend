// src/controllers/forms/controller.ts
import { RequestHandler } from "express";
import { transporter } from "../../utils/mailer";
import { renderEmailTemplate } from "../../utils/render-email-template";
import { formatDynamicFields } from "../../utils/formatDynamicFields";

const FORM_RECIPIENTS: Record<string, string> = {
    contact: process.env.CONTACT_FORM_TO || "hello@yourdomain.com",
    quote: process.env.QUOTE_FORM_TO || "sales@yourdomain.com",
    careers: process.env.CAREERS_FORM_TO || "hr@yourdomain.com",
    default: process.env.DEFAULT_FORM_TO || "hello@yourdomain.com",
};

export const submitDynamicForm: RequestHandler = async (req, res, next) => {
    try {
        const body = req.body as Record<string, unknown>;

        const formType = String(body.formType || "default");
        const templateName = String(body.templateName || "dynamic-form");
        const subject = String(body.subject || `New ${formType} form submission`);
        const page = body.page ? String(body.page) : "N/A";

        const recipient = FORM_RECIPIENTS[formType] || FORM_RECIPIENTS.default;

        const fields = formatDynamicFields(body);

        if (!fields.length) {
            res.status(400).json({
                success: false,
                message: "No form fields found in request body.",
            });
            return;
        }

        const html = await renderEmailTemplate(templateName, {
            formType,
            subject,
            page,
            submittedAt: new Date().toLocaleString("en-PK", {
                timeZone: "America/Toronto",
            }),
            fields,
        });

        const text = [
            `Form Type: ${formType}`,
            `Subject: ${subject}`,
            `Page: ${page}`,
            "",
            ...fields.map((field) => `${field.label}: ${field.value}`),
        ].join("\n");

        await transporter.sendMail({
            from: `"Website Form" <${process.env.SMTP_FROM}>`,
            to: recipient,
            replyTo: typeof body.email === "string" ? body.email : undefined,
            subject,
            text,
            html,
        });

        res.status(200).json({
            success: true,
            message: "Form submitted successfully.",
        });
    } catch (error) {
        next(error);
    }
};