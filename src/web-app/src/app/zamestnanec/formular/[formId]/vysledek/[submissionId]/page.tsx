import { Metadata } from "next";
import SubmissionPreview from "./SubmissionPreview";

export const metadata: Metadata = {
    title: "Náhled odevzdaného formuláře",
};

/**
 * Page for previewing a submission.
 */
export default function SubmissionPreviewPage({
    params,
}: {
    params: { formId: string; submissionId: string };
}) {
    return <SubmissionPreview {...params} />;
}
