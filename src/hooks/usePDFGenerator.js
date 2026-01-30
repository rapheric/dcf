
// import { useState, useCallback } from 'react';
// import { message } from 'antd';
// import dayjs from 'dayjs';
// import { getExpiryStatus } from '../utils/documentUtils';
// import { PRIMARY_BLUE, ACCENT_LIME, SECONDARY_PURPLE } from '../utils/constants';

// const usePDFGenerator = () => {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [progress, setProgress] = useState(0);

//   /**
//    * Calculate document statistics for PDF
//    */
//   const calculateDocumentStats = useCallback((documents) => {
//     const total = documents.length;
//     const submitted = documents.filter(d => 
//       ["submitted", "sighted", "waived", "tbo"].includes((d.status || "").toLowerCase())
//     ).length;
//     const pendingFromRM = documents.filter(d => 
//       (d.status || "").toLowerCase() === "pendingrm"
//     ).length;
//     const pendingFromCo = documents.filter(d => 
//       (d.status || "").toLowerCase() === "pendingco"
//     ).length;
//     const deferred = documents.filter(d => 
//       (d.status || "").toLowerCase() === "deferred"
//     ).length;
//     const sighted = documents.filter(d => 
//       (d.status || "").toLowerCase() === "sighted"
//     ).length;
//     const waived = documents.filter(d => 
//       (d.status || "").toLowerCase() === "waived"
//     ).length;
//     const tbo = documents.filter(d => 
//       (d.status || "").toLowerCase() === "tbo"
//     ).length;

//     const totalRelevantDocs = documents.filter(d => 
//       !["pendingco"].includes((d.status || "").toLowerCase())
//     ).length;
    
//     const progressPercent = totalRelevantDocs === 0 ? 0 : 
//       Math.round((submitted / totalRelevantDocs) * 100);

//     return {
//       total,
//       submitted,
//       pendingFromRM,
//       pendingFromCo,
//       deferred,
//       sighted,
//       waived,
//       tbo,
//       progressPercent,
//       totalRelevantDocs
//     };
//   }, []);

//   /**
//    * Generate HTML content for PDF using your design
//    */
//   const generatePDFHtml = useCallback(({
//     checklist,
//     documents = [],
//     supportingDocs = [],
//     creatorComment = '',
//     comments = []
//   }) => {
//     const stats = calculateDocumentStats(documents);
//     const totalRelevantDocs = stats.total - stats.pendingFromCo;
//     const completedDocsCount = stats.submitted;

//     const bankColors = {
//       primary: PRIMARY_BLUE || "#1a365d",
//       secondary: SECONDARY_PURPLE || "#2c5282",
//       accent: ACCENT_LIME || "#0f766e",
//       success: "#047857",
//       warning: "#d97706",
//       danger: "#dc2626",
//       light: "#f8fafc",
//       border: "#e2e8f0",
//       text: "#334155",
//       textLight: "#64748b",
//     };

//     const getStatusColor = (status) => {
//       const statusLower = (status || "").toLowerCase();
//       switch (statusLower) {
//         case "submitted":
//           return { bg: "#d1fae5", color: "#065f46", border: "#10b981" };
//         case "pendingrm":
//           return { bg: "#fee2e2", color: "#991b1b", border: "#ef4444" };
//         case "pendingco":
//           return { bg: "#fef3c7", color: "#92400e", border: "#f59e0b" };
//         case "waived":
//           return { bg: "#fef3c7", color: "#92400e", border: "#f59e0b" };
//         case "sighted":
//           return { bg: "#dbeafe", color: "#1e40af", border: "#3b82f6" };
//         case "deferred":
//           return { bg: "#e0e7ff", color: "#3730a3", border: "#6366f1" };
//         case "tbo":
//           return { bg: "#f1f5f9", color: "#475569", border: "#94a3b8" };
//         default:
//           return { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" };
//       }
//     };

//     const truncateText = (text, maxLength) => {
//       if (!text) return "";
//       if (text.length <= maxLength) return text;
//       return text.substring(0, maxLength - 3) + "...";
//     };

//     // Create HTML content
//     const htmlContent = `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Checklist Report - ${checklist?.dclNo || 'DCL'}</title>
//         <style>
//           * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//           }
          
//           .pdf-header {
//             border-bottom: 2px solid ${bankColors.primary};
//             padding-bottom: 15px;
//             margin-bottom: 20px;
//             position: relative;
//           }
         
//           .bank-logo {
//             display: flex;
//             align-items: center;
//             gap: 12px;
//             margin-bottom: 12px;
//           }
         
//           .logo-circle {
//             width: 50px;
//             height: 50px;
//             background: ${bankColors.primary};
//             border-radius: 50%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             color: white;
//             font-weight: bold;
//             font-size: 20px;
//           }
         
//           .bank-name {
//             font-size: 20px;
//             font-weight: bold;
//             color: ${bankColors.primary};
//             letter-spacing: 0.5px;
//           }
         
//           .bank-tagline {
//             font-size: 10px;
//             color: ${bankColors.textLight};
//             margin-top: 2px;
//             letter-spacing: 0.3px;
//           }
         
//           .document-title {
//             font-size: 16px;
//             font-weight: bold;
//             color: ${bankColors.secondary};
//             margin-bottom: 5px;
//           }
         
//           .document-subtitle {
//             font-size: 12px;
//             color: ${bankColors.textLight};
//             display: flex;
//             gap: 15px;
//             flex-wrap: wrap;
//           }
         
//           .document-badge {
//             background: ${bankColors.light};
//             padding: 4px 8px;
//             border-radius: 4px;
//             font-size: 10px;
//             display: inline-flex;
//             align-items: center;
//             gap: 4px;
//           }
         
