// src/components/completedChecklistModal/components/CommentHistorySection.jsx
import React from "react";
import CommentHistory from "../../common/CommentHistory";
// import CommentHistory from "../../../common/CommentHistory";

const CommentHistorySection = ({ comments, commentsLoading }) => (
  <div style={{ marginTop: 24 }}>
    <h4>Comment Trail & History</h4>
    <CommentHistory comments={comments} isLoading={commentsLoading} />
  </div>
);

export default CommentHistorySection;