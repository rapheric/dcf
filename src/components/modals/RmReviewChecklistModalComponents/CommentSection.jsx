import React from "react";
import { Input } from "antd";
import { PRIMARY_BLUE } from "../../../utils/colors";
// import { PRIMARY_BLUE } from "../constants/colors";

const CommentSection = ({
  checklist,
  rmGeneralComment,
  setRmGeneralComment,
  isActionAllowed,
}) => {
  return (
    <>
      <h3 style={{ marginTop: 24, color: PRIMARY_BLUE, fontWeight: "bold" }}>
        RM General Comment
      </h3>
      <Input.TextArea
        rows={3}
        value={rmGeneralComment}
        onChange={(e) => setRmGeneralComment(e.target.value)}
        placeholder="Enter RM general remarks..."
        style={{ borderRadius: 8, marginTop: 8 }}
        disabled={!isActionAllowed}
      />
    </>
  );
};

export default CommentSection;