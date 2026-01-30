import React from "react";
import { Card, Button, Space } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const SupportingDocsSection = ({
  supportingDocs,
  handleDeleteSupportingDoc,
  getFullUrl,
  isActionAllowed,
  readOnly,
}) => {
  if (supportingDocs.length === 0) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ marginTop: 12 }}>
        <h4
          style={{
            color: "#164679",
            fontSize: 14,
            marginBottom: 8,
          }}
        >
          📎 Supporting Documents ({supportingDocs.length})
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {supportingDocs.map((doc) => (
            <Card size="small" key={doc.id} style={{ borderRadius: 6 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong style={{ fontSize: 13 }}>{doc.name}</strong>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#666",
                      marginTop: 2,
                    }}
                  >
                    Uploaded:{" "}
                    {dayjs(doc.uploadedAt).format("DD MMM YYYY HH:mm")}
                  </div>
                </div>
                <Space>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      window.open(
                        getFullUrl(doc.fileUrl || doc.uploadData?.fileUrl),
                        "_blank"
                      )
                    }
                  >
                    View
                  </Button>
                  {!readOnly && (
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        handleDeleteSupportingDoc(
                          doc.uploadData._id || doc.id,
                          doc.name
                        )
                      }
                      disabled={!isActionAllowed}
                    >
                      Delete
                    </Button>
                  )}
                </Space>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportingDocsSection;