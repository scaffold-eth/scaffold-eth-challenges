import React, { useState } from "react";
import { Button, List } from "antd";

import { Address, Balance, Blockie, TransactionDetailsModal } from "../components";
import { EllipsisOutlined } from "@ant-design/icons";
import { parseEther, formatEther } from "@ethersproject/units";

const TransactionListItem = function ({item, mainnetProvider, blockExplorer, price, readContracts, contractName, children}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [txnInfo, setTxnInfo] = useState(null);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };


  console.log("🔥🔥🔥🔥", item)
  let txnData;
  try {
    txnData = readContracts[contractName].interface.parseTransaction(item);
  } catch (error){
    console.log("ERROR", error)
  }
  return <>
    <TransactionDetailsModal
      visible={isModalVisible}
      txnInfo={txnData}
      handleOk={handleOk}
      mainnetProvider={mainnetProvider}
      price={price}
    />
    {txnData && <List.Item key={item.hash} style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 55,
          fontSize: 12,
          opacity: 0.5,
          display: "flex",
          flexDirection: "row",
          width: "90%",
          justifyContent: "space-between",
        }}
      >
        <p>
          <b>Event Name :&nbsp;</b>
          {txnData.functionFragment.name}&nbsp;
        </p>
        <p>
          <b>Addressed to :&nbsp;</b>
          {txnData.args[0]}
        </p>
      </div>
      {<b style={{ padding: 16 }}>#{typeof(item.nonce)=== "number" ? item.nonce : item.nonce.toNumber()}</b>}
      <span>
        <Blockie size={4} scale={8} address={item.hash} /> {item.hash.substr(0, 6)}
      </span>
      <Address address={item.to} ensProvider={mainnetProvider} blockExplorer={blockExplorer} fontSize={16} />
      <Balance balance={item.value ? item.value : parseEther("" + parseFloat(item.amount).toFixed(12))} dollarMultiplier={price} />
      <>
        {
          children
        }
      </>
      <Button
        onClick={showModal}
      >
        <EllipsisOutlined />
      </Button>
      
    </List.Item>}
    </>
};
export default TransactionListItem;