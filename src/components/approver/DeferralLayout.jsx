
// File: src/components/deferrals/DeferralLayout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  FileText,
  ListChecks,
} from "lucide-react";
import { getSidebarWidth } from "../../utils/sidebarUtils";

// Import your deferral components
import DeferralForm from "../../pages/deferrals/DeferralForm";
import DeferralPending from "../../pages/deferrals/DeferralPending";
import Navbar from "../Navbar";

const DeferralLayout = ({ userId }) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("form"); // "form" or "pending"
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 375);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 375;
      const tablet = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarCollapsed(tablet);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const renderContent = () => {
    switch (activeView) {
      case "form":
        return <DeferralForm userId={userId} />;
      case "pending":
        return <DeferralPending userId={userId} />;
      default:
        return <DeferralForm userId={userId} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Overlay for mobile sidebar */}
      {isMobile && !sidebarCollapsed && (
        <div
          onClick={() => setSidebarCollapsed(true)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 99,
          }}
        />
      )}

      {/* Deferral Sidebar */}
      <div
        style={{
          width: getSidebarWidth(sidebarCollapsed),
          background: "linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)",
          color: "white",
          transition: "0.25s ease",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          position: isMobile ? "fixed" : "relative",
          zIndex: isMobile ? 100 : "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: sidebarCollapsed ? "20px 0" : "25px 20px",
            textAlign: sidebarCollapsed ? "center" : "left",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {sidebarCollapsed ? (
            <div style={{ fontSize: 20, fontWeight: "bold" }}>D</div>
          ) : (
            <>
              <div style={{ fontSize: 24, fontWeight: "bold", display: "flex", alignItems: "center", gap: 10 }}>
                <span>Deferrals</span>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div style={{ padding: "20px 0", flex: 1 }}>
          {/* Back to RM Dashboard */}
          <div
            onClick={() => {
              navigate("/rm");
              if (isMobile) setSidebarCollapsed(true);
            }}
            style={{
              padding: sidebarCollapsed ? "12px 0" : "12px 20px",
              margin: sidebarCollapsed ? "12px 8px" : "12px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.1)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              gap: 12,
              transition: "0.2s",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            <ChevronLeft size={16} />
            {!sidebarCollapsed && <span>Back to Dashboard</span>}
          </div>

          {/* Request Deferral */}
          <div
            onClick={() => {
              setActiveView("form");
              if (isMobile) setSidebarCollapsed(true);
            }}
            style={{
              padding: sidebarCollapsed ? "16px 0" : "16px 20px",
              margin: sidebarCollapsed ? "8px 8px" : "8px 12px",
              borderRadius: 8,
              background: activeView === "form" ? "rgba(255,255,255,0.2)" : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              gap: 12,
              transition: "0.2s",
              fontSize: "14px",
              borderLeft: activeView === "form" ? "4px solid #fff" : "4px solid transparent",
            }}
            onMouseEnter={(e) => {
              if (activeView !== "form") {
                e.target.style.background = "rgba(255,255,255,0.08)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeView !== "form") {
                e.target.style.background = "transparent";
              }
            }}
          >
            <FileText size={18} />
            {!sidebarCollapsed && <span>Request Deferral</span>}
          </div>

          {/* Pending Deferrals */}
          <div
            onClick={() => {
              setActiveView("pending");
              if (isMobile) setSidebarCollapsed(true);
            }}
            style={{
              padding: sidebarCollapsed ? "16px 0" : "16px 20px",
              margin: sidebarCollapsed ? "8px 8px" : "8px 12px",
              borderRadius: 8,
              background: activeView === "pending" ? "rgba(255,255,255,0.2)" : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              gap: 12,
              transition: "0.2s",
              fontSize: "14px",
              borderLeft: activeView === "pending" ? "4px solid #fff" : "4px solid transparent",
            }}
            onMouseEnter={(e) => {
              if (activeView !== "pending") {
                e.target.style.background = "rgba(255,255,255,0.08)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeView !== "pending") {
                e.target.style.background = "transparent";
              }
            }}
          >
            <ListChecks size={18} />
            {!sidebarCollapsed && <span>Pending Deferrals</span>}
          </div>
        </div>

        {/* Collapse Button */}
        <div style={{ padding: 20, textAlign: "center" }}>
          <button
            onClick={toggleSidebar}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 8,
              border: "none",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontWeight: 500,
              cursor: "pointer",
              transition: "0.2s",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            {sidebarCollapsed ? "Expand" : "Collapse"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        background: "#f0f2f5",
        marginLeft: isMobile ? 0 : getSidebarWidth(sidebarCollapsed),
        width: isMobile ? "100%" : `calc(100% - ${getSidebarWidth(sidebarCollapsed)}px)`,
        maxWidth: "100vw",
        transition: "all 0.2s cubic-bezier(0.2, 0, 0, 1) 0s",
        boxSizing: "border-box",
      }}>
        <Navbar 
          toggleSidebar={toggleSidebar}
          additionalButtons={
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setActiveView("form")}
                style={{
                  padding: "8px 16px",
                  background: activeView === "form" ? "#1e40af" : "transparent",
                  color: activeView === "form" ? "white" : "#1e40af",
                  border: "1px solid #1e40af",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "0.2s",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  if (activeView !== "form") {
                    e.target.style.background = "#1e40af";
                    e.target.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== "form") {
                    e.target.style.background = "transparent";
                    e.target.style.color = "#1e40af";
                  }
                }}
              >
                Request Deferral
              </button>
              <button
                onClick={() => setActiveView("pending")}
                style={{
                  padding: "8px 16px",
                  background: activeView === "pending" ? "#1e40af" : "transparent",
                  color: activeView === "pending" ? "white" : "#1e40af",
                  border: "1px solid #1e40af",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "0.2s",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  if (activeView !== "pending") {
                    e.target.style.background = "#1e40af";
                    e.target.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== "pending") {
                    e.target.style.background = "transparent";
                    e.target.style.color = "#1e40af";
                  }
                }}
              >
                Pending Deferrals
              </button>
            </div>
          }
        />
        <div style={{ flex: 1, overflowY: "auto", overflowX: isMobile ? "auto" : "hidden", padding: isMobile ? "8px 2px" : "20px", margin: 0, width: "100%", background: "#f0f2f5", boxSizing: "border-box" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DeferralLayout;