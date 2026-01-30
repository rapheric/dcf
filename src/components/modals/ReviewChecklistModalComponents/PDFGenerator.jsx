import React from 'react';
import { Button, message } from 'antd';
import { FilePdfOutlined } from "@ant-design/icons";
// import { usePDFGenerator } from '../../hooks/usePDFGenerator';
import { PRIMARY_BLUE } from '../../../utils/constants';
import usePDFGenerator from '../../../hooks/usePDFGenerator';

const PDFGenerator = ({ 
  checklist, 
  docs, 
  supportingDocs, 
  creatorComment, 
  comments 
}) => {
  const { generatePDF, isGenerating } = usePDFGenerator();

  const handleGeneratePDF = async () => {
    try {
      await generatePDF({
        checklist,
        documents: docs,
        supportingDocs,
        creatorComment,
        comments
      });
    } catch (error) {
      message.error("Failed to generate PDF");
    }
  };

  return (
    <Button
      icon={<FilePdfOutlined />} // Updated icon
      loading={isGenerating}
      onClick={handleGeneratePDF}
      style={{
        backgroundColor: PRIMARY_BLUE,
        borderColor: PRIMARY_BLUE,
        color: "white",
        borderRadius: "6px",
        fontWeight: 600,
        marginRight: 8
      }}
    >
      Download PDF
    </Button>   
  );
};

export default PDFGenerator;