import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { ListChecks, Inbox, Clock, BarChart2, User } from "lucide-react";
import { getSidebarWidth } from "../../utils/sidebarUtils";

// Import available Approver page components
import MyQueue from "../../pages/approver/MyQueue";
import Actioned from "../../pages/approver/Actioned";
import Reports from "../../pages/approver/Reports";
import Navbar from "../Navbar";

const Sidebar = ({
  selectedKey,
  setSelectedKey,
  collapsed,
  toggleCollapse,
  navigate,
  isMobile,
  setSidebarCollapsed,
}) => {
  const location = useLocation();

  const handleClick = (e) => {
    console.log("Menu clicked:", e.key);
    setSelectedKey(e.key);
    navigate(`/approver/${e.key}`);
    // Close sidebar on mobile when menu item is clicked
    if (isMobile) setSidebarCollapsed(true);
  };

  // Determine selected key from path
  const getSelectedKeyFromPath = () => {
    const path = location.pathname;
    if (path.includes("/approver/queue")) return "queue";
    if (path.includes("/approver/actioned")) return "actioned";
    if (path.includes("/approver/reports")) return "reports";
    return "queue";
  };

  return (
    <div
      style={{
        width: getSidebarWidth(collapsed),
        background: "#3A2A82",
        color: "white",
        transition: "0.25s ease",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 10px rgba(0,0,0,0.15)",
        height: "100vh",
      }}
    >
      <div
        style={{
          padding: collapsed ? "20px 0" : "25px 20px",
          fontSize: collapsed ? 28 : 24,
          fontWeight: "bold",
          letterSpacing: collapsed ? 2 : 1,
          textAlign: collapsed ? "center" : "left",
        }}
      >
        {collapsed ? "AP" : "Approver Dashboard"}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKeyFromPath()]}
        onClick={handleClick}
        style={{ background: "transparent", borderRight: "none", fontSize: 15 }}
        inlineCollapsed={collapsed}
        items={[
          {
            key: "queue",
            label: "My Queue",
            icon: <Inbox size={16} style={{ color: "#e5e7eb" }} />,
          },
          {
            key: "actioned",
            label: "Actioned",
            icon: <Clock size={16} style={{ color: "#e5e7eb" }} />,
          },
          {
            key: "reports",
            label: "Reports",
            icon: <BarChart2 size={16} style={{ color: "#e5e7eb" }} />,
          },
        ]}
      />

      <div style={{ marginTop: "auto", padding: 20, textAlign: "center" }}>
        <button
          onClick={toggleCollapse}
          style={{
            width: "100%",
            padding: "8px 0",
            borderRadius: 6,
            border: "none",
            background: "#fff",
            color: "#3A2A82",
            fontWeight: 600,
            cursor: "pointer",
            transition: "0.2s",
          }}
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </div>
    </div>
  );
};

const ApproverLayout = ({ userId }) => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState("queue");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);
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

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        background: "#f0f2f5",
        boxSizing: "border-box",
      }}
    >
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

      <div style={{ position: "fixed", top: 0, left: 0, zIndex: 1000 }}>
        <Sidebar
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          collapsed={sidebarCollapsed}
          toggleCollapse={toggleSidebar}
          navigate={navigate}
          isMobile={isMobile}
          setSidebarCollapsed={setSidebarCollapsed}
        />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: isMobile ? 0 : getSidebarWidth(sidebarCollapsed),
          width: isMobile ? "100%" : `calc(100% - ${getSidebarWidth(sidebarCollapsed)}px)`,
          maxWidth: "100vw",
          height: "100vh",
          overflow: "hidden",
          transition: "all 0.2s cubic-bezier(0.2, 0, 0, 1) 0s",
          boxSizing: "border-box",
        }}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <div
          style={{
            padding: isMobile ? "8px 2px" : "24px",
            margin: 0,
            width: "100%",
            flex: 1,
            overflowY: "auto",
            overflowX: isMobile ? "auto" : "hidden",
            background: "#f0f2f5",
            boxSizing: "border-box",
          }}
        >
          <Routes>
            <Route
              path="/"
              element={<MyQueue userId={userId || "approver_current"} />}
            />
            <Route
              path="/queue"
              element={<MyQueue userId={userId || "approver_current"} />}
            />
            <Route
              path="/queue/*"
              element={<MyQueue userId={userId || "approver_current"} />}
            />
            <Route
              path="/actioned"
              element={<Actioned userId={userId || "approver_current"} />}
            />
            <Route
              path="/reports"
              element={<Reports userId={userId || "approver_current"} />}
            />
            <Route
              path="*"
              element={<MyQueue userId={userId || "approver_current"} />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ApproverLayout;
