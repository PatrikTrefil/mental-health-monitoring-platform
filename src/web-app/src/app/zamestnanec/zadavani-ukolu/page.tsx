import { Metadata } from "next";
import ZadavaniUkolu from "./ZadavaniUkolu";

export const metadata: Metadata = {
    title: "Zadávání úkolů",
};

export default function ZadavaniUkoluPage() {
    return (
        <main>
            <ZadavaniUkolu />
        </main>
    );
}
