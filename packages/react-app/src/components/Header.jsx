import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/austintgriffith/scaffold-eth/tree/meta-multi-sig" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🏗 scaffold-eth"
        subTitle="meta-multi-sig example"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
