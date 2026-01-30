import React from "react";
import { Progress } from "antd";
import { ACCENT_LIME, PRIMARY_BLUE } from "../../../utils/colors";
// import { PRIMARY_BLUE, ACCENT_LIME } from "../constants/colors";

const ProgressSummary = ({ documentStats }) => {
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

  return (
    <div
      style={{
        padding: "16px",
        background: "#f7f9fc",
        borderRadius: 8,
        border: "1px solid #e0e0e0",
        marginBottom: 18,
      }}
    >
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
        <div style={{ fontWeight: "700", color: "#f59e0b" }}>
          Pending RM: {pendingFromRM}
        </div>
        <div style={{ fontWeight: "700", color: "#8b5cf6" }}>
          Pending CO: {pendingFromCo}
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
  );
};

export default ProgressSummary;