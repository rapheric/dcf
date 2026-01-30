import React, { useState } from "react";
import { Button, message } from "antd";
import { FilePdfOutlined as PdfIcon } from "@ant-design/icons";
// import { PRIMARY_BLUE } from "../constants/colors";
// import { downloadChecklistAsPDF } from "../utils/pdfExport";
import { PRIMARY_BLUE } from "../../../utils/colors";
import { downloadChecklistAsPDF } from "../../../utils/pdfExport";

const PdfExportButton = ({ checklist, docs, documentStats, rmGeneralComment }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await downloadChecklistAsPDF({
        checklist,
        docs,
        documentStats,
        rmGeneralComment,
      });
      message.success("Checklist downloaded as PDF successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Button
      key="download"
      icon={<PdfIcon />}
      loading={isGeneratingPDF}
      onClick={handleDownloadPDF}
      style={{
        backgroundColor: PRIMARY_BLUE,
        borderColor: PRIMARY_BLUE,
        color: "white",
        borderRadius: "6px",
        fontWeight: 600,
        marginRight: 8,
      }}
    >
      Download PDF
    </Button>
  );
};

export default PdfExportButton;