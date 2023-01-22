import React, { useCallback, useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Button, Select, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { parseEther, formatEther } from "@ethersproject/units";
import { Address, AddressInput, Balance, EtherInput, Blockie } from "../components";
import { useContractReader, useEventListener } from "../hooks";
const { Option } = Select;

const axios = require("axios");

export default function CreateTransaction({
  poolServerUrl,
  blockExplorer,
  contractName,
  address,
  setRoute,
  userProvider,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  admin,
  tx,
  nonce,
  readContracts,
  writeContracts,
}) {
  const history = useHistory();

  // keep track of a variable from the contract in the local React state:
  // const nonce = useContractReader(readContracts, contractName, "nonce");
  const calldataInputRef = useRef("0x");

  console.log("🤗 nonce:", nonce);

  console.log("price", price);

  const [customNonce, setCustomNonce] = useState();
  const [to, setTo] = useLocalStorage("to");
  const [amount, setAmount] = useLocalStorage("amount", "0");
  const [sigs, setSigs] = useLocalStorage("signatures", "1")
  const [data, setData] = useLocalStorage("data", "0x");
  const [isCreateTxnEnabled, setCreateTxnEnabled] = useState(true);
  const [decodedDataState, setDecodedData] = useState();
  const [methodName, setMethodName] = useState();
  const [selectDisabled, setSelectDisabled] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  let decodedData = "";
  let decodedDataObject = "";

  // these are the methodNames for the function calls that only the Admin can create!
  const adminPrivs = [
    "addSigner",
    "addWriter",
    "removeSigner",
    "removeWriter",
    "openStream"
  ];

  const errorAdmin = "ERROR: NOT ADMIN";
  const errorWriter = "ERROR: NOT WRITER";

  function resetError() {
    setTimeout(() => {
      setError("");
    }, 2000)
  };

  const inputStyle = {
    padding: 10,
  };

  useEffect(() => {
    const inputTimer = setTimeout(async () => {
      console.log("EFFECT RUNNING");
      try {
        // if (methodName == "updateSignaturesRequired") {
        //   console.log("Send transaction selected")
        //   console.log("🔥🔥🔥🔥🔥🔥", sigs)
        //   const calldata = readContracts[contractName].interface.encodeFunctionData("updateSignaturesRequired", sigs);
        //   setData(calldata);
        // }
        // decodedDataObject = readContracts ? await readContracts[contractName].interface.parseTransaction({ data }) : "";
        // console.log("decodedDataObject", decodedDataObject);
        // setCreateTxnEnabled(true);
        if (data != "0x") {
          decodedDataObject = readContracts ? await readContracts[contractName].interface.parseTransaction({ data }) : "";
          console.log("decodedDataObject", decodedDataObject);
          if (decodedDataObject.signature === "addSigner(address,uint256)") {
            setMethodName("addSigner")
            setSelectDisabled(true)
          } else if (decodedDataObject.signature === "removeSigner(address,uint256)") {
            setMethodName("removeSigner")
            setSelectDisabled(true)
          } else if (decodedDataObject.signature === "addWriter(address,uint256)") {
            setMethodName("addWriter")
            setSelectDisabled(true)
          } else if (decodedDataObject.signature === "removeWriter(address,uint256)") {
            setMethodName("removeWriter")
            setSelectDisabled(true)
          } else if (decodedDataObject.signature === "openStream(address,uint256,uint256)") {
            setMethodName("openStream")
            setSelectDisabled(true)
          } else if (decodedDataObject.signature === "closeStream(address)") {
            setMethodName("closeStream")
            setSelectDisabled(true)
          }
          // } else if (decodedDataObject.signature === "updateSignaturesRequired(uint256)") {
          //   setMethodName("updateSignaturesRequired")
          //   setSelectDisabled(true)
          // }
        }
        decodedData = (
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "left",
                marginTop: 16,
                marginBottom: 16,
              }}
            >
              {decodedDataObject && decodedDataObject.signature && <b>Function Signature : </b>}
              {decodedDataObject.signature}
            </div>
            {decodedDataObject.functionFragment &&
              decodedDataObject.functionFragment.inputs.map((element, index) => {
                if (element.type === "address") {
                  return (
                    <div
                      style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "left" }}
                    >
                      <b>{element.name} :&nbsp;</b>
                      <Address fontSize={16} address={decodedDataObject.args[index]} ensProvider={mainnetProvider} />
                    </div>
                  );
                }
                if (element.type === "uint256") {
                  return (
                    <p style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "left" }}>
                      {element.name === "value" ? <><b>{element.name} : </b> <Balance fontSize={16} balance={decodedDataObject.args[index]} dollarMultiplier={price} /> </> : <><b>{element.name} : </b> {decodedDataObject.args[index] && decodedDataObject.args[index].toNumber()}</>}
                    </p>
                  );
                }
              })}
          </div>
        );
        setDecodedData(decodedData);
        setCreateTxnEnabled(true);
        setResult();


      } catch (_error) {

        console.log("mistake: ", _error);
        if (data !== "0x") setError("ERROR: Invalid calldata");
        setCreateTxnEnabled(false);
      }

    }, 500);
    return () => {
      clearTimeout(inputTimer);
    };
  }, [data, decodedData, amount]);

  let resultDisplay;
  if (result) {
    resultDisplay = (
      <div style={{ margin: 16, padding: 8 }}>
        <Blockie size={4} scale={8} address={result} /> Tx {result.substr(0, 6)} Created!
        <div style={{ margin: 8, padding: 4 }}>
          <Spin />
        </div>
      </div>
    );
  }


  return (
    <div>
      <h2 style={{ marginTop: 32 }}>Administrator:  {admin ? <Address
        address={admin}
        ensProvider={mainnetProvider}
        blockExplorer={blockExplorer}
        fontSize={32}
      /> : <Spin></Spin>}</h2>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 32 }}>
        <div style={{ margin: 8 }}>
          <div style={inputStyle}>
            <Input
              prefix="#"
              disabled
              value={customNonce}
              placeholder={"" + (nonce ? nonce.toNumber() : "loading...")}
              onChange={setCustomNonce}
            />
          </div>
          <div style={{ margin: 8, padding: 8 }}>
            <Select value={methodName} disabled={selectDisabled} style={{ width: "100%" }} onChange={setMethodName}>
              <Option key="transferFunds">transferFunds()</Option>
              {/* <Option disabled={true} key="updateSignaturesRequired">updateSignaturesRequired()</Option> */}
              <Option disabled={true} key="addSigner">addSigner()</Option>
              <Option disabled={true} key="removeSigner">removeSigner()</Option>
              <Option disabled={true} key="addWriter">addWriter()</Option>
              <Option disabled={true} key="removeWriter">removeWriter()</Option>
              <Option disabled={true} key="openStream">openStream()</Option>
              <Option disabled={true} key="closeStream">closeStream()</Option>
            </Select>
          </div>
          <div style={inputStyle}>
            <AddressInput
              autoFocus
              ensProvider={mainnetProvider}
              placeholder="to address"
              value={to}
              onChange={setTo}
            />
          </div>

          {!selectDisabled && <div style={inputStyle}>
            <EtherInput price={price} mode="USD" value={amount} onChange={setAmount} />
          </div>}
          <div style={inputStyle}>
            <Input
              disabled
              placeholder="calldata"
              value={data}
              onChange={e => {
                setData(e.target.value);
              }}
              ref={calldataInputRef}
            />
            {decodedDataState}
          </div>

          <div style={{ color: "red" }}>{error}</div>

          <Button
            style={{ marginTop: 32 }}
            disabled={!isCreateTxnEnabled}
            onClick={async () => {
              // setData(calldataInputRef.current.state.value)
              // if (data && data == "0x") {
              //   setResult("ERROR, Call Data Invalid");
              //   return;
              // }
              console.log("customNonce", customNonce);
              const nonce = customNonce || (await readContracts[contractName].nonce());
              console.log("nonce", nonce);

              const newHash = await readContracts[contractName].getTransactionHash(
                nonce,
                to,
                parseEther("" + parseFloat(amount).toFixed(12)),
                data,
              );

              console.log("newHash", newHash);

              const signature = await userProvider.send("personal_sign", [newHash, address]);
              console.log("signature", signature);

              const recover = await readContracts[contractName].recover(newHash, signature);
              console.log("recover", recover);

              const isWriter = await readContracts[contractName].isWriter(recover);
              console.log("isWriter", isWriter);

              if (isWriter) {
                if (adminPrivs.includes(methodName) && recover == admin) {
                  const res = await axios.post(poolServerUrl, {
                    chainId: localProvider._network.chainId,
                    address: readContracts[contractName].address,
                    nonce: nonce.toNumber(),
                    to,
                    amount,
                    data,
                    hash: newHash,
                    signatures: [signature],
                    signers: [recover],
                  });
                  // IF SIG IS VALUE ETC END TO SERVER AND SERVER VERIFIES SIG IS RIGHT AND IS SIGNER BEFORE ADDING TY

                  console.log("RESULT", res.data);

                  setTimeout(() => {
                    history.push("/pool");
                  }, 2777);

                  setResult(res.data.hash);
                  setTo();
                  setAmount("0");
                  setData("0x");
                }
                else if (adminPrivs.includes(methodName)) {
                  setError(errorAdmin);
                  console.log(errorAdmin);
                  resetError();
                }
                else {
                  const res = await axios.post(poolServerUrl, {
                    chainId: localProvider._network.chainId,
                    address: readContracts[contractName].address,
                    nonce: nonce.toNumber(),
                    to,
                    amount,
                    data,
                    hash: newHash,
                    signatures: [signature],
                    signers: [recover],
                  });
                  // IF SIG IS VALUE ETC END TO SERVER AND SERVER VERIFIES SIG IS RIGHT AND IS SIGNER BEFORE ADDING TY

                  console.log("RESULT", res.data);

                  setTimeout(() => {
                    history.push("/pool");
                  }, 2777);

                  setResult(res.data.hash);
                  setTo();
                  setAmount("0");
                  setData("0x");
                }
              }
              else {
                setError(errorWriter);
                console.log(errorWriter);
                resetError();
              }
            }}
          >
            Create
          </Button>
        </div>
        <div>
          {resultDisplay}
        </div>
      </div>
    </div >
  );
}

function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = value => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
