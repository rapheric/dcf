import React from "react";
import {
  Drawer,
  Card,
  Tag,
  Collapse,
  Button,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { formatFileSize } from "../../../utils/uploadUtils";
// import { formatFileSize } from "../utils/uploadUtils";

const DocumentSidebar = ({
  documents,
  supportingDocs,
  open,
  onClose,
  getFullUrl,
}) => {
  const uploadedDocs = documents.filter(
    (d) => d.uploadData && d.uploadData.status !== "deleted"
  );

  const allDocs = [...uploadedDocs, ...supportingDocs];

  const groupedDocs = allDocs.reduce((acc, doc) => {
    const group = doc.category || "Main Documents";
    if (!acc[group]) acc[group] = [];
    acc[group].push(doc);
    return acc;
  }, {});

  const lastUpload =
    allDocs.length > 0
      ? allDocs
          .map((d) => new Date(d.uploadData?.createdAt || d.updatedAt || 0))
          .sort((a, b) => b - a)[0]
      : null;

  return (
    <Drawer
      title={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 600 }}>Uploaded Documents</span>
          <Tag color="blue">{allDocs.length} doc</Tag>
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
              children: docs.map((doc, idx) => (
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
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <b>{doc.uploadData?.fileName || doc.name}</b>
                    <Tag
                      color={
                        doc.uploadData?.status === "active" ? "green" : "red"
                      }
                    >
                      {doc.uploadData?.status === "active"
                        ? "Active"
                        : "Deleted"}
                    </Tag>
                  </div>

                  <div
                    style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}
                  >
                    ID: {doc.uploadData?._id || doc._id || "—"}
                  </div>

                  <div style={{ fontSize: 12, color: "#374151" }}>
                    🕒{" "}
                    {doc.uploadData?.createdAt
                      ? dayjs(doc.uploadData.createdAt).format(
                          "DD MMM YYYY HH:mm:ss"
                        )
                      : "N/A"}
                    {"  •  "}
                    {doc.uploadData?.fileSize
                      ? formatFileSize(doc.uploadData.fileSize)
                      : "N/A"}
                    {"  •  "}
                    {doc.uploadData?.fileType || "Unknown"}
                  </div>

                  <div style={{ marginTop: 6 }}>
                    <Tag color="purple">{doc.category}</Tag>
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
                      Uploaded by{" "}
                      <b>{doc.uploadData?.uploadedBy || "Current User"}</b>
                    </div>
                    <div style={{ color: "#6b7280" }}>
                      {doc.uploadData?.createdAt
                        ? dayjs(doc.uploadData.createdAt).format(
                            "DD MMM YYYY HH:mm:ss"
                          )
                        : ""}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 10,
                      fontSize: 12,
                    }}
                  >
                    <div>
                      👤 Document:{" "}
                      <b>{doc.uploadData?.documentName || doc.name}</b>
                    </div>

                    {doc.uploadData?.status === "active" && (
                      <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() =>
                          window.open(
                            getFullUrl(doc.uploadData?.fileUrl || doc.fileUrl),
                            "_blank"
                          )
                        }
                      >
                        Download
                      </Button>
                    )}
                  </div>
                </Card>
              )),
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
      </Card>
    </Drawer>
  );
};

export default DocumentSidebar;