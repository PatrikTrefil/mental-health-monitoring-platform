import { Metadata } from "next";
import SubmissionPreview from "./SubmissionPreview";

export const metadata: Metadata = {
    title: "Náhled odevzdání formuláře",
};

/**
 * Page for previewing a submission.
 * @param root0 - Props for the component.
 * @param root0.params - Params from the URL.
 * @param root0.params.formId - ID of the form to preview.
 * @param root0.params.submissionId - ID of the submission to preview.
 */
export default function SubmissionPreviewPage({
    params,
}: {
    params: { formId: string; submissionId: string };
}) {
    return <SubmissionPreview {...params} />;
}
