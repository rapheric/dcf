import React from "react";
import { Button, Space, Upload } from "antd";
import {
  SaveOutlined,
  UploadOutlined,
  CloseOutlined,
  SendOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import PDFGenerator from "./PDFGenerator";
import { ACCENT_LIME, PRIMARY_BLUE } from "../../../utils/constants";

const ActionButtons = ({
  readOnly,
  isActionDisabled,
  isSubmittingToRM,
  isCheckerSubmitting,
  isSavingDraft,
  checklist,
  docs,
  supportingDocs,
  creatorComment,
  onSaveDraft,
  onSubmitToRM,
  onSubmitToCheckers,
  onUploadSupportingDoc,
  onClose,
  comments,
}) => {
  const canSubmitToCoChecker =
    checklist?.status === "co_creator_review" &&
    docs.length > 0 &&
    docs.every((doc) =>
      [
        "submitted_for_review",
        "sighted",
        "waived",
        "deferred",
        "tbo",
        "approved",
        "submitted",
      ].includes((doc.action || "").toLowerCase()),
    );

  const allDocsApproved =
    docs.length > 0 && docs.every((doc) => doc.action === "submitted");

  const canSubmitToRM =
    docs.length > 0 &&
    docs.some((doc) => (doc.action || doc.status) === "pendingrm");

  // Fixed: Wrapper functions that handle close after submission
  const handleSubmitToRM = async () => {
    if (onSubmitToRM) {
      const result = await onSubmitToRM();
      // If submission was successful, close the modal
      if (result !== false) {
        // Assuming the function returns false on error
        onClose();
      }
    }
  };

  // Fixed: Wrapper functions that handle close after submission
  const handleSubmitToCheckers = async () => {
    if (onSubmitToCheckers) {
      const result = await onSubmitToCheckers();
      // If submission was successful, close the modal
      if (result !== false) {
        // Assuming the function returns false on error
        onClose();
      }
    }
  };

  return (
    <Space wrap>
      {/* PDF Generator */}
      <PDFGenerator
        checklist={checklist}
        docs={docs}
        supportingDocs={supportingDocs}
        creatorComment={creatorComment}
        comments={comments}
      />

      {/* Save Draft */}
      {!readOnly && (
        <Button
          key="save-draft"
          onClick={onSaveDraft}
          loading={isSavingDraft}
          icon={<SaveOutlined />}
          style={{
            borderColor: ACCENT_LIME,
            color: PRIMARY_BLUE,
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          Save Draft
        </Button>
      )}

      {/* Upload Supporting Doc */}
      {!readOnly && (
        <Upload
          key="upload-support"
          showUploadList={false}
          beforeUpload={(file) => {
            onUploadSupportingDoc(file);
            return false;
          }}
          disabled={isActionDisabled}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
        >
          <Button icon={<UploadOutlined />} style={{ borderRadius: "6px" }}>
            Upload Supporting Doc
          </Button>
        </Upload>
      )}

      {/* Close Button */}
      <Button
        key="cancel"
        onClick={onClose}
        icon={<CloseOutlined />}
        style={{ borderRadius: "6px" }}
      >
        Close
      </Button>

      {/* Submit to RM */}
      {!readOnly && (
        <Button
          key="submit"
          type="primary"
          disabled={isActionDisabled || !canSubmitToRM}
          loading={isSubmittingToRM}
          onClick={handleSubmitToRM} // Use the wrapper function
          icon={<SendOutlined />}
          style={{ borderRadius: "6px", fontWeight: 600 }}
        >
          Submit to RM
        </Button>
      )}

      {/* Submit to Co-Checker */}
      {!readOnly && (
        <Button
          key="submit-checker"
          type="primary"
          loading={isCheckerSubmitting}
          onClick={handleSubmitToCheckers} // Use the wrapper function
          disabled={!canSubmitToCoChecker}
          icon={<CheckCircleOutlined />}
          style={{
            backgroundColor: PRIMARY_BLUE,
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          Submit to Co-Checker
        </Button>
      )}
    </Space>
  );
};

export default ActionButtons;
