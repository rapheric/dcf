import React, { useState, useEffect } from "react";
import CommentHistory from "../common/CommentHistory";
import {
  Button,
  Table,
  Tag,
  Modal,
  Card,
  Descriptions,
  List,
  Avatar,
  Spin,
  Typography,
  Progress,
  Space,
  message,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  UserOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  RedoOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetChecklistCommentsQuery } from "../../api/checklistApi";
import { getFullUrl as getFullUrlUtil } from "../../utils/checklistUtils.js";

const { Title, Text } = Typography;

// Theme Colors
const PRIMARY_BLUE = "#164679";
const ACCENT_LIME = "#b5d334";
const SUCCESS_GREEN = "#52c41a";
const SECONDARY_PURPLE = "#7e6496";
const WARNING_ORANGE = "#faad14";
const ERROR_RED = "#ff4d4f";

// Helper function to get role tag
const getRoleTag = (role) => {
  let color = "blue";
  const roleLower = (role || "").toLowerCase();
  switch (roleLower) {
    case "rm":
      color = "purple";
      break;
    case "creator":
      color = "green";
      break;
    case "co_checker":
      color = "volcano";
      break;
    case "system":
      color = "default";
      break;
    default:
      color = "blue";
  }
  return (
    <Tag color={color} style={{ marginLeft: 8, textTransform: "uppercase" }}>
      {roleLower.replace(/_/g, " ")}
    </Tag>
  );
};

// Helper function to get checker status display
const getCheckerStatusDisplay = (checkerStatus, checklistStatus) => {
  // If checklist is approved/completed, all documents should show as approved by checker
  if (checklistStatus === "approved" || checklistStatus === "completed") {
    return {
      color: "success",
      text: "✅ Approved",
      icon: <CheckCircleOutlined />,
      tagColor: "#52c41a",
    };
  }

  // If checklist is rejected, all documents should show as rejected by checker
  if (checklistStatus === "rejected") {
    return {
      color: "red",
      text: "❌ Rejected",
      icon: <CloseCircleOutlined />,
      tagColor: "#f5222d",
    };
  }

  // If checklist is in co_checker_review, show individual document status
  if (!checkerStatus) {
    return {
      color: "orange",
      text: "📞 Pending Review",
      icon: <ClockCircleOutlined />,
      tagColor: "#fa8c16",
    };
  }

  const statusLower = checkerStatus.toLowerCase();

  switch (statusLower) {
    case "approved":
      return {
        color: "success",
        text: "✅ Approved",
        icon: <CheckCircleOutlined />,
        tagColor: "#52c41a",
      };
    case "rejected":
      return {
        color: "red",
        text: "❌ Rejected",
        icon: <CloseCircleOutlined />,
        tagColor: "#f5222d",
      };
    case "pending":
      return {
        color: "orange",
        text: "📞 Pending Review",
        icon: <ClockCircleOutlined />,
        tagColor: "#fa8c16",
      };
    case "reviewed":
      return {
        color: "blue",
        text: "👁️ Reviewed",
        icon: <EyeOutlined />,
        tagColor: "#1890ff",
      };
    case "deferred":
      return {
        color: "volcano",
        text: "⏱️ Deferred",
        icon: <ClockCircleOutlined />,
        tagColor: "#fa541c",
      };
    default:
      return {
        color: "default",
        text: checkerStatus,
        icon: null,
        tagColor: "#d9d9d9",
      };
  }
};

// Function to get expiry status
const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return null;

  const today = dayjs().startOf("day");
  const expiry = dayjs(expiryDate).startOf("day");

  return expiry.isBefore(today) ? "expired" : "current";
};

// ENHANCED PROGRESS CALCULATION FUNCTION (from first code)
const calculateDocumentStats = (docs) => {
  const total = docs.length;

  // Count all status types from CO perspective
  const submitted = docs.filter(
    (d) =>
      d.status?.toLowerCase() === "submitted" ||
      d.action?.toLowerCase() === "submitted" ||
      d.coStatus?.toLowerCase() === "submitted",
  ).length;

  const pendingFromRM = docs.filter(
    (d) =>
      d.status?.toLowerCase() === "pendingrm" ||
      d.action?.toLowerCase() === "pendingrm" ||
      d.coStatus?.toLowerCase() === "pendingrm",
  ).length;

  const pendingFromCo = docs.filter(
    (d) =>
      d.status?.toLowerCase() === "pendingco" ||
      d.action?.toLowerCase() === "pendingco" ||
      d.coStatus?.toLowerCase() === "pendingco",
  ).length;

  const deferred = docs.filter(
    (d) =>
      d.status?.toLowerCase() === "deferred" ||
      d.action?.toLowerCase() === "deferred" ||
      d.coStatus?.toLowerCase() === "deferred",
  ).length;

  const sighted = docs.filter(
    (d) =>
      d.status?.toLowerCase() === "sighted" ||
      d.action?.toLowerCase() === "sighted" ||
      d.coStatus?.toLowerCase() === "sighted",
  ).length;

  const waived = docs.filter(
    (d) =>
      d.status?.toLowerCase() === "waived" ||
      d.action?.toLowerCase() === "waived" ||
      d.coStatus?.toLowerCase() === "waived",
  ).length;

  const tbo = docs.filter(
    (d) =>
      d.status?.toLowerCase() === "tbo" ||
      d.action?.toLowerCase() === "tbo" ||
      d.coStatus?.toLowerCase() === "tbo",
  ).length;

  // Checker review statuses
  const checkerApproved = docs.filter(
    (d) =>
      d.checkerStatus &&
      (d.checkerStatus.toLowerCase().includes("approved") ||
        d.checkerStatus.toLowerCase() === "approved"),
  ).length;

  const checkerRejected = docs.filter(
    (d) =>
      d.checkerStatus &&
      (d.checkerStatus.toLowerCase().includes("rejected") ||
        d.checkerStatus.toLowerCase() === "rejected"),
  ).length;

  const checkerReviewed = docs.filter(
    (d) =>
      d.checkerStatus &&
      !["not reviewed", "pending", null, undefined].includes(
        d.checkerStatus?.toLowerCase(),
      ),
  ).length;

  const checkerPending = docs.filter(
    (d) =>
      !d.checkerStatus ||
      ["not reviewed", "pending", null, undefined].includes(
        d.checkerStatus?.toLowerCase(),
      ),
  ).length;

  // RM statuses
  const rmSubmitted = docs.filter(
    (d) =>
      d.rmStatus &&
      (d.rmStatus.toLowerCase().includes("submitted") ||
        d.rmStatus.toLowerCase().includes("approved") ||
        d.rmStatus.toLowerCase().includes("satisfactory")),
  ).length;

  const rmPending = docs.filter(
    (d) =>
      d.rmStatus &&
      (d.rmStatus.toLowerCase().includes("pending") ||
        d.rmStatus.toLowerCase().includes("awaiting")),
  ).length;

  const rmDeferred = docs.filter(
    (d) =>
      d.rmStatus &&
      (d.rmStatus.toLowerCase().includes("deferred") ||
        d.rmStatus.toLowerCase().includes("returned")),
  ).length;

  const progressPercent =
    total === 0
      ? 0
      : docs.filter(
        (d) =>
          d.action?.toLowerCase() === "pendingco" ||
          d.status?.toLowerCase() === "pendingco",
      ).length === 0
        ? 100
        : Math.round((submitted / total) * 100);

  return {
    total,
    submitted,
    pendingFromRM,
    pendingFromCo,
    deferred,
    sighted,
    waived,
    tbo,
    checkerApproved,
    checkerRejected,
    checkerReviewed,
    checkerPending,
    rmSubmitted,
    rmPending,
    rmDeferred,
    progressPercent,
  };
};