//           .badge-dot {
//             width: 6px;
//             height: 6px;
//             border-radius: 50%;
//           }
         
//           .section-card {
//             background: white;
//             border: 1px solid ${bankColors.border};
//             border-radius: 6px;
//             padding: 15px;
//             margin-bottom: 15px;
//             box-shadow: 0 1px 3px rgba(0,0,0,0.05);
//           }
         
//           .section-title {
//             font-size: 14px;
//             font-weight: bold;
//             color: ${bankColors.primary};
//             margin-bottom: 12px;
//             padding-bottom: 6px;
//             border-bottom: 1px solid ${bankColors.light};
//             display: flex;
//             align-items: center;
//             gap: 8px;
//           }
         
//           .section-title::before {
//             content: "▌";
//             color: ${bankColors.accent};
//             font-size: 12px;
//           }
         
//           .info-grid {
//             display: grid;
//             grid-template-columns: repeat(4, 1fr);
//             gap: 10px;
//             margin-bottom: 8px;
//             font-size: 10px;
//           }
         
//           .info-item {
//             padding: 8px;
//             background: ${bankColors.light};
//             border-radius: 4px;
//             border-left: 3px solid ${bankColors.secondary};
//           }
         
//           .info-label {
//             font-size: 9px;
//             color: ${bankColors.textLight};
//             text-transform: uppercase;
//             letter-spacing: 0.3px;
//             margin-bottom: 2px;
//           }
         
//           .info-value {
//             font-size: 11px;
//             font-weight: 600;
//             color: ${bankColors.text};
//           }
         
//           .summary-cards {
//             display: grid;
//             grid-template-columns: repeat(10, 1fr);
//             gap: 8px;
//             margin-bottom: 15px;
//             font-size: 9px;
//           }
         
//           .summary-card {
//             padding: 8px;
//             border-radius: 6px;
//             text-align: center;
//             background: ${bankColors.light};
//             border: 1px solid ${bankColors.border};
//           }
         
//           .summary-number {
//             font-size: 16px;
//             font-weight: bold;
//             color: ${bankColors.primary};
//             margin: 4px 0;
//           }
         
//           .summary-label {
//             font-size: 8px;
//             color: ${bankColors.textLight};
//             text-transform: uppercase;
//             letter-spacing: 0.3px;
//           }
         
//           .progress-bar {
//             height: 6px;
//             background: ${bankColors.border};
//             border-radius: 3px;
//             overflow: hidden;
//             margin: 12px 0;
//           }
         
//           .progress-fill {
//             height: 100%;
//             background: linear-gradient(90deg, ${bankColors.success}, ${bankColors.accent});
//             border-radius: 3px;
//           }
         
//           .progress-text {
//             display: flex;
//             justify-content: space-between;
//             font-size: 10px;
//             color: ${bankColors.textLight};
//           }
         
//           .table-container {
//             overflow-x: auto;
//             margin-top: 12px;
//           }
         
//           .document-table {
//             width: 100%;
//             border-collapse: collapse;
//             font-size: 9px;
//             table-layout: fixed;
//           }
         
//           .document-table th {
//             background: ${bankColors.primary};
//             color: white;
//             text-align: left;
//             padding: 8px 6px;
//             font-weight: 600;
//             text-transform: uppercase;
//             letter-spacing: 0.3px;
//             border-right: 1px solid rgba(255,255,255,0.2);
//             word-wrap: break-word;
//             overflow-wrap: break-word;
//           }
         
//           .document-table td {
//             padding: 6px;
//             border-bottom: 1px solid ${bankColors.border};
//             vertical-align: top;
//             word-wrap: break-word;
//             overflow-wrap: break-word;
//           }
         
//           .document-table tr:nth-child(even) {
//             background: ${bankColors.light};
//           }
         
//           .status-badge {
//             padding: 2px 6px;
//             border-radius: 10px;
//             font-size: 8px;
//             font-weight: 600;
//             display: inline-block;
//             border: 1px solid;
//             text-align: center;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//           }
         
//           .comment-box {
//             background: ${bankColors.light};
//             border-left: 3px solid ${bankColors.accent};
//             padding: 10px;
//             border-radius: 4px;
//             margin-top: 8px;
//             font-size: 10px;
//             line-height: 1.4;
//           }
         
//           .comment-header {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             margin-bottom: 5px;
//           }
         
//           .comment-author {
//             font-weight: 600;
//             color: ${bankColors.primary};
//             font-size: 10px;
//           }
         
//           .comment-date {
//             font-size: 9px;
//             color: ${bankColors.textLight};
//           }
         
//           .watermark {
//             position: fixed;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%) rotate(-45deg);
//             font-size: 60px;
//             color: rgba(0,0,0,0.03);
//             font-weight: bold;
//             pointer-events: none;
//             z-index: 1;
//           }
         
//           .footer {
//             margin-top: 30px;
//             padding-top: 15px;
//             border-top: 1px solid ${bankColors.border};
//             text-align: center;
//             font-size: 9px;
//             color: ${bankColors.textLight};
//             line-height: 1.4;
//           }
         
//           .disclaimer {
//             background: ${bankColors.light};
//             padding: 8px;
//             border-radius: 3px;
//             margin-top: 8px;
//             font-size: 8px;
//           }
          
//           .header-content {
//             display: flex;
//             justify-content: space-between;
//             align-items: flex-start;
//             margin-top: 10px;
//             padding-top: 10px;
//             border-top: 1px solid ${bankColors.border};
//           }
          
//           .document-info {
//             flex: 1;
//           }
          
//           .current-status-section {
//             display: flex;
//             flex-direction: column;
//             align-items: flex-end;
//             min-width: 140px;
//           }
          
