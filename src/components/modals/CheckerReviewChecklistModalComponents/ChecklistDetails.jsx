import React from "react";
import { Card, Descriptions, Tag, Button } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import { PRIMARY_BLUE } from "../../../utils/constants";

const ChecklistDetails = ({
  checklist,
  setShowDocumentSidebar,
  uploadedDocsCount,
}) => {
  return (
    <Card
      className="checklist-info-card"
      size="small"
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: PRIMARY_BLUE,
            fontSize: 14,
          }}
        >
          <span>Checklist Details</span>
          <Button
            type="default"
            icon={<PaperClipOutlined />}
            onClick={() => setShowDocumentSidebar(true)}
            style={{
              fontSize: "12px",
              fontWeight: 500,
              borderColor: "#164679",
              color: "#164679",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "2px 8px",
              height: "auto",
            }}
          >
            View Documents
            {uploadedDocsCount > 0 && (
              <span
                style={{
                  background: "#b5d334",
                  color: "#1a202c",
                  borderRadius: "10px",
                  padding: "0 4px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  marginLeft: "2px",
                }}
              >
                {uploadedDocsCount}
              </span>
            )}
          </Button>
        </div>
      }
      style={{
        marginBottom: 18,
        borderRadius: 10,
        border: `1px solid #e0e0e0`,
      }}
    >
      <Descriptions size="middle" column={{ xs: 1, sm: 2, lg: 3 }}>
        <Descriptions.Item label="DCL No">
          <strong>{checklist?.dclNo || "N/A"}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="IBPS No">
          {checklist?.ibpsNo || "Not provided"}
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {checklist?.createdAt
            ? new Date(checklist.createdAt).toLocaleDateString()
            : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Loan Type">
          <Tag color="blue">{checklist?.loanType || "N/A"}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created By">
          <span style={{ fontWeight: 600 }}>
            {checklist?.createdBy?.name || "N/A"}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="RM">
          <span style={{ fontWeight: 600 }}>
            {checklist?.assignedToRM?.name || "N/A"}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Co-Checker">
          {checklist?.assignedToCoChecker?.name ? (
            <Tag color="green">{checklist.assignedToCoChecker.name}</Tag>
          ) : (
            <Tag color="orange">Pending Assignment</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Current Status">
          <Tag
            color={
              checklist?.status === "co_creator_review"
                ? "processing"
                : checklist?.status === "pending"
                  ? "warning"
                  : "default"
            }
          >
            {checklist?.status
              ? checklist.status.replace(/_/g, " ").toUpperCase()
              : "PENDING"}
          </Tag>
        </Descriptions.Item>
        {checklist?.completedAt && (
          <Descriptions.Item label="Completed At">
            {new Date(checklist.completedAt).toLocaleDateString()}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};

export default ChecklistDetails;
