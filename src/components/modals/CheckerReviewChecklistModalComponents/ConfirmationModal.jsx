import React from "react";
import { Button, message } from "antd";

const ConfirmationModal = ({
  confirmAction,
  setConfirmAction,
  loading,
  submitCheckerAction,
  canApproveChecklist,
  checkerRejected,
  total,
  checkerReviewed,
  checkerApproved,
}) => {
  return (
    <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg w-96 shadow-lg text-center">
        <h3 className="text-lg font-bold mb-4">
          {confirmAction === "approved"
            ? "Approve Checklist?"
            : "Return to Creator?"}
        </h3>
        <p className="mb-6">
          {confirmAction === "approved"
            ? checkerRejected > 0
              ? `Cannot approve: ${checkerRejected} document(s) are rejected. Please review all documents.`
              : checkerReviewed !== total
                ? `Cannot approve: ${
                    total - checkerReviewed
                  } document(s) not reviewed yet.`
                : checkerApproved !== total
                  ? `Cannot approve: ${
                      total - checkerApproved
                    } document(s) not approved.`
                  : `This will approve all ${checkerApproved} approved documents. This action is final.`
            : "This will send the checklist back to the creator."}
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => setConfirmAction(null)}>Cancel</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              if (confirmAction === "approved" && !canApproveChecklist()) {
                message.error(
                  "Cannot approve checklist: All documents must be approved",
                );
                setConfirmAction(null);
                return;
              }
              submitCheckerAction(confirmAction);
            }}
            disabled={confirmAction === "approved" && !canApproveChecklist()}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