//           .status-label {
//             font-size: 9px;
//             color: ${bankColors.textLight};
//             text-transform: uppercase;
//             letter-spacing: 0.3px;
//             margin-bottom: 4px;
//           }
          
//           .status-display {
//             padding: 5px 10px;
//             border-radius: 4px;
//             font-size: 11px;
//             font-weight: 600;
//             text-align: center;
//             border: 2px solid;
//             min-width: 120px;
//           }
          
//           /* Supporting documents section */
//           .supporting-docs-section {
//             margin-top: 20px;
//             border: 1px solid #e0e0e0;
//             border-radius: 6px;
//             padding: 15px;
//           }
          
//           .supporting-doc-item {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             padding: 8px;
//             border-bottom: 1px solid #f0f0f0;
//           }
          
//           .supporting-doc-item:last-child {
//             border-bottom: none;
//           }
//         </style>
//       </head>
//       <body>
//         <!-- Watermark -->
//         <div class="watermark">${checklist?.bankName || "BANK DOCUMENT"}</div>

//         <!-- Header with Bank Logo -->
//         <div class="pdf-header">
//           <div class="bank-logo">
//             <div class="logo-circle">${checklist?.bankInitials || "NCBA"}</div>
//             <div>
//               <div class="bank-name">${checklist?.bankName || "NCBA BANK KENYA PLC"}</div>
//               <div class="bank-tagline">GO FOR IT</div>
//             </div>
//           </div>
         
//           <!-- Document Info and Status Section -->
//           <div class="header-content">
//             <div class="document-info">
//               <div class="document-title">Co Checklist Review - Document Checklist</div>
//               <div class="document-subtitle">
//                 <span class="document-badge">
//                   <span class="badge-dot" style="background: ${bankColors.primary}"></span>
//                   DCL No: <strong>${checklist?.dclNo || "N/A"}</strong>
//                 </span>
//                 <span class="document-badge">
//                   <span class="badge-dot" style="background: ${bankColors.secondary}"></span>
//                   IBPS No: <strong>${checklist?.ibpsNo || "Not provided"}</strong>
//                 </span>
//                 <span class="document-badge">
//                   <span class="badge-dot" style="background: ${bankColors.accent}"></span>
//                   Generated: <strong>${dayjs().format("DD MMM YYYY, HH:mm:ss")}</strong>
//                 </span>
//               </div>
//             </div>
            
//             <!-- Current Status Display -->
//             <div class="current-status-section">
//               <div class="status-label">Current Status</div>
//               <div class="status-display" style="
//                 background: ${checklist?.status === "co_creator_review" ? "#d1fae5" : "#fef3c7"};
//                 color: ${checklist?.status === "co_creator_review" ? "#065f46" : "#92400e"};
//                 border-color: ${checklist?.status === "co_creator_review" ? "#10b981" : "#f59e0b"};
//               ">
//                 ${checklist?.status?.replace(/_/g, " ").toUpperCase() || "UNKNOWN"}
//               </div>
//             </div>
//           </div>
//         </div>

//         <!-- Checklist Information -->
//         <div class="section-card">
//           <div class="section-title">Checklist Information</div>
//           <div class="info-grid">
//             <div class="info-item">
//               <div class="info-label">DCL Number</div>
//               <div class="info-value">${checklist?.dclNo || "N/A"}</div>
//             </div>
//             <div class="info-item">
//               <div class="info-label">IBPS Number</div>
//               <div class="info-value">${checklist?.ibpsNo || "Not provided"}</div>
//             </div>
//             <div class="info-item">
//               <div class="info-label">Loan Type</div>
//               <div class="info-value">${checklist?.loanType || "N/A"}</div>
//             </div>
//             <div class="info-item">
//               <div class="info-label">Creation Date</div>
//               <div class="info-value">${dayjs(checklist?.createdAt).format("DD MMM YYYY") || "N/A"}</div>
//             </div>
//             <div class="info-item">
//               <div class="info-label">Created By</div>
//               <div class="info-value">${checklist?.createdBy?.name || "N/A"}</div>
//             </div>
//             <div class="info-item">
//               <div class="info-label">Relationship Manager</div>
//               <div class="info-value">${checklist?.assignedToRM?.name || "N/A"}</div>
//             </div>
//             <div class="info-item">
//               <div class="info-label">Co-Checker</div>
//               <div class="info-value">${checklist?.assignedToCoChecker?.name || "Pending Assignment"}</div>
//             </div>
//           </div>
//         </div>

//         <!-- Document Summary -->
//         <div class="section-card">
//           <div class="section-title">Document Summary</div>
         
//           <div class="summary-cards">
//             <div class="summary-card">
//               <div class="summary-label">Total</div>
//               <div class="summary-number">${stats.total}</div>
//             </div>
//             <div class="summary-card">
//               <div class="summary-label">Relevant</div>
//               <div class="summary-number" style="color: ${bankColors.success};">
//                 ${totalRelevantDocs}
//               </div>
//             </div>
//             <div class="summary-card">
//               <div class="summary-label">Completed</div>
//               <div class="summary-number" style="color: ${bankColors.success};">
//                 ${completedDocsCount}
//               </div>
//             </div>
//             <div class="summary-card">
//               <div class="summary-label">Pending RM</div>
//               <div class="summary-number" style="color: ${bankColors.warning};">
//                 ${stats.pendingFromRM}
//               </div>
//             </div>
//             <div class="summary-card">
//               <div class="summary-label">Pending Co</div>
//               <div class="summary-number" style="color: #8b5cf6;">
//                 ${stats.pendingFromCo}
//               </div>
//             </div>
//             <div class="summary-card">
//               <div class="summary-label">Deferred</div>
//               <div class="summary-number" style="color: ${bankColors.danger};">
//                 ${stats.deferred}
//               </div>
//             </div>
//             <div class="summary-card">
//               <div class="summary-label">Sighted</div>
//               <div class="summary-number" style="color: #3b82f6;">
//                 ${stats.sighted}
//               </div>
//             </div>
//             <div class="summary-card">
//               <div class="summary-label">Waived</div>
//               <div class="summary-number" style="color: ${bankColors.warning};">
//                 ${stats.waived}
//               </div>
//             </div>
//             <div class="summary-card">
//               <div class="summary-label">TBO</div>
//               <div class="summary-number" style="color: #06b6d4;">
//                 ${stats.tbo}
//               </div>
//             </div>
//             <div class="summary-card">
//               <div class="summary-label">Progress</div>
//               <div class="summary-number" style="color: ${bankColors.success};">
//                 ${stats.progressPercent}%
//               </div>
//             </div>
//           </div>
         
