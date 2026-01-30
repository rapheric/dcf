import React from 'react';
import { Card, Button, Space, Tag } from 'antd';
import { EyeOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PRIMARY_BLUE } from '../../../utils/constants';
// import { getFullUrl } from '../../utils/documentUtils';
// import { PRIMARY_BLUE } from '../../utils/constants';

const SupportingDocsSection = ({ 
  supportingDocs, 
  readOnly, 
  isActionDisabled, 
  onDeleteSupportingDoc,
  onViewSupportingDoc 
}) => {
  if (supportingDocs.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 12 
      }}>
        <PaperClipOutlined style={{ color: PRIMARY_BLUE }} />
        <h4 style={{ 
          color: PRIMARY_BLUE, 
          fontSize: 14, 
          margin: 0,
          fontWeight: 600 
        }}>
          Supporting Documents
        </h4>
        <Tag color="blue">{supportingDocs.length}</Tag>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {supportingDocs.map((doc) => (
          <Card 
            size="small" 
            key={doc.id} 
            style={{ 
              borderRadius: 6,
              borderLeft: `3px solid ${PRIMARY_BLUE}`
            }}
          >
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center" 
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8,
                  marginBottom: 4 
                }}>
                  <strong style={{ fontSize: 13 }}>{doc.name}</strong>
                  <Tag size="small" color="green">Supporting</Tag>
                </div>
                <div style={{ 
                  fontSize: 11, 
                  color: "#666", 
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap'
                }}>
                  <span>
                    📅 Uploaded: {dayjs(doc.uploadedAt).format("DD MMM YYYY HH:mm")}
                  </span>
                  {doc.uploadData?.fileSize && (
                    <span>📦 {doc.uploadData.fileSize}</span>
                  )}
                  {doc.uploadData?.fileType && (
                    <span>📄 {doc.uploadData.fileType}</span>
                  )}
                </div>
              </div>
              
              <Space>
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => onViewSupportingDoc(doc)}
                >
                  View
                </Button>
                {!readOnly && !isActionDisabled && (
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDeleteSupportingDoc(doc.uploadData?._id || doc.id, doc.name)}
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
  );
};

export default SupportingDocsSection;