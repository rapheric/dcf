import React from "react";
import {
  MenuOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Dropdown, message } from "antd";
import { useDispatch } from "react-redux";
import { logout } from "../api/authSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    message.success("Logged out successfully");
    navigate("/login");
  };

  const menuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Responsive values
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 375;
  const navPadding = isMobile ? '0 8px' : '0 24px';

  return (
    <div
      style={{
        height: isMobile ? 56 : 60,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: navPadding,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        borderBottom: "1px solid #f0f0f0",
        zIndex: 1000,
        flexShrink: 0,
      }}
    >
      <div onClick={toggleSidebar} style={{ cursor: "pointer" }}>
        <MenuOutlined style={{ fontSize: isMobile ? 20 : 24 }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 20 }}>
        <BellOutlined style={{ fontSize: isMobile ? 18 : 20, cursor: "pointer" }} />

        <Dropdown
          menu={{ items: menuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <UserOutlined style={{ fontSize: isMobile ? 16 : 18 }} />
            {!isMobile && <span style={{ fontWeight: 500 }}>{user?.name || "User"}</span>}
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default Navbar;
