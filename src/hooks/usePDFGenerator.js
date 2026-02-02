import { useState, useCallback } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { getExpiryStatus } from '../utils/documentUtils';
import { PRIMARY_BLUE, ACCENT_LIME, SECONDARY_PURPLE } from '../utils/constants';

const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Calculate document statistics for PDF
   */
  const calculateDocumentStats = useCallback((documents) => {
    const total = documents.length;
    const submitted = documents.filter(d =>
      ["submitted", "sighted", "waived", "tbo"].includes((d.status || "").toLowerCase())
    ).length;
    const pendingFromRM = documents.filter(d =>
      (d.status || "").toLowerCase() === "pendingrm"
    ).length;
    const pendingFromCo = documents.filter(d =>
      (d.status || "").toLowerCase() === "pendingco"
    ).length;
    const deferred = documents.filter(d =>
      (d.status || "").toLowerCase() === "deferred"
    ).length;
    const sighted = documents.filter(d =>
      (d.status || "").toLowerCase() === "sighted"
    ).length;
    const waived = documents.filter(d =>
      (d.status || "").toLowerCase() === "waived"
    ).length;
    const tbo = documents.filter(d =>
      (d.status || "").toLowerCase() === "tbo"
    ).length;

    const totalRelevantDocs = documents.filter(d =>
      !["pendingco"].includes((d.status || "").toLowerCase())
    ).length;

    const progressPercent = totalRelevantDocs === 0 ? 0 :
      Math.round((submitted / totalRelevantDocs) * 100);

    return {
      total,
      submitted,
      pendingFromRM,
      pendingFromCo,
      deferred,
      sighted,
      waived,
      tbo,
      progressPercent,
      totalRelevantDocs
    };
  }, []);

  /**
   * Get role color for comment styling
   */
  const getRoleColor = useCallback((role) => {
    const roleLower = (role || "").toLowerCase();
    if (roleLower.includes("rm") || roleLower === "rm") {
      return "#8b5cf6"; // purple
    } else if (roleLower.includes("cocreator") || roleLower.includes("co_creator") || roleLower === "creator" || roleLower === "co creator") {
      return "#10b981"; // green
    } else if (roleLower.includes("cochecker") || roleLower.includes("co_checker") || roleLower === "checker" || roleLower === "co checker") {
      return "#f59e0b"; // orange
    } else if (roleLower.includes("system")) {
      return "#64748b"; // gray
    }
    return "#3b82f6"; // default blue
  }, []);

  /**
   * Get role display text
   */
  const getRoleText = useCallback((role) => {
    const roleLower = (role || "").toLowerCase();
    if (roleLower.includes("rm") || roleLower === "rm") {
      return "RM";
    } else if (roleLower.includes("cocreator") || roleLower.includes("co_creator") || roleLower === "creator" || roleLower === "co creator") {
      return "CREATOR";
    } else if (roleLower.includes("cochecker") || roleLower.includes("co_checker") || roleLower === "checker" || roleLower === "co checker") {
      return "CHECKER";
    } else if (roleLower.includes("system")) {
      return "SYSTEM";
    }
    return "USER";
  }, []);

  /**
   * Extract role from user object or comment
   */
  const extractUserRole = useCallback((comment) => {
    if (comment.role) return comment.role;
    if (comment.user?.role) return comment.user.role;
    if (comment.userId?.role) return comment.userId.role;
    if (comment.createdBy?.role) return comment.createdBy.role;

    const commentText = comment.message || comment.content || comment.comment || "";
    if (commentText.toLowerCase().includes("rm") || commentText.toLowerCase().includes("relationship manager")) {
      return "RM";
    }
    if (commentText.toLowerCase().includes("co-checker") || commentText.toLowerCase().includes("co checker")) {
      return "CHECKER";
    }
    if (commentText.toLowerCase().includes("co-creator") || commentText.toLowerCase().includes("co creator")) {
      return "CREATOR";
    }

    return comment.userRole || "USER";
  }, []);

  /**
   * Get status color text
   */
  const getStatusTextColor = useCallback((status) => {
    const statusLower = (status || "").toLowerCase();
    switch (statusLower) {
      case "submitted": return "#065f46";
      case "pendingrm":
      case "pendinggrm":
        return "#991b1b";
      case "pendingco": return "#92400e";
      case "waived": return "#92400e";
      case "sighted": return "#1e40af";
      case "deferred": return "#3730a3";
      case "tbo": return "#475569";
      default: return "#64748b";
    }
  }, []);

  /**
   * Format status for display
   */
  const formatStatusForDisplay = useCallback((status) => {
    if (!status) return "N/A";
    const statusLower = status.toLowerCase();
    if (statusLower.includes("pendinggrm")) return "PENDING";
    switch (statusLower) {
      case "submitted": return "SUBMITTED";
      case "pendingrm": return "PENDING";
      case "pendingco": return "PENDING";
      case "waived": return "WAIVED";
      case "sighted": return "SIGHTED";
      case "deferred": return "DEFERRED";
      case "tbo": return "TBO";
      default: return status.toUpperCase();
    }
  }, []);

  /**
   * Format user name with proper capitalization
   */
  const formatUserName = useCallback((name) => {
    if (!name) return "System User";
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, []);

  /**
   * Generate HTML content for PDF with clean bank-style layout
   */
  const generatePDFHtml = useCallback(({
    checklist,
    documents = [],
    supportingDocs = [],
    creatorComment = '',
    comments = []
  }) => {
    const stats = calculateDocumentStats(documents);
    const totalRelevantDocs = stats.total - stats.pendingFromCo;
    const completedDocsCount = stats.submitted;

    // Clean, professional colors matching the sample PDF
    const colors = {
      primary: "#1a365d",      // Dark blue
      secondary: "#2c5282",    // Medium blue
      accent: "#0f766e",       // Teal
      lightBlue: "#e6f2ff",    // Light blue background
      gray: "#6b7280",         // Text gray
      lightGray: "#f9fafb",    // Light background
      border: "#d1d5db",       // Border gray
      success: "#047857",      // Green
      warning: "#d97706",      // Orange
      danger: "#dc2626",       // Red
      white: "#ffffff",
    };

    const truncateText = (text, maxLength) => {
      if (!text) return "";
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 3) + "...";
    };

    // Function to render comments in clean format
    const renderAllComments = (allComments) => {
      if (!allComments || allComments.length === 0) {
        return '<div style="text-align: center; padding: 20px; color: #666; font-size: 10px;">No comments available</div>';
      }

      const sortedComments = [...allComments].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.timestamp || 0);
        const dateB = new Date(b.createdAt || b.timestamp || 0);
        return dateB - dateA;
      });

      return sortedComments.map((comment) => {
        const userName = comment.userId?.name ||
          comment.user?.name ||
          comment.createdBy?.name ||
          comment.username ||
          "System User";

        const userDisplay = formatUserName(userName);
        const userRole = extractUserRole(comment);
        const roleColor = getRoleColor(userRole);
        const roleText = getRoleText(userRole);

        const commentDate = comment.createdAt || comment.timestamp;
        const formattedDate = dayjs(commentDate).format("YYYY-MM-DD HH:mm:ss");
        const commentText = comment.message || comment.content || comment.comment || "";

        return `
          <div style="margin-bottom: 12px; page-break-inside: avoid;">
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <span style="
                color: ${roleColor};
                font-weight: 600;
                font-size: 10px;
                text-transform: uppercase;
                background: ${roleColor}15;
                padding: 2px 8px;
                border-radius: 3px;
                margin-right: 8px;
                border: 1px solid ${roleColor}30;
              ">
                ${roleText}
              </span>
              <span style="font-weight: 600; color: ${colors.primary}; font-size: 11px;">
                ${userDisplay}
              </span>
              <span style="color: ${colors.gray}; font-size: 10px; margin-left: auto;">
                ${formattedDate}
              </span>
            </div>
            <div style="
              font-size: 11px;
              line-height: 1.4;
              color: ${colors.primary};
              padding: 8px 12px;
              background: ${colors.lightGray};
              border-radius: 4px;
              border-left: 3px solid ${roleColor};
            ">
              ${commentText.replace(/\n/g, '<br>')}
            </div>
          </div>
        `;
      }).join("");
    };

    // Generate documents table in clean format
    const generateDocumentsTable = (docs) => {
      return `
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 8px;">
          <thead>
            <tr>
              <th style="border: 1px solid ${colors.border}; padding: 8px; text-align: left; background: ${colors.lightGray}; font-weight: 600; color: ${colors.primary};">Category</th>
              <th style="border: 1px solid ${colors.border}; padding: 8px; text-align: left; background: ${colors.lightGray}; font-weight: 600; color: ${colors.primary};">Document Name</th>
              <th style="border: 1px solid ${colors.border}; padding: 8px; text-align: left; background: ${colors.lightGray}; font-weight: 600; color: ${colors.primary};">Co Action</th>
              <th style="border: 1px solid ${colors.border}; padding: 8px; text-align: left; background: ${colors.lightGray}; font-weight: 600; color: ${colors.primary};">Co Status</th>
              <th style="border: 1px solid ${colors.border}; padding: 8px; text-align: left; background: ${colors.lightGray}; font-weight: 600; color: ${colors.primary};">Checker Status</th>
              <th style="border: 1px solid ${colors.border}; padding: 8px; text-align: left; background: ${colors.lightGray}; font-weight: 600; color: ${colors.primary};">Co Comment</th>
              <th style="border: 1px solid ${colors.border}; padding: 8px; text-align: left; background: ${colors.lightGray}; font-weight: 600; color: ${colors.primary};">Expiry Date</th>
              <th style="border: 1px solid ${colors.border}; padding: 8px; text-align: left; background: ${colors.lightGray}; font-weight: 600; color: ${colors.primary};">Validity</th>
              <th style="border: 1px solid ${colors.border}; padding: 8px; text-align: left; background: ${colors.lightGray}; font-weight: 600; color: ${colors.primary};">View</th>
            </tr>
          </thead>
          <tbody>
            ${docs.map((doc, index) => {
        const statusTextColor = getStatusTextColor(doc.status);
        const checkerStatusTextColor = getStatusTextColor(doc.checkerStatus || doc.finalCheckerStatus);
        const statusLabel = formatStatusForDisplay(doc.status);
        const checkerStatusLabel = doc.checkerStatus || doc.finalCheckerStatus
          ? formatStatusForDisplay(doc.checkerStatus || doc.finalCheckerStatus)
          : "—";
        const expiryStatus = getExpiryStatus(doc.expiryDate);
        const hasFile = doc.fileUrl ? "Yes" : "No";
        const truncatedName = truncateText(doc.name, 35);
        const truncatedCoComment = truncateText(doc.comment, 30);

        return `
              <tr style="page-break-inside: avoid; background: ${index % 2 === 0 ? colors.white : colors.lightGray};">
                <td style="border: 1px solid ${colors.border}; padding: 6px; color: ${colors.primary}; font-weight: 500;">${doc.category || "N/A"}</td>
                <td style="border: 1px solid ${colors.border}; padding: 6px; color: ${colors.primary};">${truncatedName}</td>
                <td style="border: 1px solid ${colors.border}; padding: 6px;">
                  <span style="text-transform: uppercase; font-weight: 600; color: ${colors.primary}; font-size: 9px;">
                    ${doc.action || "N/A"}
                  </span>
                </td>
                <td style="border: 1px solid ${colors.border}; padding: 6px;">
                  <span style="text-transform: uppercase; font-weight: 600; color: ${statusTextColor}; font-size: 9px;">
                    ${statusLabel}
                  </span>
                </td>
                <td style="border: 1px solid ${colors.border}; padding: 6px;">
                  <span style="text-transform: uppercase; font-weight: 600; color: ${checkerStatusTextColor}; font-size: 9px;">
                    ${checkerStatusLabel}
                  </span>
                </td>
                <td style="border: 1px solid ${colors.border}; padding: 6px; color: ${colors.gray};" title="${doc.comment || "—"}">
                  ${truncatedCoComment || "—"}
                </td>
                <td style="border: 1px solid ${colors.border}; padding: 6px; color: ${colors.gray}; font-family: monospace; font-size: 9px;">
                  ${doc.expiryDate ? dayjs(doc.expiryDate).format("YYYY-MM-DD") : "—"}
                </td>
                <td style="border: 1px solid ${colors.border}; padding: 6px;">
                  ${(() => {
            if (!expiryStatus) return "—";
            const validityColor = expiryStatus === "current" ? colors.success : colors.danger;
            return `<span style="text-transform: uppercase; font-weight: 600; color: ${validityColor}; font-size: 9px;">
                      ${expiryStatus === "current" ? "CURRENT" : "EXPIRED"}
                    </span>`;
          })()}
                </td>
                <td style="border: 1px solid ${colors.border}; padding: 6px; text-align: center; color: ${colors.gray};">${hasFile}</td>
              </tr>
            `;
      }).join("")}
          </tbody>
        </table>
      `;
    };

    // Generate statistics grid
    const generateStatsGrid = () => {
      return `
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="background: ${colors.lightGray}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 12px; text-align: center;">
            <div style="color: ${colors.gray}; font-size: 10px; margin-bottom: 4px;">Total Documents</div>
            <div style="font-size: 18px; font-weight: 700; color: ${colors.primary};">${stats.total}</div>
          </div>
          <div style="background: ${colors.lightGray}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 12px; text-align: center;">
            <div style="color: ${colors.gray}; font-size: 10px; margin-bottom: 4px;">Completed</div>
            <div style="font-size: 18px; font-weight: 700; color: ${colors.success};">${completedDocsCount}</div>
          </div>
          <div style="background: ${colors.lightGray}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 12px; text-align: center;">
            <div style="color: ${colors.gray}; font-size: 10px; margin-bottom: 4px;">Pending RM</div>
            <div style="font-size: 18px; font-weight: 700; color: ${colors.warning};">${stats.pendingFromRM}</div>
          </div>
          <div style="background: ${colors.lightGray}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 12px; text-align: center;">
            <div style="color: ${colors.gray}; font-size: 10px; margin-bottom: 4px;">Deferred</div>
            <div style="font-size: 18px; font-weight: 700; color: ${colors.danger};">${stats.deferred}</div>
          </div>
          <div style="background: ${colors.lightGray}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 12px; text-align: center;">
            <div style="color: ${colors.gray}; font-size: 10px; margin-bottom: 4px;">Progress</div>
            <div style="font-size: 18px; font-weight: 700; color: ${colors.success};">${stats.progressPercent}%</div>
          </div>
        </div>
      `;
    };

    // Generate checklist info grid
    const generateChecklistInfo = () => {
      return `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
          <div style="background: ${colors.lightGray}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 12px;">
            <div style="color: ${colors.gray}; font-size: 10px; margin-bottom: 4px;">DCL Number</div>
            <div style="font-size: 12px; font-weight: 600; color: ${colors.primary};">${checklist?.dclNo || "N/A"}</div>
          </div>
          <div style="background: ${colors.lightGray}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 12px;">
            <div style="color: ${colors.gray}; font-size: 10px; margin-bottom: 4px;">IBPS Number</div>
            <div style="font-size: 12px; font-weight: 600; color: ${colors.primary};">${checklist?.ibpsNo || "Not provided"}</div>
          </div>
          <div style="background: ${colors.lightGray}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 12px;">
            <div style="color: ${colors.gray}; font-size: 10px; margin-bottom: 4px;">Loan Type</div>
            <div style="font-size: 12px; font-weight: 600; color: ${colors.primary};">${checklist?.loanType || "N/A"}</div>
          </div>
          <div style="background: ${colors.lightGray}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 12px;">
            <div style="color: ${colors.gray}; font-size: 10px; margin-bottom: 4px;">Creation Date</div>
            <div style="font-size: 12px; font-weight: 600; color: ${colors.primary};">${dayjs(checklist?.createdAt).format("YYYY-MM-DD") || "N/A"}</div>
          </div>
          <div style="background: ${colors.lightGray}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 12px;">
            <div style="color: ${colors.gray}; font-size: 10px; margin-bottom: 4px;">Created By</div>
            <div style="font-size: 12px; font-weight: 600; color: ${colors.primary};">${formatUserName(checklist?.createdBy?.name) || "N/A"}</div>
          </div>
          <div style="background: ${colors.lightGray}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 12px;">
            <div style="color: ${colors.gray}; font-size: 10px; margin-bottom: 4px;">Relationship Manager</div>
            <div style="font-size: 12px; font-weight: 600; color: ${colors.primary};">${formatUserName(checklist?.assignedToRM?.name) || "N/A"}</div>
          </div>
        </div>
      `;
    };

    // Create HTML content with clean, professional layout
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Checklist Report - ${checklist?.dclNo || 'DCL'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
         
          body {
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            color: #333333;
            line-height: 1.4;
            padding: 30px;
            background: ${colors.white};
          }
         
          .page-break {
            page-break-before: always;
            padding-top: 30px;
          }
         
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
         
          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: ${colors.primary};
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid ${colors.primary};
          }
         
          .header {
            border-bottom: 3px solid ${colors.primary};
            padding-bottom: 20px;
            margin-bottom: 25px;
            text-align: center;
          }
         
          .bank-name {
            font-size: 22px;
            font-weight: 700;
            color: ${colors.primary};
            margin-bottom: 5px;
          }
         
          .bank-tagline {
            font-size: 12px;
            color: ${colors.gray};
            margin-bottom: 15px;
          }
         
          .document-title {
            font-size: 16px;
            font-weight: 700;
            color: ${colors.secondary};
            margin: 10px 0;
          }
         
          .document-subtitle {
            font-size: 11px;
            color: ${colors.gray};
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 10px;
          }
         
          .document-badge {
            background: ${colors.lightGray};
            padding: 4px 10px;
            border-radius: 3px;
            border: 1px solid ${colors.border};
          }
         
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid ${colors.border};
            text-align: center;
            font-size: 9px;
            color: ${colors.gray};
            page-break-before: avoid;
          }
         
          .disclaimer {
            background: ${colors.lightGray};
            padding: 10px;
            border-radius: 3px;
            margin-top: 10px;
            font-size: 8px;
            border: 1px solid ${colors.border};
          }
         
          table {
            page-break-inside: auto;
          }
         
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
         
          thead {
            display: table-header-group;
          }
         
          tfoot {
            display: table-footer-group;
          }
        </style>
      </head>
      <body>
        <!-- Page 1: Header and Summary -->
        <div class="header">
          <div class="bank-name">${checklist?.bankName || "NCBA BANK KENYA PLC"}</div>
          <div class="bank-tagline">GO FOR IT</div>
          <div class="document-title">Co Checklist Review - Document Checklist</div>
          <div class="document-subtitle">
            <span class="document-badge">DCL No: <strong>${checklist?.dclNo || "N/A"}</strong></span>
            <span class="document-badge">IBPS No: <strong>${checklist?.ibpsNo || "Not provided"}</strong></span>
            <span class="document-badge">Generated: <strong>${dayjs().format("YYYY-MM-DD HH:mm:ss")}</strong></span>
          </div>
          <div style="margin-top: 15px; font-size: 11px; color: ${colors.gray};">
            Current Status: <strong style="color: ${colors.primary};">${checklist?.status?.replace(/_/g, " ").toUpperCase() || "UNKNOWN"}</strong>
          </div>
        </div>

        <!-- Checklist Information -->
        <div class="section">
          <div class="section-title">Checklist Information</div>
          ${generateChecklistInfo()}
        </div>

        <!-- Document Summary -->
        <div class="section">
          <div class="section-title">Document Summary</div>
          ${generateStatsGrid()}
          <div style="font-size: 10px; color: ${colors.gray}; margin-top: 10px;">
            Note: ${stats.pendingFromCo} document(s) with "pendingco" status excluded from progress calculation
          </div>
        </div>

        <!-- Page Break for Document Details -->
        <div class="page-break">
          <!-- Document Details -->
          <div class="section">
            <div class="section-title">Document Details (${documents.length} documents)</div>
            ${generateDocumentsTable(documents)}
          </div>
        </div>

        <!-- Page Break for Supporting Docs and Comments -->
        <div class="page-break">
          <!-- Supporting Documents -->
          ${supportingDocs.length > 0 ? `
            <div class="section">
              <div class="section-title">Supporting Documents (${supportingDocs.length})</div>
              <div style="background: ${colors.lightGray}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 15px;">
                ${supportingDocs.map((doc) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid ${colors.border};">
                    <div>
                      <div style="font-weight: 600; font-size: 11px; color: ${colors.primary};">${doc.name}</div>
                      <div style="font-size: 10px; color: ${colors.gray}; margin-top: 2px;">
                        Uploaded: ${dayjs(doc.uploadedAt).format("YYYY-MM-DD HH:mm")}
                      </div>
                    </div>
                    <span style="font-size: 10px; color: ${colors.success}; font-weight: 600;">✓ Uploaded</span>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ""}

          <!-- Creator's Remarks -->
          ${creatorComment ? `
            <div class="section">
              <div class="section-title">Creator's Remarks</div>
              <div style="background: ${colors.lightGray}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="font-weight: 600; color: ${colors.primary}; font-size: 11px;">
                    ${formatUserName(checklist?.createdBy?.name) || "Checklist Creator"}
                  </span>
                  <span style="font-size: 10px; color: ${colors.gray};">
                    ${dayjs().format("YYYY-MM-DD HH:mm")}
                  </span>
                </div>
                <div style="font-size: 11px; color: ${colors.primary}; line-height: 1.5;">
                  ${creatorComment}
                </div>
              </div>
            </div>
          ` : ""}

          <!-- Comment History -->
          <div class="section">
            <div class="section-title">Comment Trail & History (${comments?.length || 0} comments)</div>
            <div style="background: ${colors.white}; border: 1px solid ${colors.border}; border-radius: 4px; padding: 15px;">
              ${comments && comments.length > 0 ?
        renderAllComments(comments)
        : `
                <div style="text-align: center; padding: 30px; color: ${colors.gray};">
                  <div style="font-size: 24px; margin-bottom: 10px; opacity: 0.5;">💬</div>
                  <div>No comments available for this checklist</div>
                  <div style="font-size: 10px; margin-top: 5px;">
                    Comments will appear here when added by users
                  </div>
                </div>
              `}
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div style="margin-bottom: 8px;">
              <strong>${checklist?.bankName || "NCBA BANK KENYA PLC"}</strong> • Document Checklist Review System • Generated by: ${formatUserName(checklist?.createdBy?.name) || "System"}
            </div>
            <div class="disclaimer">
              This is a system-generated document. For official purposes only. Any unauthorized reproduction or distribution is strictly prohibited.
              Generated on ${dayjs().format("YYYY-MM-DD HH:mm:ss")} • DCL: ${checklist?.dclNo || "N/A"} • IBPS: ${checklist?.ibpsNo || "N/A"}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  }, [calculateDocumentStats, getRoleColor, getRoleText, extractUserRole, getStatusTextColor, formatStatusForDisplay, formatUserName]);

  /**
   * Generate and download PDF
   */
  const generatePDF = useCallback(async ({
    checklist,
    documents,
    supportingDocs,
    creatorComment,
    comments,
    onProgress
  }) => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const updateProgress = (percent) => {
        setProgress(percent);
        onProgress?.(percent);
      };

      updateProgress(10);

      const jsPDF = (await import("jspdf")).default;
      const html2canvas = await import("html2canvas");

      updateProgress(30);

      const htmlContent = generatePDFHtml({
        checklist,
        documents,
        supportingDocs,
        creatorComment,
        comments
      });

      updateProgress(50);

      const pdfContainer = document.createElement("div");
      pdfContainer.style.position = "absolute";
      pdfContainer.style.left = "-9999px";
      pdfContainer.style.top = "0";
      pdfContainer.style.width = "794px";
      pdfContainer.style.padding = "30px";
      pdfContainer.style.backgroundColor = "#ffffff";
      pdfContainer.style.fontFamily = "'Arial', sans-serif";
      pdfContainer.style.color = "#333333";
      pdfContainer.innerHTML = htmlContent;

      document.body.appendChild(pdfContainer);

      updateProgress(60);

      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgress(70);

      const canvas = await html2canvas.default(pdfContainer, {
        scale: 1.8,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
        width: pdfContainer.offsetWidth,
        height: pdfContainer.scrollHeight,
      });

      updateProgress(85);

      const imgData = canvas.toDataURL("image/png", 0.9);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth - 20; // Margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 10;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `DCL_${checklist?.dclNo || "export"}_${dayjs().format("YYYYMMDD_HHmmss")}.pdf`;
      pdf.save(fileName);

      updateProgress(95);

      document.body.removeChild(pdfContainer);

      updateProgress(100);

      message.success("Checklist PDF generated successfully!");

      return {
        success: true,
        fileName
      };
    } catch (error) {
      console.error("PDF generation error:", error);
      message.error("Failed to generate PDF. Please try again.");

      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [generatePDFHtml]);

  return {
    isGenerating,
    progress,
    generatePDF,
    generatePDFHtml,
  };
};

export default usePDFGenerator;