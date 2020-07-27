import React, { memo } from "react";

import { Box } from "./DragButton";

export const DragItems: React.FC = memo(function Container() {
  return (
    <div>
      <div style={{ overflow: "hidden", clear: "both" }}>
        <Box name="单选框" />
        <Box name="填空" />
        <Box name="多选框" />
      </div>
    </div>
  );
});
