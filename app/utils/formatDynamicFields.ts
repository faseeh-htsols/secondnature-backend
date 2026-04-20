// src/utils/formatDynamicFields.ts
export interface IEmailField {
    label: string;
    value: string;
}

const RESERVED_KEYS = new Set([
    "formType",
    "templateName",
    "subject",
    "page",
    "_csrf",
]);

const prettifyLabel = (key: string): string => {
    return key
        .replace(/[_-]+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "N/A";

    if (Array.isArray(value)) {
        return value.map(normalizeValue).join(", ");
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
};

const flattenObject = (
    obj: Record<string, unknown>,
    parentKey = ""
): IEmailField[] => {
    const result: IEmailField[] = [];

    for (const [key, value] of Object.entries(obj)) {
        if (RESERVED_KEYS.has(key)) continue;

        const fullKey = parentKey ? `${parentKey} - ${prettifyLabel(key)}` : prettifyLabel(key);

        if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            !(value instanceof Date)
        ) {
            result.push(...flattenObject(value as Record<string, unknown>, fullKey));
        } else {
            result.push({
                label: fullKey,
                value: normalizeValue(value),
            });
        }
    }

    return result;
};

export const formatDynamicFields = (
    body: Record<string, unknown>
): IEmailField[] => {
    return flattenObject(body).filter(
        (field) => field.value !== "N/A" && field.value.trim() !== ""
    );
};