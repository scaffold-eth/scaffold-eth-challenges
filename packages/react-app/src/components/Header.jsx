import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/scaffold-eth/scaffold-eth-challenges" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🏗 scaffold-eth"
        subTitle="forkable Ethereum dev stack challenges"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