const CreatorCompletedChecklistModal = ({
  checklist,
  open,
  onClose,
  onRevive,
  onRefreshData,
  readOnly = false,
}) => {
  console.log(
    "🔍 [Modal] CreatorCompletedChecklistModal rendered with props:",
    {
      checklist: checklist?._id,
      open,
      hasOnRevive: !!onRevive,
      hasOnRefreshData: !!onRefreshData,
    },
  );

  const [docs, setDocs] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isReviving, setIsReviving] = useState(false);
  const [showReviveConfirm, setShowReviveConfirm] = useState(false);

  const { data: comments, isLoading: commentsLoading } =
    useGetChecklistCommentsQuery(checklist?._id, { skip: !checklist?._id });

  useEffect(() => {
    if (!checklist || !checklist.documents) return;

    console.log("Checklist status:", checklist.status); // Debug log
    console.log("Checklist documents:", checklist.documents); // Debug log

    const flatDocs = checklist.documents.reduce((acc, item) => {
      if (item.docList && Array.isArray(item.docList) && item.docList.length) {
        const nestedDocs = item.docList.map((doc) => ({
          ...doc,
          category: item.category,
          checkerStatus:
            doc.checkerStatus ||
            doc.coCheckerStatus ||
            doc.co_checker_status ||
            null,
        }));
        return acc.concat(nestedDocs);
      }
      if (item.category)
        return acc.concat({
          ...item,
          checkerStatus:
            item.checkerStatus ||
            item.coCheckerStatus ||
            item.co_checker_status ||
            null,
        });
      return acc;
    }, []);

    const preparedDocs = flatDocs.map((doc, idx) => {
      // Determine final checker status based on overall checklist status
      let finalCheckerStatus = doc.checkerStatus || null;

      // CRITICAL FIX: If checklist is approved/completed, all documents should show as approved
      if (checklist.status === "approved" || checklist.status === "completed") {
        finalCheckerStatus = "approved";
        console.log(
          `Document ${idx} - ${doc.name || doc.documentName
          } - Setting to 'approved' because checklist is ${checklist.status}`,
        );
      } else if (checklist.status === "rejected") {
        finalCheckerStatus = "rejected";
        console.log(
          `Document ${idx} - ${doc.name || doc.documentName
          } - Setting to 'rejected' because checklist is ${checklist.status}`,
        );
      } else {
        // For other statuses, use the individual document status
        finalCheckerStatus = doc.checkerStatus || "pending";
        console.log(
          `Document ${idx} - ${doc.name || doc.documentName
          } - Using original checker status: ${doc.checkerStatus}`,
        );
      }

      return {
        ...doc,
        docIdx: idx,
        status: doc.status || "pending",
        action: doc.action || doc.status || "pending",
        comment: doc.comment || "",
        fileUrl: doc.fileUrl || null,
        expiryDate: doc.expiryDate || null,
        checkerStatus: doc.checkerStatus || null,
        finalCheckerStatus: finalCheckerStatus,
        deferralNo: doc.deferralNo || null,
        name: doc.name || doc.documentName || `Document ${idx + 1}`,
      };
    });

    console.log(
      "Prepared docs with finalCheckerStatus:",
      preparedDocs.map((d) => ({
        name: d.name,
        checkerStatus: d.checkerStatus,
        finalCheckerStatus: d.finalCheckerStatus,
      })),
    ); // Debug log

    setDocs(preparedDocs);
  }, [checklist]);

  // Calculate document stats using the enhanced function (from first code)
  const documentStats = calculateDocumentStats(docs);

  // Get document stats from the calculation
  const {
    total,
    submitted,
    pendingFromRM,
    pendingFromCo,
    deferred,
    sighted,
    waived,
    tbo,
    progressPercent,
  } = documentStats;

  // Check if checklist is completed/approved
  const isChecklistCompleted =
    checklist?.status === "approved" ||
    checklist?.status === "completed" ||
    checklist?.status === "rejected";

  // Function to generate and download PDF (KEEP ORIGINAL VERSION)
  const downloadChecklistAsPDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const jsPDF = (await import("jspdf")).default;
      const html2canvas = await import("html2canvas");

      // Bank color scheme
      const bankColors = {
        primary: "#1a365d",
        secondary: "#2c5282",
        accent: "#0f766e",
        success: "#047857",
        warning: "#d97706",
        danger: "#dc2626",
        light: "#f8fafc",
        border: "#e2e8f0",
        text: "#334155",
        textLight: "#64748b",
      };

      // Helper function to get status colors
      const getStatusColor = (status) => {
        const statusLower = (status || "").toLowerCase();
        switch (statusLower) {
          case "submitted":
          case "approved":
            return { bg: "#d1fae5", color: "#065f46", border: "#10b981" };
          case "pendingrm":
            return { bg: "#fee2e2", color: "#991b1b", border: "#ef4444" };
          case "pendingco":
            return { bg: "#fef3c7", color: "#92400e", border: "#f59e0b" };
          case "waived":
            return { bg: "#fef3c7", color: "#92400e", border: "#f59e0b" };
          case "sighted":
            return { bg: "#dbeafe", color: "#1e40af", border: "#3b82f6" };
          case "deferred":
            return { bg: "#e0e7ff", color: "#3730a3", border: "#6366f1" };
          case "tbo":
            return { bg: "#f1f5f9", color: "#475569", border: "#94a3b8" };
          default:
            return { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" };
        }
      };

      // Helper function for expiry status
      const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) return null;
        const today = dayjs().startOf("day");
        const expiry = dayjs(expiryDate).startOf("day");
        return expiry.isBefore(today) ? "expired" : "current";
      };

      // Helper function for text truncation
      const truncateText = (text, maxLength) => {
        if (!text) return "";
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
      };

      // Get checklist information
      const customerNumber =
        checklist?.customerNumber ||
        checklist?.title?.split("-")?.pop() ||
        "CUST-507249";
      const dclNo = checklist?.dclNo || "DCL-26-0036";
      const ibpsNo = checklist?.ibpsNo || "Not provided";
      const loanType = checklist?.loanType || "Equity Release Loan";
      const createdBy = checklist?.createdBy?.name || "Eric Mewa";
      const rm = checklist?.assignedToRM?.name || "mark";
      const coChecker =
        checklist?.assignedToCoChecker?.name ||
        checklist?.coChecker ||
        "Pending";
      const status = checklist?.status || "completed";
      const completedAt =
        checklist?.completedAt || checklist?.updatedAt || checklist?.createdAt;

      // Prepare comments for display
      const commentList = comments?.data || comments || [];
      const hasComments = commentList.length > 0;

      // Create PDF container
      const pdfContainer = document.createElement("div");
      pdfContainer.style.position = "absolute";
      pdfContainer.style.left = "-9999px";
      pdfContainer.style.top = "0";
      pdfContainer.style.width = "794px";
      pdfContainer.style.padding = "20px 30px";
      pdfContainer.style.backgroundColor = "#ffffff";
      pdfContainer.style.fontFamily = "'Calibri', 'Arial', sans-serif";
      pdfContainer.style.color = "#333333";

      // Build the PDF content with bank-style design
      pdfContainer.innerHTML = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .pdf-header {
          border-bottom: 2px solid ${bankColors.primary};
          padding-bottom: 15px;
          margin-bottom: 20px;
          position: relative;
        }
       
        .bank-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
       
        .logo-circle {
          width: 50px;
          height: 50px;
          background: ${bankColors.primary};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 20px;
        }
       
        .bank-name {
          font-size: 20px;
          font-weight: bold;
          color: ${bankColors.primary};
          letter-spacing: 0.5px;
        }
       
        .bank-tagline {
          font-size: 10px;
          color: ${bankColors.textLight};
          margin-top: 2px;
          letter-spacing: 0.3px;
        }
       
        .document-title {
          font-size: 16px;
          font-weight: bold;
          color: ${bankColors.secondary};
          margin-bottom: 5px;
        }
       
        .document-subtitle {
          font-size: 12px;
          color: ${bankColors.textLight};
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
       
        .document-badge {
          background: ${bankColors.light};
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
       
        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
       
        .section-card {
          background: white;
          border: 1px solid ${bankColors.border};
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 15px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
       
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: ${bankColors.primary};
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid ${bankColors.light};
          display: flex;
          align-items: center;
          gap: 8px;
        }
       
        .section-title::before {
          content: "▌";
          color: ${bankColors.accent};
          font-size: 12px;
        }
       
        .info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 8px;
          font-size: 10px;
        }
       
        .info-item {
          padding: 8px;
          background: ${bankColors.light};
          border-radius: 4px;
          border-left: 3px solid ${bankColors.secondary};
        }
       
        .info-label {
          font-size: 9px;
          color: ${bankColors.textLight};
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 2px;
        }
       
        .info-value {
          font-size: 11px;
          font-weight: 600;
          color: ${bankColors.text};
        }
       
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 8px;
          margin-bottom: 15px;
          font-size: 9px;
        }
       
        .summary-card {
          padding: 8px;
          border-radius: 6px;
          text-align: center;
          background: ${bankColors.light};
          border: 1px solid ${bankColors.border};
        }
       
        .summary-number {
          font-size: 16px;
          font-weight: bold;
          color: ${bankColors.primary};
          margin: 4px 0;
        }
       
        .summary-label {
          font-size: 8px;
          color: ${bankColors.textLight};
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
       
        .progress-bar {
          height: 6px;
          background: ${bankColors.border};
          border-radius: 3px;
          overflow: hidden;
          margin: 12px 0;
        }
       
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, ${bankColors.success}, ${bankColors.accent});
          border-radius: 3px;
        }
       
        .progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: ${bankColors.textLight};
        }
       
        .table-container {
          overflow-x: auto;
          margin-top: 12px;
        }
       
        .document-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9px;
          table-layout: fixed;
        }
       
        .document-table th {
          background: ${bankColors.primary};
          color: white;
          text-align: left;
          padding: 8px 6px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-right: 1px solid rgba(255,255,255,0.2);
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
       
        .document-table td {
          padding: 6px;
          border-bottom: 1px solid ${bankColors.border};
          vertical-align: top;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
       
        .document-table tr:nth-child(even) {
          background: ${bankColors.light};
        }
       
        .status-badge {
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 8px;
          font-weight: 600;
          display: inline-block;
          border: 1px solid;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
       
        .comment-box {
          background: ${bankColors.light};
          border-left: 3px solid ${bankColors.accent};
          padding: 10px;
          border-radius: 4px;
          margin-top: 8px;
          font-size: 10px;
          line-height: 1.4;
        }
       
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
       
        .comment-author {
          font-weight: 600;
          color: ${bankColors.primary};
          font-size: 10px;
        }
       
        .comment-date {
          font-size: 9px;
          color: ${bankColors.textLight};
        }
       
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 60px;
          color: rgba(0,0,0,0.03);
          font-weight: bold;
          pointer-events: none;
          z-index: 1;
        }
       
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid ${bankColors.border};
          text-align: center;
          font-size: 9px;
          color: ${bankColors.textLight};
          line-height: 1.4;
        }
       
        .disclaimer {
          background: ${bankColors.light};
          padding: 8px;
          border-radius: 3px;
          margin-top: 8px;
          font-size: 8px;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid ${bankColors.border};
        }
        
        .current-status-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          min-width: 140px;
        }
        
        .status-label {
          font-size: 9px;
          color: ${bankColors.textLight};
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 4px;
        }
        
        .status-display {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
          border: 2px solid;
          min-width: 120px;
        }
        
        /* Comment History Styles */
        .comment-item {
          border-bottom: 1px solid ${bankColors.border};
          padding: 10px 0;
        }
        
        .comment-item:last-child {
          border-bottom: none;
        }
        
        .comment-user-role {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        
        .comment-role-tag {
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .comment-time {
          font-size: 8px;
          color: ${bankColors.textLight};
          font-family: monospace;
        }
        
        .comment-message {
          font-size: 9px;
          line-height: 1.4;
          padding: 8px;
          background: ${bankColors.light};
          border-radius: 4px;
          border-left: 2px solid ${bankColors.accent};
          margin-top: 5px;
        }
        
        .no-comments {
          font-size: 10px;
          color: ${bankColors.textLight};
          text-align: center;
          padding: 20px;
          border: 1px dashed ${bankColors.border};
          border-radius: 4px;
          background: ${bankColors.light};
        }
        
        .comment-count-badge {
          background: ${bankColors.accent};
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 8px;
          font-weight: 600;
          margin-left: 6px;
        }
        
        .comment-scroll-notice {
          text-align: center;
          font-size: 9px;
          color: ${bankColors.textLight};
          padding: 8px;
          background: ${bankColors.light};
          border-radius: 4px;
          margin-top: 10px;
          border: 1px dashed ${bankColors.border};
        }
        
        /* Supporting documents section */
        .supporting-docs-section {
          margin-top: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 15px;
        }
        
        .supporting-doc-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .supporting-doc-item:last-child {
          border-bottom: none;
        }
      </style>

      <!-- Watermark -->
      <div class="watermark">COMPLETED CHECKLIST</div>

      <!-- Header with Bank Logo -->
      <div class="pdf-header">
        <div class="bank-logo">
          <div class="logo-circle">NCBA</div>
          <div>
            <div class="bank-name">COMPLETED CHECKLIST REVIEW</div>
            <div class="bank-tagline">Document Control System</div>
          </div>
        </div>
       
        <!-- Document Info and Status Section -->
        <div class="header-content">
          <div class="document-info">
            <div class="document-title">Completed Checklist - ${customerNumber}</div>
            <div class="document-subtitle">
              <span class="document-badge">
                <span class="badge-dot" style="background: ${bankColors.primary}"></span>
                DCL No: <strong>${dclNo}</strong>
              </span>
              <span class="document-badge">
                <span class="badge-dot" style="background: ${bankColors.secondary}"></span>
                IBPS No: <strong>${ibpsNo}</strong>
              </span>
              <span class="document-badge">
                <span class="badge-dot" style="background: ${bankColors.accent}"></span>
                Completed: <strong>${completedAt ? dayjs(completedAt).format("DD MMM YYYY, HH:mm:ss") : dayjs().format("DD MMM YYYY, HH:mm:ss")}</strong>
              </span>
            </div>
          </div>
          
          <!-- Current Status Display -->
          <div class="current-status-section">
            <div class="status-label">Overall Status</div>
            <div class="status-display" style="
              background: ${status === "completed" || status === "approved"
          ? "#d1fae5"
          : status === "rejected"
            ? "#fee2e2"
            : "#fef3c7"
        };
              color: ${status === "completed" || status === "approved"
          ? "#065f46"
          : status === "rejected"
            ? "#991b1b"
            : "#92400e"
        };
              border-color: ${status === "completed" || status === "approved"
          ? "#10b981"
          : status === "rejected"
            ? "#ef4444"
            : "#f59e0b"
        };
            ">
              ${status.replace(/_/g, " ").toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <!-- Checklist Information -->
      <div class="section-card">
        <div class="section-title">Checklist Information</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Customer Number</div>
            <div class="info-value">${customerNumber}</div>
          </div>
          <div class="info-item">
            <div class="info-label">DCL Number</div>
            <div class="info-value">${dclNo}</div>
          </div>
          <div class="info-item">
            <div class="info-label">IBPS Number</div>
            <div class="info-value">${ibpsNo}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Loan Type</div>
            <div class="info-value">${loanType}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Created By</div>
            <div class="info-value">${createdBy}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Relationship Manager</div>
            <div class="info-value">${rm}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Co-Checker</div>
            <div class="info-value">${coChecker}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Completed Date</div>
            <div class="info-value">${completedAt ? dayjs(completedAt).format("DD MMM YYYY, HH:mm:ss") : "N/A"}</div>
          </div>
        </div>
      </div>

      <!-- Document Summary -->
      <div class="section-card">
        <div class="section-title">Document Summary</div>
       
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-label">Total</div>
            <div class="summary-number">${total}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Submitted</div>
            <div class="summary-number" style="color: ${bankColors.success};">
              ${submitted}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Pending RM</div>
            <div class="summary-number" style="color: ${pendingFromRM > 0 ? "#f59e0b" : "#8b5cf6"};">
              ${pendingFromRM}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Pending Co</div>
            <div class="summary-number" style="color: #8b5cf6;">
              ${pendingFromCo}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Deferred</div>
            <div class="summary-number" style="color: #8b5cf6;">
              ${deferred}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Sighted</div>
            <div class="summary-number" style="color: #3b82f6;">
              ${sighted}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Waived</div>
            <div class="summary-number" style="color: ${bankColors.warning};">
              ${waived}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">TBO</div>
            <div class="summary-number" style="color: #06b6d4;">
              ${tbo}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Progress</div>
            <div class="summary-number" style="color: ${bankColors.success};">
              ${progressPercent}%
            </div>
          </div>
        </div>
       
        <div class="progress-text">
          <span>Completion Progress:</span>
          <span>${total === 0
          ? "0%"
          : progressPercent + "%"
        }</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${total === 0
          ? "0%"
          : progressPercent + "%"
        }"></div>
        </div>
      </div>

      <!-- Document Details -->
      <div class="section-card">
        <div class="section-title">Document Details</div>
        <div class="table-container">
          <table class="document-table">
            <thead>
              <tr>
                <th width="10%">Category</th>
                <th width="18%">Document Name</th>
                <th width="10%">Status</th>
                <th width="12%">Checker Status</th>
                <th width="12%">Co Comment</th>
                <th width="10%">Expiry Date</th>
                <th width="10%">Validity</th>
                <th width="8%">File</th>
              </tr>
            </thead>
            <tbody>
              ${docs.map((doc, index) => {
          const statusColor = getStatusColor(doc.status || doc.action);
          const checkerStatusColor = getStatusColor(doc.checkerStatus || doc.finalCheckerStatus);
          const statusLabel = doc.status === "deferred" && doc.deferralNo
            ? `Deferred (${doc.deferralNo})`
            : ((doc.status || doc.action || "N/A")).toUpperCase();

          const checkerStatusLabel = doc.checkerStatus || doc.finalCheckerStatus
            ? (doc.checkerStatus || doc.finalCheckerStatus || "N/A").toUpperCase()
            : "—";

          const expiryStatus = (doc.category || "").toLowerCase().trim() === "compliance documents"
            ? getExpiryStatus(doc.expiryDate)
            : null;

          const hasFile = doc.fileUrl ? "Yes" : "No";

          const truncatedName = truncateText(doc.name, 35);
          const truncatedCoComment = truncateText(doc.comment, 30);

          return `
                <tr>
                  <td style="font-weight: 600; color: ${bankColors.secondary};">
                    ${doc.category || "N/A"}
                  </td>
                  <td title="${doc.name || "N/A"}">${truncatedName}</td>
                  <td>
                    <span class="status-badge" style="
                      background: ${statusColor.bg};
                      color: ${statusColor.color};
                      border-color: ${statusColor.border};
                    ">
                      ${statusLabel}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" style="
                      background: ${checkerStatusColor.bg};
                      color: ${checkerStatusColor.color};
                      border-color: ${checkerStatusColor.border};
                    ">
                      ${checkerStatusLabel}
                    </span>
                  </td>
                  <td title="${doc.comment || "—"}">
                    ${truncatedCoComment || "—"}
                  </td>
                  <td style="font-family: monospace; font-size: 8px;">
                    ${doc.expiryDate ? dayjs(doc.expiryDate).format("DD/MM/YY") : "—"}
                  </td>
                  <td>
                    ${(() => {
              if (!expiryStatus) return "—";
              return `<span class="status-badge" style="
                        background: ${expiryStatus === "current" ? "#d1fae5" : "#fee2e2"};
                        color: ${expiryStatus === "current" ? "#065f46" : "#991b1b"};
                        border-color: ${expiryStatus === "current" ? "#10b981" : "#ef4444"};
                      ">
                        ${expiryStatus === "current" ? "CUR" : "EXP"}
                      </span>`;
            })()}
                  </td>
                  <td style="text-align: center;">
                    ${hasFile}
                  </td>
                </tr>
              `;
        }).join("")}
            </tbody>
          </table>
        </div>
        <div style="font-size: 8px; color: ${bankColors.textLight}; margin-top: 10px; text-align: center;">
          Showing ${docs.length} documents
        </div>
      </div>

      <!-- Comment Trail & History - FIXED VERSION -->
<div class="section-card">
  <div class="section-title">Comment History ${hasComments ? `<span class="comment-count-badge">${commentList.length} comments</span>` : ''}</div>
  
  ${hasComments ? `
    <div style="margin-top: 4px;">
      ${commentList.slice(0, 30).map((comment, index) => {
          // Get user display name - Check multiple possible name properties
          const userDisplay = comment.userId?.fullName ||
            comment.userId?.username ||
            comment.userId?.name ||
            comment.user?.fullName ||
            comment.user?.username ||
            comment.user?.name ||
            comment.createdBy?.fullName ||
            comment.createdBy?.username ||
            comment.createdBy?.name ||
            comment.userName ||
            comment.username ||
            "Unknown User";

          // Format date
          const commentDate = comment.createdAt ||
            comment.timestamp ||
            comment.date ||
            new Date().toISOString();
          const formattedDate = dayjs(commentDate).format("DD/MM/YY HH:mm");

          // Get comment content
          const commentContent = comment.content ||
            comment.message ||
            comment.comment ||
            "";

          // Get role for styling
          const roleLower = (comment.role || "user").toLowerCase();
          let roleDisplay = "";
          let roleColor = "";

          // Set role display text and color based on your screenshot
          if (roleLower.includes("rm") || roleLower.includes("relationship")) {
            roleDisplay = "RM";
            roleColor = "#8b5cf6"; // purple
          } else if (roleLower.includes("creator") || roleLower.includes("co_creator")) {
            roleDisplay = "CREATOR";
            roleColor = "#10b981"; // green
          } else if (roleLower.includes("checker") || roleLower.includes("co_checker")) {
            roleDisplay = "CHECKER";
            roleColor = "#f59e0b"; // orange
          } else if (roleLower.includes("system")) {
            roleDisplay = "SYSTEM";
            roleColor = "#64748b"; // gray
          } else {
            roleDisplay = roleLower.replace(/_/g, " ").toUpperCase();
            roleColor = "#64748b"; // gray
          }

          // Extract first name for display
          const firstName = userDisplay.split(' ')[0] || userDisplay;

          // Check for specific comment patterns in your screenshot
          const isCreatorToChecker = commentContent.toLowerCase().includes("submitted to co-checker");
          const isRMSentBack = commentContent.toLowerCase().includes("checklist submitted back to co-creator by rm");
          const isRMComment = commentContent.toLowerCase().includes("rm comment:");
          const isCreatorToRM = commentContent.toLowerCase().includes("checklist submitted to rm");
          const isCreatorComment = commentContent.toLowerCase().includes("co-creator comment:");

          // Format based on screenshot patterns
          if (isCreatorToChecker) {
            // Format: "wa CREATOR Submitted to Co-Checker"
            return `
            <div style="margin-bottom: 3px; padding: 2px 0; border-bottom: 1px dotted #e2e8f0; font-size: 7px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span style="font-weight: 600; color: ${roleColor};">
                  ${firstName} ${roleDisplay}
                </span>
                <span style="color: #94a3b8; font-size: 6px;">
                  ${formattedDate}
                </span>
              </div>
              <div style="color: #475569; margin-top: 1px; padding-left: 2px;">
                ${commentContent}
              </div>
            </div>
          `;
          }
          else if (isRMSentBack && isRMComment) {
            // Format: "RM Checklist submitted back to Co-Creator by RM" (line 1)
            // Then: "RM RM Comment: kindly review" (line 2) 
            const commentText = commentContent.replace(/RM Comment:\s*/i, '');
            return `
            <div style="margin-bottom: 3px; padding: 2px 0; border-bottom: 1px dotted #e2e8f0; font-size: 7px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span style="font-weight: 600; color: ${roleColor};">
                  ${firstName} ${roleDisplay}
                </span>
                <span style="color: #94a3b8; font-size: 6px;">
                  ${formattedDate}
                </span>
              </div>
              <div style="color: #475569; margin-top: 1px; padding-left: 2px;">
                Checklist submitted back to Co-Creator by RM
              </div>
              <div style="color: #1e293b; margin-top: 1px; padding-left: 6px; font-weight: 500;">
                RM Comment: ${commentText}
              </div>
            </div>
          `;
          }
          else if (isRMSentBack) {
            // Format: "RM Checklist submitted back to Co-Creator by RM"
            return `
            <div style="margin-bottom: 3px; padding: 2px 0; border-bottom: 1px dotted #e2e8f0; font-size: 7px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span style="font-weight: 600; color: ${roleColor};">
                  ${firstName} ${roleDisplay}
                </span>
                <span style="color: #94a3b8; font-size: 6px;">
                  ${formattedDate}
                </span>
              </div>
              <div style="color: #475569; margin-top: 1px; padding-left: 2px;">
                ${commentContent}
              </div>
            </div>
          `;
          }
          else if (isCreatorToRM && isCreatorComment) {
            // Format: "wa CREATOR Checklist submitted to RM" (line 1)
            // Then: "wa CREATOR Co-Creator comment: ki" (line 2)
            const commentText = commentContent.replace(/Co-Creator comment:\s*/i, '');
            return `
            <div style="margin-bottom: 3px; padding: 2px 0; border-bottom: 1px dotted #e2e8f0; font-size: 7px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span style="font-weight: 600; color: ${roleColor};">
                  ${firstName} ${roleDisplay}
                </span>
                <span style="color: #94a3b8; font-size: 6px;">
                  ${formattedDate}
                </span>
              </div>
              <div style="color: #475569; margin-top: 1px; padding-left: 2px;">
                Checklist submitted to RM
              </div>
              <div style="color: #1e293b; margin-top: 1px; padding-left: 6px; font-weight: 500;">
                Co-Creator comment: ${commentText}
              </div>
            </div>
          `;
          }
          else if (isCreatorToRM) {
            // Format: "wa CREATOR Checklist submitted to RM"
            return `
            <div style="margin-bottom: 3px; padding: 2px 0; border-bottom: 1px dotted #e2e8f0; font-size: 7px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span style="font-weight: 600; color: ${roleColor};">
                  ${firstName} ${roleDisplay}
                </span>
                <span style="color: #94a3b8; font-size: 6px;">
                  ${formattedDate}
                </span>
              </div>
              <div style="color: #475569; margin-top: 1px; padding-left: 2px;">
                ${commentContent}
              </div>
            </div>
          `;
          }
          else {
            // Default format for other comments
            return `
            <div style="margin-bottom: 3px; padding: 2px 0; border-bottom: 1px dotted #e2e8f0; font-size: 7px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span style="font-weight: 600; color: ${roleColor};">
                  ${firstName} ${roleDisplay}
                </span>
                <span style="color: #94a3b8; font-size: 6px;">
                  ${formattedDate}
                </span>
              </div>
              ${commentContent ? `
                <div style="color: #475569; margin-top: 1px; padding-left: 2px;">
                  ${commentContent}
                </div>
              ` : ''}
            </div>
          `;
          }
        }).join("")}
      
      ${commentList.length > 30 ? `
        <div style="
          text-align: center;
          font-size: 6px;
          color: #94a3b8;
          padding: 3px;
          margin-top: 4px;
          border-top: 1px dotted #cbd5e1;
        ">
          Showing ${Math.min(30, commentList.length)} of ${commentList.length} comments
        </div>
      ` : ''}
    </div>
  ` : `
    <div style="
      text-align: center;
      font-size: 7px;
      color: #94a3b8;
      padding: 10px;
      border: 1px dotted #cbd5e1;
      border-radius: 2px;
      margin-top: 4px;
    ">
      No comments available for this checklist.
    </div>
  `}
</div>

<!-- Footer -->
<div class="footer">
  <div>
    <strong>COMPLETED CHECKLIST REPORT</strong> •
    Document Control System •
    Generated by: ${createdBy} •
    Page 1 of 1
  </div>
  <div class="disclaimer">
    This is a system-generated document for completed checklists. For official purposes only.
    Any unauthorized reproduction or distribution is strictly prohibited.
    Generated on ${dayjs().format("DD MMM YYYY, HH:mm:ss")} •
    DCL: ${dclNo} • Customer: ${customerNumber} • Status: ${status.replace(/_/g, " ").toUpperCase()} •
    Total Documents: ${total} • Comments: ${hasComments ? commentList.length : 0}
  </div>
</div>
    `;

      document.body.appendChild(pdfContainer);

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas.default(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
        width: pdfContainer.offsetWidth,
        height: pdfContainer.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const imgWidth = 297; // A4 landscape width in mm
      const pageHeight = 210; // A4 landscape height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, "", "FAST");
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, "", "FAST");
        heightLeft -= pageHeight;
      }

      const fileName = `Completed_Checklist_${dclNo}_${dayjs().format("YYYYMMDD_HHmmss")}.pdf`;
      pdf.save(fileName);

      document.body.removeChild(pdfContainer);

      message.success("Checklist PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  // Handle revive checklist - KEEP ORIGINAL FUNCTION
  const handleReviveChecklist = () => {
    console.log("🎯 Revive button clicked!");
    console.log("📋 Checklist data:", checklist);
    console.log("🆔 Checklist ID:", checklist?._id);
    console.log("🔗 onRevive prop exists:", !!onRevive);
    console.log("🔗 onRevive is function:", typeof onRevive === "function");

    if (!checklist?._id) {
      console.error("❌ No checklist ID found!");
      message.error("Cannot revive: Checklist ID is missing");
      return;
    }

    if (!onRevive || typeof onRevive !== "function") {
      console.error("❌ onRevive prop is not a function or not provided!");
      message.error("Cannot revive: Missing revive function");
      return;
    }

    console.log("🔄 Setting showReviveConfirm to true...");
    setShowReviveConfirm(true);
  };

  // KEEP ORIGINAL handleConfirmRevive
  const handleConfirmRevive = async () => {
    console.log("✅ User confirmed revival for checklist ID:", checklist._id);
    setShowReviveConfirm(false);
    setIsReviving(true);

    try {
      message.loading({
        content: "Creating new checklist from template...",
        duration: 0,
        key: "revive",
      });

      console.log("📞 Calling onRevive with ID:", checklist._id);
      const result = await onRevive(checklist._id);
      console.log("✅ onRevive result:", result);

      message.success({
        content:
          result?.message ||
          "New checklist created successfully! It will appear in Created Checklists For Review section.",
        duration: 4,
        key: "revive",
      });

      // Refresh data to ensure UI is updated
      onRefreshData?.();

      // Close modal after a short delay to ensure refresh happens
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("❌ Error in revival process:", error);
      console.error("❌ Error status:", error?.status);
      console.error("❌ Error data:", error?.data);
      console.error("❌ Full error object:", JSON.stringify(error, null, 2));

      let errorMessage = "Failed to revive checklist. Please try again.";

      if (error?.status === 500) {
        // Check for specific notification validation errors
        if (
          error?.data?.error?.includes("REVIVED") &&
          error?.data?.error?.includes("not a valid enum value")
        ) {
          errorMessage =
            "Notification system error: 'REVIVED' is not configured as a valid notification type. Please contact the development team to update the notification schema.";
        } else {
          errorMessage =
            "Server error occurred while reviving checklist. This might be a temporary issue. Please try again later or contact support.";
        }
      } else if (
        error?.status === 400 &&
        error?.data?.message?.includes("revived")
      ) {
        errorMessage =
          "This checklist has already been revived. Please refresh the page to see the updated status.";
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      message.error({
        content: errorMessage,
        duration: 5,
        key: "revive",
      });

      // Refresh data even on error to ensure UI is up to date
      onRefreshData?.();

      // Close the modal if checklist was already revived
      if (error?.status === 400 && error?.data?.message?.includes("revived")) {
        setTimeout(() => onClose(), 100);
      }
    } finally {
      setIsReviving(false);
    }
  };

  // KEEP ORIGINAL handleCancelRevive
  const handleCancelRevive = () => {
    console.log("❌ User cancelled revival");
    setShowReviveConfirm(false);
  };

  const columns = [
    {
      title: "Category",
      dataIndex: "category",
      width: 120,
      render: (text) => (
        <span
          style={{ fontSize: 12, color: SECONDARY_PURPLE, fontWeight: 500 }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Document Name",
      dataIndex: "name",
      width: 200,
    },
    {
      title: "Co Status",
      dataIndex: "status",
      width: 120,
      render: (status, record) => {
        let color = "default";
        const statusLower = (status || "").toLowerCase();

        switch (statusLower) {
          case "submitted":
            color = "green";
            break;
          case "approved":
            color = "green";
            break;
          case "pendingrm":
            color = "#6E0C05";
            break;
          case "pendingco":
            color = "#6E0549";
            break;
          case "waived":
            color = "#C4AA1D";
            break;
          case "sighted":
            color = "#02ECF5";
            break;
          case "deferred":
            color = "#55C41D";
            break;
          case "tbo":
            color = "#0F13E5";
            break;
          default:
            color = "default";
        }

        const statusLabel =
          status === "deferred" && record.deferralNo
            ? `Deferred (${record.deferralNo})`
            : status;

        return (
          <Tag className="status-tag" color={color}>
            {statusLabel}
          </Tag>
        );
      },
    },
    {
      title: "Deferral No",
      dataIndex: "deferralNo",
      width: 120,
      render: (text) => (
        <span style={{ fontSize: 13, color: "#666" }}>{text || "-"}</span>
      ),
    },
    {
      title: "Checker Status",
      dataIndex: "finalCheckerStatus",
      width: 140,
      render: (finalCheckerStatus, record) => {
        // FORCE override based on checklist status
        const checklistStatus = checklist?.status;
        let displayStatus = finalCheckerStatus;

        // Always prioritize checklist status
        if (checklistStatus === "approved" || checklistStatus === "completed") {
          displayStatus = "approved";
        } else if (checklistStatus === "rejected") {
          displayStatus = "rejected";
        }

        const statusDisplay = getCheckerStatusDisplay(
          displayStatus,
          checklistStatus,
        );

        return (
          <Tag
            color={statusDisplay.color}
            icon={statusDisplay.icon}
            style={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {statusDisplay.text}
          </Tag>
        );
      },
    },
    {
      title: "Co Comment",
      dataIndex: "comment",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      width: 100,
      render: (_, record) => {
        const category = (record.category || "").toLowerCase().trim();

        if (category !== "compliance documents") {
          return "-";
        }

        return record.expiryDate
          ? dayjs(record.expiryDate).format("DD/MM/YYYY")
          : "-";
      },
    },
    {
      title: "Expiry Status",
      dataIndex: "expiryStatus",
      width: 120,
      render: (_, record) => {
        const category = (record.category || "").toLowerCase().trim();

        if (category !== "compliance documents") {
          return "-";
        }

        const status = getExpiryStatus(record.expiryDate);

        if (!status) return "-";

        return (
          <Button
            size="small"
            type="primary"
            danger={status === "expired"}
            style={{
              backgroundColor: status === "current" ? "#52c41a" : undefined,
              borderColor: status === "current" ? "#52c41a" : undefined,
              cursor: "default",
              fontWeight: "bold",
            }}
          >
            {status === "current" ? "Current" : "Expired"}
          </Button>
        );
      },
    },
    {
      title: "View",
      key: "view",
      width: 80,
      render: (_, record) =>
        record.fileUrl && (
          <>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                window.open(
                  getFullUrlUtil(record.fileUrl || record.uploadData?.fileUrl),
                  "_blank",
                )
              }
              style={{ borderRadius: 6 }}
            >
              View
            </Button>
          </>
        ),
    },
  ];

  return (
    <>
      {console.log("🎨 [Modal] Rendering Modal component, open:", open)}
      <Modal
        title={
          <span
            style={{
              color: "white",
              fontSize: "1.15rem",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            Completed Checklist - {checklist?.title || ""}
          </span>
        }
        open={open}
        onCancel={onClose}
        width={1100}
        footer={[
          <Button
            key="download"
            icon={<FilePdfOutlined />}
            loading={isGeneratingPDF}
            onClick={downloadChecklistAsPDF}
            type="primary"
            style={{
              backgroundColor: PRIMARY_BLUE,
              borderColor: PRIMARY_BLUE,
            }}
          >
            Download as PDF
          </Button>,
          !readOnly && (
            <Button
              key="revive"
              icon={<RedoOutlined />}
              loading={isReviving}
              disabled={isReviving}
              onClick={() => {
                console.log("🔥 [Modal] Revive button clicked directly!");
                console.log("🔥 [Modal] Modal is open:", open);
                console.log("🔥 [Modal] Checklist exists:", !!checklist);
                console.log("🔥 [Modal] Button is not disabled:", !isReviving);
                handleReviveChecklist();
              }}
              style={{
                background: ACCENT_LIME,
                borderColor: ACCENT_LIME,
                color: PRIMARY_BLUE,
                fontWeight: 600,
              }}
            >
              Revive Checklist
            </Button>
          ),
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
        // Add these styles for the blue header (from first code)
        styles={{
          header: {
            background: PRIMARY_BLUE,
            padding: "18px 24px",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          },
          body: {
            padding: 24,
          },
          footer: {
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
          },
        }}
      >
        {checklist && (
          <>
            <Card
              className="checklist-info-card"
              size="small"
              title={
                <span style={{ color: PRIMARY_BLUE, fontSize: 14 }}>
                  Checklist Details
                </span>
              }
              style={{
                marginBottom: 18,
                borderRadius: 10,
                border: `1px solid #e0e0e0`,
              }}
            >
              <Descriptions size="middle" column={{ xs: 1, sm: 2, lg: 3 }}>
                <Descriptions.Item label="DCL No">
                  {checklist.dclNo}
                </Descriptions.Item>
                <Descriptions.Item label="Customer number">
                  {checklist.customerNumber || "Not provided"}
                </Descriptions.Item>
                <Descriptions.Item label="IBPS No">
                  {checklist.ibpsNo || "Not provided"}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {checklist.createdAt}
                </Descriptions.Item>
                <Descriptions.Item label="Loan Type">
                  {checklist.loanType}
                </Descriptions.Item>
                <Descriptions.Item label="Created By">
                  {checklist.createdBy?.name}
                </Descriptions.Item>
                <Descriptions.Item label="RM">
                  {checklist.assignedToRM?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Co-Checker">
                  {checklist.assignedToCoChecker?.name || "Pending"}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="green">{checklist.status}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Completed At">
                  {checklist.completedAt || checklist.updatedAt || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* ENHANCED Progress Section - Matching the first code style */}
            <div
              style={{
                padding: "16px",
                background: "#f7f9fc",
                borderRadius: 8,
                border: "1px solid #e0e0e0",
                marginBottom: 18,
              }}
            >
              {/* Stats Row - counts of each status (from first code) */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div style={{ fontWeight: "700", color: PRIMARY_BLUE }}>
                  Total: {total}
                </div>
                <div style={{ fontWeight: "700", color: "green" }}>
                  Submitted: {submitted}
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    color: pendingFromRM > 0 ? "#f59e0b" : "#8b5cf6",
                  }}
                >
                  Pending RM: {pendingFromRM}
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    color: "#8b5cf6",
                    border: pendingFromCo > 0 ? "2px solid #8b5cf6" : "none",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: pendingFromCo > 0 ? "#f3f4f6" : "transparent",
                  }}
                >
                  Pending Co: {pendingFromCo}
                </div>
                <div style={{ fontWeight: "700", color: "#ef4444" }}>
                  Deferred: {deferred}
                </div>
                <div style={{ fontWeight: "700", color: "#3b82f6" }}>
                  Sighted: {sighted}
                </div>
                <div style={{ fontWeight: "700", color: "#f59e0b" }}>
                  Waived: {waived}
                </div>
                <div style={{ fontWeight: "700", color: "#06b6d4" }}>
                  TBO: {tbo}
                </div>
              </div>

              {/* Progress Bar (from first code) */}
              <div style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    Completion Progress
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: PRIMARY_BLUE,
                    }}
                  >
                    {progressPercent}%
                  </span>
                </div>
                <Progress
                  percent={progressPercent}
                  strokeColor={{
                    "0%": PRIMARY_BLUE,
                    "100%": ACCENT_LIME,
                  }}
                  strokeWidth={6}
                />
              </div>
            </div>

            <Table
              className="doc-table"
              columns={columns}
              dataSource={docs}
              pagination={false}
              rowKey="docIdx"
              size="small"
              scroll={{ x: "max-content" }}
            />

            <div style={{ marginTop: 24 }}>
              <h4>Comment Trail & History</h4>
              <CommentHistory comments={comments} isLoading={commentsLoading} />
            </div>
          </>
        )}
      </Modal>

      {/* Revive Confirmation Dialog - KEEP ORIGINAL */}
      <Modal
        title="Revive Checklist"
        open={showReviveConfirm}
        onCancel={handleCancelRevive}
        centered
        footer={[
          <Button key="cancel" onClick={handleCancelRevive}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={isReviving}
            onClick={handleConfirmRevive}
            style={{
              background: ACCENT_LIME,
              borderColor: ACCENT_LIME,
              color: PRIMARY_BLUE,
              fontWeight: 600,
            }}
          >
            Revive Checklist
          </Button>,
        ]}
      >
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
            Are you sure you want to revive this checklist?
          </p>
          <div
            style={{
              marginTop: 12,
              padding: 16,
              background: "rgba(181, 211, 52, 0.1)",
              borderRadius: 8,
              borderLeft: `4px solid ${ACCENT_LIME}`,
            }}
          >
            <Text
              strong
              style={{
                color: PRIMARY_BLUE,
                display: "block",
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              ✨ This action will:
            </Text>
            <ul
              style={{
                margin: "8px 0 12px",
                paddingLeft: 20,
                fontSize: 12,
                lineHeight: 1.8,
              }}
            >
              <li>Create a new checklist based on this completed one</li>
              <li>Copy customer information and loan details</li>
              <li>Preserve document templates and categories</li>
              <li>Generate a new DCL number for the revived checklist</li>
              <li>Set status to "Revived" for tracking</li>
              <li>Add it to "Created Checklists For Review" section</li>
            </ul>
            <Text
              type="secondary"
              style={{
                fontSize: 11,
                display: "block",
                marginTop: 8,
                color: "#555",
                fontStyle: "italic",
              }}
            >
              💡 Ideal for: Revolving facilities, follow-up loans, or similar
              transactions.
            </Text>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CreatorCompletedChecklistModal;
