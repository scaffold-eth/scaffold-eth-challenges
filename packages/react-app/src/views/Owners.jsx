import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Select, Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, AddressInput, Balance, Blockie } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { useContractReader, useEventListener, useLocalStorage } from "../hooks";
import { assertAbstractType } from "graphql";
const axios = require('axios');
const { Option } = Select;

export default function Owners({ contractName, ownerEvents, writerEvents, signaturesRequired, address, nonce, userProvider, mainnetProvider, localProvider, yourLocalBalance, price, admin, tx, readContracts, writeContracts, blockExplorer }) {

  const history = useHistory();

  const [to, setTo] = useLocalStorage("to");
  const [amount, setAmount] = useLocalStorage("amount", "0");
  const [methodName, setMethodName] = useLocalStorage("addSigner");
  const [newOwner, setNewOwner] = useLocalStorage("newOwner");
  const [newSignaturesRequired, setNewSignaturesRequired] = useLocalStorage("newSignaturesRequired");
  const [data, setData] = useLocalStorage("data", "0x");
  const [results, setResult] = useState("");
  const SIGNERDISPLAY = "Signers can only sign existing transactions."
  const WRITERDISPLAY = "Writers can propose new transactions and sign existing ones."
  const MEMBERDISPLAY = "Only ADMIN can add or remove Owners."

  const writers = [];
  console.log(writerEvents);
  for (let i = writerEvents.length - 1; i >= 0; i--) {
    console.log("Writer Event", i, writerEvents[i]);
    if (writerEvents[i][1]) {
      writers.push(writerEvents[i][0]);
    }
    else {
      let idx = writers.indexOf(writerEvents[i][0]);
      if (idx >= 0) {
        writers.splice(idx, 1);
      }
    }
  }
  console.log(writers);

  const owners = [];
  console.log(ownerEvents);
  for (let i = ownerEvents.length - 1; i >= 0; i--) {
    console.log("Owner Event", i, ownerEvents[i]);
    if (ownerEvents[i][1]) {
      owners.push(ownerEvents[i][0]);
    }
    else {
      let idx = owners.indexOf(ownerEvents[i][0]);
      if (idx >= 0) {
        owners.splice(idx, 1);
      }
    }
  }
  console.log(owners);



  return (
    <div>
      <h2 style={{ marginTop: 16 }}>Signatures Required: {signaturesRequired ? signaturesRequired.toNumber() : <Spin></Spin>}</h2>
      <h2 style={{ marginTop: 16 }}>Admin:  {admin ? <Address
        address={admin}
        ensProvider={mainnetProvider}
        blockExplorer={blockExplorer}
        fontSize={32}
      /> : <Spin></Spin>}</h2>
      <List
        style={{ maxWidth: 400, margin: "auto", marginTop: 16 }}
        bordered
        dataSource={owners}
        renderItem={(item) => {
          let writer = false;
          for (let i = 0; i < writers.length; i++) {
            if (item == writers[i]) {
              writer = true;
            }
          }
          return (
            <List.Item key={"owner_" + item}>
              <Address
                address={item}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                fontSize={32}
              />
              <div style={{ padding: 18 }}>
                {item ? "Signer✍️" : "Signer👎"}
              </div>
              <div style={{ padding: 18 }}>
                {writer ? "Writer📝" : "Writer👎"}
              </div>
            </List.Item>
          )
        }}
      />

      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 16, marginBottom: 32 }}>
        <div style={{ margin: 8, padding: 8 }}>
          <Select value={methodName} style={{ width: "100%" }} onChange={setMethodName}>
            {/* <Option key="updateSignaturesRequired">updateSignaturesRequired()</Option> */}
            <Option key="addSigner">addSigner()</Option>
            <Option key="removeSigner">removeSigner()</Option>
            <Option key="addWriter">addWriter()</Option>
            <Option key="removeWriter">removeWriter()</Option>
          </Select>
        </div>
        <div style={{ margin: 8, padding: 8 }}>
          <AddressInput
            autoFocus
            ensProvider={mainnetProvider}
            placeholder="new owner address"
            value={newOwner}
            onChange={setNewOwner}
          />
        </div>
        <div style={{ margin: 8, padding: 8 }}>
          <Input
            ensProvider={mainnetProvider}
            placeholder="new # of signatures required"
            value={newSignaturesRequired}
            onChange={(e) => { setNewSignaturesRequired(e.target.value) }}
          />
        </div>
        <div style={{ margin: 8, padding: 8 }}>
          <Button onClick={async () => {
            console.log("METHOD", methodName)
            let calldata = readContracts[contractName].interface.encodeFunctionData(methodName, [newOwner, newSignaturesRequired])
            console.log("calldata", calldata)
            setData(calldata)
            setAmount("0")
            setTo(readContracts[contractName].address)
            setTimeout(() => {
              history.push('/create')
            }, 777)

          }}>
            Create Tx
          </Button>
        </div>
      </div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto" }}>
        <h3>
          {SIGNERDISPLAY}
        </h3>
        <h3>
          {WRITERDISPLAY}
        </h3>
        <h3>
          {MEMBERDISPLAY}
        </h3>
      </div>
    </div>
  );
}