//           <div class="progress-text">
//             <span>Progress (excluding pendingco):</span>
//             <span>${stats.progressPercent}% (${completedDocsCount}/${totalRelevantDocs})</span>
//           </div>
//           <div class="progress-bar">
//             <div class="progress-fill" style="width: ${stats.progressPercent}%"></div>
//           </div>
//           <div style="font-size: 9px; color: ${bankColors.textLight}; margin-top: 8px;">
//             Note: ${stats.pendingFromCo} document(s) with "pendingco" status excluded from progress calculation
//           </div>
//         </div>

//         <!-- Document Details -->
//         <div class="section-card">
//           <div class="section-title">Document Details</div>
//           <div class="table-container">
//             <table class="document-table">
//               <thead>
//                 <tr>
//                   <th width="10%">Category</th>
//                   <th width="18%">Document Name</th>
//                   <th width="10%">Action</th>
//                   <th width="10%">Status</th>
//                   <th width="12%">Checker Status</th>
//                   <th width="12%">Co Comment</th>
//                   <th width="10%">Expiry Date</th>
//                   <th width="10%">Validity</th>
//                   <th width="8%">View</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${documents.map((doc, index) => {
//                   const statusColor = getStatusColor(doc.status);
//                   const checkerStatusColor = getStatusColor(doc.checkerStatus || doc.finalCheckerStatus);
//                   const statusLabel = doc.status === "deferred" && doc.deferralNo
//                     ? `Deferred (${doc.deferralNo})`
//                     : (doc.status || "N/A").toUpperCase();

//                   const checkerStatusLabel = doc.checkerStatus || doc.finalCheckerStatus
//                     ? (doc.checkerStatus || doc.finalCheckerStatus || "N/A").toUpperCase()
//                     : "—";

//                   const expiryStatus = getExpiryStatus(doc.expiryDate);
//                   const hasFile = doc.fileUrl ? "Yes" : "No";

//                   const truncatedName = truncateText(doc.name, 35);
//                   const truncatedCoComment = truncateText(doc.comment, 30);

//                   return `
//                   <tr>
//                     <td style="font-weight: 600; color: ${bankColors.secondary};">
//                       ${doc.category || "N/A"}
//                     </td>
//                     <td title="${doc.name || "N/A"}">${truncatedName}</td>
//                     <td>
//                       <span style="text-transform: uppercase; font-weight: 600; color: ${bankColors.primary}; font-size: 8px;">
//                         ${doc.action || "N/A"}
//                       </span>
//                     </td>
//                     <td>
//                       <span class="status-badge" style="
//                         background: ${statusColor.bg};
//                         color: ${statusColor.color};
//                         border-color: ${statusColor.border};
//                       ">
//                         ${statusLabel}
//                       </span>
//                     </td>
//                     <td>
//                       <span class="status-badge" style="
//                         background: ${checkerStatusColor.bg};
//                         color: ${checkerStatusColor.color};
//                         border-color: ${checkerStatusColor.border};
//                       ">
//                         ${checkerStatusLabel}
//                       </span>
//                     </td>
//                     <td title="${doc.comment || "—"}">
//                       ${truncatedCoComment || "—"}
//                     </td>
//                     <td style="font-family: monospace; font-size: 8px;">
//                       ${doc.expiryDate ? dayjs(doc.expiryDate).format("DD/MM/YY") : "—"}
//                     </td>
//                     <td>
//                       ${(() => {
//                         if (!expiryStatus) return "—";
//                         return `<span class="status-badge" style="
//                           background: ${expiryStatus === "current" ? "#d1fae5" : "#fee2e2"};
//                           color: ${expiryStatus === "current" ? "#065f46" : "#991b1b"};
//                           border-color: ${expiryStatus === "current" ? "#10b981" : "#ef4444"};
//                         ">
//                           ${expiryStatus === "current" ? "CUR" : "EXP"}
//                         </span>`;
//                       })()}
//                     </td>
//                     <td style="text-align: center;">
//                       ${hasFile}
//                     </td>
//                   </tr>
//                 `;
//                 }).join("")}
//               </tbody>
//             </table>
//           </div>
//           <div style="font-size: 8px; color: ${bankColors.textLight}; margin-top: 10px; text-align: center;">
//             Showing ${documents.length} documents • Completed: ${completedDocsCount} • Pendingco (excluded): ${stats.pendingFromCo}
//           </div>
//         </div>

