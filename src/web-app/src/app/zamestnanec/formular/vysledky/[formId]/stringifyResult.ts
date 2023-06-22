export default function stringifyResult(value: unknown): string {
    if (value === null || value === undefined) {
        return "Nevyplněno";
    }

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "number") {
        return value.toString();
    }

    if (typeof value === "boolean") {
        return value ? "Ano" : "Ne";
    }

    if (typeof value === "object") {
        if (Array.isArray(value)) {
            return value
                .map((item) => {
                    if ("label" in item && "value" in item) {
                        return `${item.label}: ${stringifyResult(item.value)}`;
                    } else {
                        return "Nevyplněno";
                    }
                })
                .join(", ");
        }
    }

    return "";
}
