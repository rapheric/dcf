// src/components/completedChecklistModal/components/DocumentSidebarComponent.jsx
import React, { useMemo } from "react";
import { Drawer, Collapse, Card, Tag, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { API_BASE_URL, formatFileSize } from "../../../utils/checklistConstants";
// import {
//   API_BASE_URL,
//   formatFileSize,
// } from "../utils/checklistConstants";

const DocumentSidebarComponent = ({
  documents,
  open,
  onClose,
  supportingDocs = [],
}) => {
  const allDocs = useMemo(() => {
    const uploadedDocs = documents.filter(
      (d) =>
        d.fileUrl ||
        d.uploadData?.fileUrl ||
        d.filePath ||
        d.url ||
        d.uploadData?.status === "active",
    );
    return [...uploadedDocs, ...supportingDocs];
  }, [documents, supportingDocs]);

  const groupedDocs = allDocs.reduce((acc, doc) => {
    const group = doc.category || "Supporting Documents";
    if (!acc[group]) acc[group] = [];
    acc[group].push(doc);
    return acc;
  }, {});

  const lastUpload =
    allDocs.length > 0
      ? allDocs
          .map((d) => new Date(d.uploadDate || d.updatedAt || d.createdAt || 0))
          .sort((a, b) => b - a)[0]
      : null;

  return (
    <Drawer
      title={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 600 }}>Uploaded Documents</span>
          <Tag color="blue">{allDocs.length} doc(s)</Tag>
        </div>
      }
      placement="right"
      width={420}
      open={open}
      onClose={onClose}
    >
      <div style={{ marginBottom: 12, color: "#6b7280", fontSize: 13 }}>
        📄 Documents uploaded to this checklist
      </div>

      {Object.entries(groupedDocs).map(([category, docs]) => (
        <Collapse
          key={category}
          defaultActiveKey={[category]}
          expandIconPosition="end"
          style={{ marginBottom: 16 }}
          items={[
            {
              key: category,
              label: (
                <b style={{ color: "#164679" }}>
                  {category} ({docs.length})
                </b>
              ),
              children: docs.map((doc, idx) => {
                const fileUrl =
                  doc.fileUrl ||
                  doc.uploadData?.fileUrl ||
                  doc.filePath ||
                  doc.url;

                const fileName =
                  doc.uploadData?.fileName ||
                  doc.name ||
                  doc.fileName ||
                  doc.documentName ||
                  "Unnamed Document";

                const uploadDate =
                  doc.uploadDate ||
                  doc.uploadData?.createdAt ||
                  doc.updatedAt ||
                  doc.createdAt;

                const uploadedBy =
                  doc.uploadedBy ||
                  doc.uploadData?.uploadedBy ||
                  doc.owner ||
                  "Unknown";

                return (
                  <Card
                    key={idx}
                    size="small"
                    style={{
                      borderRadius: 10,
                      marginBottom: 12,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <b>{fileName}</b>
                      <Tag color={doc.status === "deleted" ? "red" : "green"}>
                        {doc.status === "deleted" ? "Deleted" : "Active"}
                      </Tag>
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: "#6b7280",
                        marginBottom: 6,
                      }}
                    >
                      Type: {doc.type || doc.uploadData?.fileType || "Document"}
                    </div>

                    <div style={{ fontSize: 12, color: "#374151" }}>
                      🕒{" "}
                      {uploadDate
                        ? dayjs(uploadDate).format("DD MMM YYYY HH:mm:ss")
                        : "N/A"}
                      {"  •  "}
                      {doc.fileSize || doc.uploadData?.fileSize
                        ? formatFileSize(
                            doc.fileSize || doc.uploadData?.fileSize,
                          )
                        : "N/A"}
                    </div>

                    <div style={{ marginTop: 6 }}>
                      <Tag
                        color={
                          doc.category === "Supporting Documents"
                            ? "cyan"
                            : "purple"
                        }
                      >
                        {doc.category || "Supporting Document"}
                      </Tag>
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        paddingLeft: 10,
                        borderLeft: "3px solid #84cc16",
                        fontSize: 12,
                      }}
                    >
                      <div>
                        Uploaded by <b>{uploadedBy}</b>
                      </div>
                      <div style={{ color: "#6b7280" }}>
                        {uploadDate
                          ? dayjs(uploadDate).format("DD MMM YYYY HH:mm:ss")
                          : ""}
                      </div>
                    </div>

                    {fileUrl && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginTop: 10,
                        }}
                      >
                        <Button
                          type="link"
                          icon={<DownloadOutlined />}
                          onClick={() => {
                            const fullUrl = fileUrl.startsWith("http")
                              ? fileUrl
                              : `${API_BASE_URL}${
                                  fileUrl.startsWith("/") ? "" : "/"
                                }${fileUrl}`;
                            window.open(fullUrl, "_blank");
                          }}
                          size="small"
                        >
                          Download
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              }),
            },
          ]}
        />
      ))}

      <Card size="small" style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Total Documents:</span>
          <b>{allDocs.length}</b>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <span>Last Upload:</span>
          <b>
            {lastUpload
              ? dayjs(lastUpload).format("DD MMM YYYY HH:mm:ss")
              : "—"}
          </b>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <span>RM Documents:</span>
          <b>
            {
              documents.filter((d) => d.fileUrl || d.uploadData?.fileUrl)
                .length
            }
          </b>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <span>Supporting Docs:</span>
          <b>{supportingDocs?.length || 0}</b>
        </div>
      </Card>
    </Drawer>
  );
};

export default DocumentSidebarComponent;