//         <!-- Supporting Documents Section -->
//         ${supportingDocs.length > 0 ? `
//           <div class="section-card">
//             <div class="section-title">Supporting Documents (${supportingDocs.length})</div>
//             <div style="margin-top: 10px;">
//               ${supportingDocs.map((doc) => `
//                 <div class="supporting-doc-item">
//                   <div>
//                     <div style="font-weight: 600; font-size: 10px;">${doc.name}</div>
//                     <div style="font-size: 9px; color: ${bankColors.textLight}; margin-top: 2px;">
//                       Uploaded: ${dayjs(doc.uploadedAt).format("DD MMM YYYY, HH:mm")}
//                     </div>
//                   </div>
//                   <span style="font-size: 9px; color: ${bankColors.success}; font-weight: 600;">✓ Uploaded</span>
//                 </div>
//               `).join("")}
//             </div>
//           </div>
//         ` : ""}

//         <!-- Creator Comment -->
//         ${creatorComment ? `
//           <div class="section-card">
//             <div class="section-title">Creator's Remarks</div>
//             <div class="comment-box">
//               <div class="comment-header">
//                 <span class="comment-author">${checklist?.createdBy?.name || "Checklist Creator"}</span>
//                 <span class="comment-date">${dayjs().format("DD MMM YYYY, HH:mm")}</span>
//               </div>
//               <div>${creatorComment}</div>
//             </div>
//           </div>
//         ` : ""}

//         <!-- Comment History -->
//         ${comments && comments.length > 0 ? `
//           <div class="section-card">
//             <div class="section-title">Comment History</div>
//             <div style="margin-top: 8px; max-height: 400px; overflow-y: auto;">
//               ${comments.slice(0, 30).map((comment) => {
//                 const userDisplay = comment.userId?.name || 
//                                    comment.user?.name || 
//                                    comment.createdBy?.name || 
//                                    comment.username || 
//                                    "System User";
                
//                 const roleLower = (comment.role || "").toLowerCase();
//                 let roleColor = "#3b82f6";
//                 let roleText = "";
                
//                 if (roleLower.includes("rm")) {
//                   roleColor = "#8b5cf6";
//                   roleText = "RM";
//                 } else if (roleLower.includes("cocreator") || roleLower.includes("co_creator")) {
//                   roleColor = "#10b981";
//                   roleText = "CREATOR";
//                 } else if (roleLower.includes("cochecker") || roleLower.includes("co_checker")) {
//                   roleColor = "#f59e0b";
//                   roleText = "CHECKER";
//                 } else {
//                   roleText = "USER";
//                 }
                
//                 const commentDate = comment.createdAt || comment.timestamp;
//                 const formattedDate = dayjs(commentDate).format("DD/MM/YY HH:mm");
//                 const commentText = comment.message || comment.content || comment.comment || "";
                
//                 return `
//                   <div style="margin-bottom: 4px; padding: 4px 0; border-bottom: 1px dashed ${bankColors.border}; font-size: 8px;">
//                     <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
//                       <div style="display: flex; align-items: center; gap: 4px;">
//                         <span style="color: ${roleColor}; font-weight: 600; font-size: 7px; text-transform: uppercase;">
//                           ${roleText}
//                         </span>
//                         <span style="font-weight: 600; color: ${bankColors.text}; font-size: 8px;">
//                           ${userDisplay}
//                         </span>
//                       </div>
//                       <span style="color: ${bankColors.textLight}; font-size: 7px;">
//                         ${formattedDate}
//                       </span>
//                     </div>
//                     <div style="
//                       font-size: 8px;
//                       line-height: 1.2;
//                       color: ${bankColors.text};
//                       margin-top: 2px;
//                       padding-left: 4px;
//                     ">
//                       ${commentText}
//                     </div>
//                   </div>
//                 `;
//               }).join("")}
//             </div>
//             ${comments.length > 30 ? `
//               <div style="
//                 text-align: center;
//                 font-size: 7px;
//                 color: ${bankColors.textLight};
//                 padding: 4px;
//                 margin-top: 6px;
//                 border-top: 1px dashed ${bankColors.border};
//               ">
//                 Showing ${Math.min(30, comments.length)} of ${comments.length} comments
//               </div>
//             ` : ''}
//           </div>
//         ` : ""}

//         <!-- Footer -->
//         <div class="footer">
//           <div>
//             <strong>${checklist?.bankName || "NCBA BANK KENYA PLC"}</strong> •
//             Document Checklist Review System •
//             Generated by: ${checklist?.createdBy?.name || "System"} •
//             Page 1 of 1
//           </div>
//           <div class="disclaimer">
//             This is a system-generated document. For official purposes only.
//             Any unauthorized reproduction or distribution is strictly prohibited.
//             Generated on ${dayjs().format("DD MMM YYYY, HH:mm:ss")} •
//             DCL: ${checklist?.dclNo || "N/A"} • IBPS: ${checklist?.ibpsNo || "N/A"}
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     return htmlContent;
//   }, [calculateDocumentStats]);

//   /**
//    * Generate and download PDF
//    */
//   const generatePDF = useCallback(async ({
//     checklist,
//     documents,
//     supportingDocs,
//     creatorComment,
//     comments,
//     onProgress
//   }) => {
//     setIsGenerating(true);
//     setProgress(0);

//     try {
//       const updateProgress = (percent) => {
//         setProgress(percent);
//         onProgress?.(percent);
//       };

//       updateProgress(10);
      
//       // Dynamically import jsPDF and html2canvas
//       const jsPDF = (await import("jspdf")).default;
//       const html2canvas = await import("html2canvas");

//       updateProgress(30);
      
//       // Generate HTML content
//       const htmlContent = generatePDFHtml({
//         checklist,
//         documents,
//         supportingDocs,
//         creatorComment,
//         comments
//       });

//       updateProgress(50);
      
