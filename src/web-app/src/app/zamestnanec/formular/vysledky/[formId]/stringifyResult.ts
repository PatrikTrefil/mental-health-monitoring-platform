import { LabeledDataValue } from "./ResultTable";

/**
 * Converts value to human readable string
 * @param labeledValue value of labeled data value to be stringified
 */
export default function stringifyResult(
    labeledValue: LabeledDataValue["value"]
): string {
    if (labeledValue === null || labeledValue === undefined) {
        return "Nevyplněno";
    }

    if (typeof labeledValue === "string") {
        return labeledValue;
    }

    if (typeof labeledValue === "number") {
        return labeledValue.toString();
    }

    if (typeof labeledValue === "boolean") {
        return labeledValue ? "Ano" : "Ne";
    }

    if (typeof labeledValue === "object") {
        if (Array.isArray(labeledValue)) {
            return labeledValue
                .map((item) => {
                    if (item.value) {
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