//       // Create temporary container
//       const pdfContainer = document.createElement("div");
//       pdfContainer.style.position = "absolute";
//       pdfContainer.style.left = "-9999px";
//       pdfContainer.style.top = "0";
//       pdfContainer.style.width = "794px";
//       pdfContainer.style.padding = "20px 30px";
//       pdfContainer.style.backgroundColor = "#ffffff";
//       pdfContainer.style.fontFamily = "'Calibri', 'Arial', sans-serif";
//       pdfContainer.style.color = "#333333";
//       pdfContainer.innerHTML = htmlContent;
      
//       document.body.appendChild(pdfContainer);

//       updateProgress(60);
      
//       // Wait for images to load
//       await new Promise(resolve => setTimeout(resolve, 500));

//       updateProgress(70);
      
//       const canvas = await html2canvas.default(pdfContainer, {
//         scale: 2,
//         useCORS: true,
//         logging: false,
//         backgroundColor: "#ffffff",
//         allowTaint: true,
//         width: pdfContainer.offsetWidth,
//         height: pdfContainer.scrollHeight,
//       });

//       updateProgress(85);
      
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF({
//         orientation: "landscape",
//         unit: "mm",
//         format: "a4",
//         compress: true,
//       });

//       const imgWidth = 297;
//       const pageHeight = 210;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;

//       let heightLeft = imgHeight;
//       let position = 0;

//       pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, "", "FAST");
//       heightLeft -= pageHeight;

//       while (heightLeft >= 0) {
//         position = heightLeft - imgHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, "", "FAST");
//         heightLeft -= pageHeight;
//       }

//       const fileName = `DCL_${checklist?.dclNo || "export"}_${dayjs().format("YYYYMMDD_HHmmss")}.pdf`;
//       pdf.save(fileName);

//       updateProgress(95);
      
//       document.body.removeChild(pdfContainer);

//       updateProgress(100);
      
//       message.success("Checklist PDF generated successfully!");
      
//       return { 
//         success: true, 
//         fileName 
//       };
//     } catch (error) {
//       console.error("PDF generation error:", error);
//       message.error("Failed to generate PDF. Please try again.");
      
//       return { 
//         success: false, 
//         error: error.message 
//       };
//     } finally {
//       setIsGenerating(false);
//       setProgress(0);
//     }
//   }, [generatePDFHtml]);

//   return {
//     // State
//     isGenerating,
//     progress,
    
//     // Actions
//     generatePDF,
//     generatePDFHtml,
//   };
// };

// export default usePDFGenerator;



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
    if (roleLower.includes("rm")) {
      return "#8b5cf6"; // purple
    } else if (roleLower.includes("cocreator") || roleLower.includes("co_creator")) {
      return "#10b981"; // green
    } else if (roleLower.includes("cochecker") || roleLower.includes("co_checker")) {
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
    if (roleLower.includes("rm")) {
      return "RM";
    } else if (roleLower.includes("cocreator") || roleLower.includes("co_creator")) {
      return "CREATOR";
    } else if (roleLower.includes("cochecker") || roleLower.includes("co_checker")) {
      return "CHECKER";
    } else if (roleLower.includes("system")) {
      return "SYSTEM";
    }
    return "USER";
  }, []);

  /**
   * Generate HTML content for PDF
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

    const bankColors = {
      primary: PRIMARY_BLUE || "#1a365d",
      secondary: SECONDARY_PURPLE || "#2c5282",
      accent: ACCENT_LIME || "#0f766e",
      success: "#047857",
      warning: "#d97706",
      danger: "#dc2626",
      light: "#f8fafc",
      border: "#e2e8f0",
      text: "#334155",
      textLight: "#64748b",
    };

    const getStatusColor = (status) => {
      const statusLower = (status || "").toLowerCase();
      switch (statusLower) {
        case "submitted":
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

    const truncateText = (text, maxLength) => {
      if (!text) return "";
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 3) + "...";
    };

    // Function to render all comments
    const renderAllComments = (allComments) => {
      if (!allComments || allComments.length === 0) {
        return '<div style="text-align: center; padding: 20px; color: #666; font-size: 10px;">No comments available</div>';
      }

      // Sort comments by date (newest first)
      const sortedComments = [...allComments].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.timestamp || 0);
        const dateB = new Date(b.createdAt || b.timestamp || 0);
        return dateB - dateA;
      });

      return sortedComments.map((comment, index) => {
        const userDisplay = comment.userId?.name || 
                           comment.user?.name || 
                           comment.createdBy?.name || 
                           comment.username || 
                           "System User";
        
        const roleColor = getRoleColor(comment.role);
        const roleText = getRoleText(comment.role);
        
        const commentDate = comment.createdAt || comment.timestamp;
        const formattedDate = dayjs(commentDate).format("DD/MM/YY HH:mm");
        const commentText = comment.message || comment.content || comment.comment || "";
        
        return `
          <div style="
            margin-bottom: 8px;
            padding: 10px;
            border-bottom: 1px solid ${bankColors.border};
            background: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};
            border-radius: 6px;
            font-size: 9px;
          ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="
                  background: ${roleColor}15;
                  color: ${roleColor};
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-weight: 600;
                  font-size: 8px;
                  text-transform: uppercase;
                  border: 1px solid ${roleColor}30;
                ">
                  ${roleText}
                </span>
                <span style="font-weight: 600; color: ${bankColors.text}; font-size: 9px;">
                  ${userDisplay}
                </span>
              </div>
              <span style="color: ${bankColors.textLight}; font-size: 8px;">
                ${formattedDate}
              </span>
            </div>
            <div style="
              font-size: 9px;
              line-height: 1.4;
              color: ${bankColors.text};
              margin-top: 6px;
              padding: 8px;
              background: ${bankColors.light};
              border-radius: 4px;
              border-left: 3px solid ${roleColor};
            ">
              ${commentText.replace(/\n/g, '<br>')}
            </div>
            ${comment.documentName ? `
              <div style="
                font-size: 8px;
                color: ${bankColors.textLight};
                margin-top: 4px;
                padding: 4px 8px;
                background: #f0f0f0;
                border-radius: 3px;
                display: inline-block;
              ">
                📄 ${comment.documentName}
              </div>
            ` : ''}
          </div>
        `;
      }).join("");
    };

    // Create HTML content
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
          
          .document-info {
            flex: 1;
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
          
          /* Comments section styles */
          .comments-section {
            max-height: 600px;
            overflow-y: auto;
            padding-right: 5px;
          }
          
          .comments-section::-webkit-scrollbar {
            width: 6px;
          }
          
          .comments-section::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          
          .comments-section::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
          }
          
          .comments-section::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
          }
          
          .comment-count {
            display: inline-block;
            background: ${bankColors.accent};
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: 600;
            margin-left: 8px;
          }
        </style>
      </head>
      <body>
        <!-- Watermark -->
        <div class="watermark">${checklist?.bankName || "BANK DOCUMENT"}</div>

        <!-- Header with Bank Logo -->
        <div class="pdf-header">
          <div class="bank-logo">
            <div class="logo-circle">${checklist?.bankInitials || "NCBA"}</div>
            <div>
              <div class="bank-name">${checklist?.bankName || "NCBA BANK KENYA PLC"}</div>
              <div class="bank-tagline">GO FOR IT</div>
            </div>
          </div>
         
          <!-- Document Info and Status Section -->
          <div class="header-content">
            <div class="document-info">
              <div class="document-title">Co Checklist Review - Document Checklist</div>
              <div class="document-subtitle">
                <span class="document-badge">
                  <span class="badge-dot" style="background: ${bankColors.primary}"></span>
                  DCL No: <strong>${checklist?.dclNo || "N/A"}</strong>
                </span>
                <span class="document-badge">
                  <span class="badge-dot" style="background: ${bankColors.secondary}"></span>
                  IBPS No: <strong>${checklist?.ibpsNo || "Not provided"}</strong>
                </span>
                <span class="document-badge">
                  <span class="badge-dot" style="background: ${bankColors.accent}"></span>
                  Generated: <strong>${dayjs().format("DD MMM YYYY, HH:mm:ss")}</strong>
                </span>
              </div>
            </div>
            
            <!-- Current Status Display -->
            <div class="current-status-section">
              <div class="status-label">Current Status</div>
              <div class="status-display" style="
                background: ${checklist?.status === "co_creator_review" ? "#d1fae5" : "#fef3c7"};
                color: ${checklist?.status === "co_creator_review" ? "#065f46" : "#92400e"};
                border-color: ${checklist?.status === "co_creator_review" ? "#10b981" : "#f59e0b"};
              ">
                ${checklist?.status?.replace(/_/g, " ").toUpperCase() || "UNKNOWN"}
              </div>
            </div>
          </div>
        </div>

        <!-- Checklist Information -->
        <div class="section-card">
          <div class="section-title">Checklist Information</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">DCL Number</div>
              <div class="info-value">${checklist?.dclNo || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">IBPS Number</div>
              <div class="info-value">${checklist?.ibpsNo || "Not provided"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Loan Type</div>
              <div class="info-value">${checklist?.loanType || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Creation Date</div>
              <div class="info-value">${dayjs(checklist?.createdAt).format("DD MMM YYYY") || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Created By</div>
              <div class="info-value">${checklist?.createdBy?.name || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Relationship Manager</div>
              <div class="info-value">${checklist?.assignedToRM?.name || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Co-Checker</div>
              <div class="info-value">${checklist?.assignedToCoChecker?.name || "Pending Assignment"}</div>
            </div>
          </div>
        </div>

        <!-- Document Summary -->
        <div class="section-card">
          <div class="section-title">Document Summary</div>
         
          <div class="summary-cards">
            <div class="summary-card">
              <div class="summary-label">Total</div>
              <div class="summary-number">${stats.total}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Relevant</div>
              <div class="summary-number" style="color: ${bankColors.success};">
                ${totalRelevantDocs}
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Completed</div>
              <div class="summary-number" style="color: ${bankColors.success};">
                ${completedDocsCount}
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Pending RM</div>
              <div class="summary-number" style="color: ${bankColors.warning};">
                ${stats.pendingFromRM}
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Pending Co</div>
              <div class="summary-number" style="color: #8b5cf6;">
                ${stats.pendingFromCo}
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Deferred</div>
              <div class="summary-number" style="color: ${bankColors.danger};">
                ${stats.deferred}
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Sighted</div>
              <div class="summary-number" style="color: #3b82f6;">
                ${stats.sighted}
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Waived</div>
              <div class="summary-number" style="color: ${bankColors.warning};">
                ${stats.waived}
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-label">TBO</div>
              <div class="summary-number" style="color: #06b6d4;">
                ${stats.tbo}
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Progress</div>
              <div class="summary-number" style="color: ${bankColors.success};">
                ${stats.progressPercent}%
              </div>
            </div>
          </div>
         
          <div class="progress-text">
            <span>Progress (excluding pendingco):</span>
            <span>${stats.progressPercent}% (${completedDocsCount}/${totalRelevantDocs})</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${stats.progressPercent}%"></div>
          </div>
          <div style="font-size: 9px; color: ${bankColors.textLight}; margin-top: 8px;">
            Note: ${stats.pendingFromCo} document(s) with "pendingco" status excluded from progress calculation
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
                  <th width="10%">Action</th>
                  <th width="10%">Status</th>
                  <th width="12%">Checker Status</th>
                  <th width="12%">Co Comment</th>
                  <th width="10%">Expiry Date</th>
                  <th width="10%">Validity</th>
                  <th width="8%">View</th>
                </tr>
              </thead>
              <tbody>
                ${documents.map((doc, index) => {
                  const statusColor = getStatusColor(doc.status);
                  const checkerStatusColor = getStatusColor(doc.checkerStatus || doc.finalCheckerStatus);
                  const statusLabel = doc.status === "deferred" && doc.deferralNo
                    ? `Deferred (${doc.deferralNo})`
                    : (doc.status || "N/A").toUpperCase();

                  const checkerStatusLabel = doc.checkerStatus || doc.finalCheckerStatus
                    ? (doc.checkerStatus || doc.finalCheckerStatus || "N/A").toUpperCase()
                    : "—";

                  const expiryStatus = getExpiryStatus(doc.expiryDate);
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
                      <span style="text-transform: uppercase; font-weight: 600; color: ${bankColors.primary}; font-size: 8px;">
                        ${doc.action || "N/A"}
                      </span>
                    </td>
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
            Showing ${documents.length} documents • Completed: ${completedDocsCount} • Pendingco (excluded): ${stats.pendingFromCo}
          </div>
        </div>

        <!-- Supporting Documents Section -->
        ${supportingDocs.length > 0 ? `
          <div class="section-card">
            <div class="section-title">Supporting Documents (${supportingDocs.length})</div>
            <div style="margin-top: 10px;">
              ${supportingDocs.map((doc) => `
                <div class="supporting-doc-item">
                  <div>
                    <div style="font-weight: 600; font-size: 10px;">${doc.name}</div>
                    <div style="font-size: 9px; color: ${bankColors.textLight}; margin-top: 2px;">
                      Uploaded: ${dayjs(doc.uploadedAt).format("DD MMM YYYY, HH:mm")}
                    </div>
                  </div>
                  <span style="font-size: 9px; color: ${bankColors.success}; font-weight: 600;">✓ Uploaded</span>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}

        <!-- Creator Comment -->
        ${creatorComment ? `
          <div class="section-card">
            <div class="section-title">Creator's Remarks</div>
            <div class="comment-box">
              <div class="comment-header">
                <span class="comment-author">${checklist?.createdBy?.name || "Checklist Creator"}</span>
                <span class="comment-date">${dayjs().format("DD MMM YYYY, HH:mm")}</span>
              </div>
              <div>${creatorComment}</div>
            </div>
          </div>
        ` : ""}

        <!-- Comment History - ALL COMMENTS INCLUDED -->
        <div class="section-card">
          <div class="section-title">
            Comment Trail & History 
            <span class="comment-count">${comments?.length || 0} comments</span>
          </div>
          <div class="comments-section">
            ${comments && comments.length > 0 ? 
              renderAllComments(comments) 
              : `
              <div style="
                text-align: center;
                padding: 30px;
                color: #666;
                font-size: 10px;
                background: ${bankColors.light};
                border-radius: 6px;
                border: 1px dashed ${bankColors.border};
              ">
                <div style="font-size: 24px; margin-bottom: 10px; opacity: 0.5;">💬</div>
                <div>No comments available for this checklist</div>
                <div style="font-size: 9px; margin-top: 5px; color: #999;">
                  Comments will appear here when added by users
                </div>
              </div>
            `}
          </div>
          ${comments && comments.length > 0 ? `
            <div style="
              text-align: center;
              font-size: 8px;
              color: ${bankColors.textLight};
              padding: 8px;
              margin-top: 10px;
              border-top: 1px dashed ${bankColors.border};
              background: ${bankColors.light};
              border-radius: 4px;
            ">
              Showing all ${comments.length} comments • Sorted by date (newest first)
            </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div class="footer">
          <div>
            <strong>${checklist?.bankName || "NCBA BANK KENYA PLC"}</strong> •
            Document Checklist Review System •
            Generated by: ${checklist?.createdBy?.name || "System"} •
            Page 1 of 1
          </div>
          <div class="disclaimer">
            This is a system-generated document. For official purposes only.
            Any unauthorized reproduction or distribution is strictly prohibited.
            Generated on ${dayjs().format("DD MMM YYYY, HH:mm:ss")} •
            DCL: ${checklist?.dclNo || "N/A"} • IBPS: ${checklist?.ibpsNo || "N/A"}
          </div>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  }, [calculateDocumentStats, getRoleColor, getRoleText]);

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
      
      // Dynamically import jsPDF and html2canvas
      const jsPDF = (await import("jspdf")).default;
      const html2canvas = await import("html2canvas");

      updateProgress(30);
      
      // Generate HTML content
      const htmlContent = generatePDFHtml({
        checklist,
        documents,
        supportingDocs,
        creatorComment,
        comments
      });

      updateProgress(50);
      
      // Create temporary container
      const pdfContainer = document.createElement("div");
      pdfContainer.style.position = "absolute";
      pdfContainer.style.left = "-9999px";
      pdfContainer.style.top = "0";
      pdfContainer.style.width = "794px";
      pdfContainer.style.padding = "20px 30px";
      pdfContainer.style.backgroundColor = "#ffffff";
      pdfContainer.style.fontFamily = "'Calibri', 'Arial', sans-serif";
      pdfContainer.style.color = "#333333";
      pdfContainer.innerHTML = htmlContent;
      
      document.body.appendChild(pdfContainer);

      updateProgress(60);
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgress(70);
      
      const canvas = await html2canvas.default(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
        width: pdfContainer.offsetWidth,
        height: pdfContainer.scrollHeight,
      });

      updateProgress(85);
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const imgWidth = 297;
      const pageHeight = 210;
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
    // State
    isGenerating,
    progress,
    
    // Actions
    generatePDF,
    generatePDFHtml,
  };
};

export default usePDFGenerator;