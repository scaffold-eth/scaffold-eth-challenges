import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { notification, InputNumber, Select, Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, AddressInput, Balance, Blockie, EtherInput } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { useContractReader, useEventListener, useLocalStorage, useBalance } from "../hooks";
import { useBlockNumber } from "eth-hooks";
const axios = require('axios');
const { Option } = Select;

const DEBUG = false

export default function Streams({withdrawStreamEvents, openStreamEvents, contractName, signaturesRequired, address, nonce, userProvider, mainnetProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts, blockExplorer }) {

  const walletBalance = useBalance(localProvider, readContracts?readContracts[contractName].address:readContracts);
  if(DEBUG) console.log("💵 walletBalance",walletBalance?formatEther(walletBalance):"...")

  const blockNumber = useBlockNumber(localProvider,1777);
  if(DEBUG) console.log("# blockNumber:",blockNumber)

  const [streams, setStreams] = useState()
  const [streamInfo, setStreamInfo] = useState()
  const [streamReason, setStreamReason] = useState()
  const [streamReasonUp, setStreamReasonUp] = useState()
  const [customStreamAmount, setCustomStreamAmount] = useState();

  useEffect(()=>{
      let getStreams = async ()=>{
        let newStreams = []
        let newStreamInfo = {}

        for(let s in openStreamEvents){
          if(openStreamEvents[s].to && newStreams.indexOf(openStreamEvents[s].to)<0){
            newStreams.push(openStreamEvents[s].to)
            //console.log("GETTING STREAM BALANCE OF ",openStreamEvents[s].to,"from",readContracts)
            try{
              let update = {}
              update.stream = await readContracts[contractName].streams(openStreamEvents[s].to)
              if(update.stream && update.stream.amount.gt(0)){
                update.balance = await readContracts[contractName].streamBalance(openStreamEvents[s].to)
              }
              newStreamInfo[openStreamEvents[s].to] = update
            }catch(e){
              console.log(e)
            }

          }
        }
        setStreams(newStreams)
        setStreamInfo(newStreamInfo)
      }
      if(readContracts && readContracts[contractName]){
        getStreams()
      }
    },[ openStreamEvents, blockNumber ]
  )

  const history = useHistory();

  const [to, setTo] = useLocalStorage("to");
  const [amount, setAmount] = useLocalStorage("amount","0");
  const [methodName, setMethodName] = useLocalStorage("openStream");
  const [streamToAddress, setStreamToAddress] = useLocalStorage("streamToAddress");
  const [streamAmount, setStreamAmount] = useLocalStorage("streamAmount");
  const [streamFrequency, setStreamFrequency] = useLocalStorage("streamFrequency");
  const [data, setData] = useLocalStorage("data","0x");

  let streamDetailForm = ""
  let displayedStream = {}

  let extraDisplay = ""

  if(streamFrequency&&streamFrequency>0){
    if(streamFrequency>86400){
      extraDisplay = "("+(streamFrequency/86400).toFixed(2)+" days)"
    }else if(streamFrequency>3600){
      extraDisplay = "("+(streamFrequency/3600).toFixed(2)+" hours)"
    }else if(streamFrequency>60){
      extraDisplay = "("+(streamFrequency/60).toFixed(2)+" minutes)"
    }
  }

  if(methodName=="openStream"){
    streamDetailForm = (
      <div>
        <div style={{margin:8,padding:8}}>
          <EtherInput
            price={price}
            placeholder="amount"
            value={streamAmount}
            onChange={setStreamAmount}
          />
        </div>
        <div style={{margin:8,padding:8}}>
          every <InputNumber
            style={{width:180}}
            placeholder="frequency"
            value={streamFrequency}
            onChange={setStreamFrequency}
          /> seconds <div style={{opacity:0.5,padding:4}}>{extraDisplay}</div>
        </div>
      </div>
    )
  }

  let withdrawalDisplay = ""
  let index=0
  if(withdrawStreamEvents){
    withdrawalDisplay = (
      <div style={{border:"1px solid #cccccc",padding:16, width:550, margin:"auto",marginTop:64}}>
        <b>Withdrawals:</b>
        <List
          title={"Withdrawals"}
          dataSource={withdrawStreamEvents}
          renderItem={(item) => {
            return (
              <List.Item key={"withdrawal_"+index++}>
              <div>
                <Address
                  address={item.to}
                  ensProvider={mainnetProvider}
                  fontSize={16}
                />
                <Balance
                  balance={item.amount}
                  dollarMultiplier={price}
                />
              </div>
              {item.reason}
              </List.Item>
            )
          }}
        />
      </div>
    )
  }


  return (
    <div>
      <List
        style={{maxWidth:550,margin:"auto",marginTop:32}}
        bordered
        dataSource={streams}
        renderItem={(item) => {
          if(!streamInfo) return "..."

          let withdrawButtonOrBalance = ""

          let prettyBalanceDisplay = "$" + (parseFloat(formatEther(streamInfo[item]&&streamInfo[item].balance?streamInfo[item].balance:0)) * price).toFixed(2)
          let currentButtonDisplay = prettyBalanceDisplay

          let addressDisplay = (
            <Address
              address={item}
              ensProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              fontSize={32}
            />
          )

          if(streamInfo[item] && !streamInfo[item].balance){
            withdrawButtonOrBalance = (
              <div style={{opacity:0.5}}>closed</div>
            )
          } else if(address==item){


            if(streamReasonUp){
              addressDisplay = ""
              const formStyle = { padding:8 }

              currentButtonDisplay = "Withdraw"

              withdrawButtonOrBalance = (
                <div>
                  <div style={formStyle}>
                    <Input
                      placeholder="withdrawal reason or link to PR/work"
                      value={streamReason}
                      onChange={(e)=>{
                        setStreamReason(e.target.value)
                      }}
                    />
                  </div>
                  <div style={formStyle}>
                    <Input
                      placeholder={"amount (leave blank for max: "+prettyBalanceDisplay+")"}
                      value={customStreamAmount}
                      onChange={(e)=>{
                        setCustomStreamAmount(e.target.value)
                      }}
                    />
                  </div>
                  <div style={formStyle}>
                  <Button style={{paddingTop:-8}} type={"primary"} onClick={() => {
                    if(!streamReason){
                      notification.info({
                        message: "Error: Provide Reason",
                        description: "Please provide a reason or url to work.",
                        placement: "bottomRight",
                      });
                    }else{

                      let amountToWithdraw = streamInfo[item].balance
                      console.log("amountToWithdraw1",amountToWithdraw)
                      if(customStreamAmount){
                        let cleaned = parseFloat(customStreamAmount.replace("\$","")).toFixed(8)
                        //console.log("cleaned",cleaned)
                        let floatToWithdraw = parseFloat(cleaned/price).toFixed(8)
                        //console.log("floatToWithdraw",floatToWithdraw)
                        amountToWithdraw = parseEther(""+floatToWithdraw)
                        //console.log("amountToWithdraw2",amountToWithdraw)
                      }

                      if(streamInfo[item] && streamInfo[item].balance && streamInfo[item].balance.gt(walletBalance)){
                        notification.info({
                          message: "Warning: Contract Balance",
                          description: "It looks like there isn't enough in the contract to withdraw?",
                          placement: "bottomRight",
                        });
                      }
                      tx( writeContracts[contractName].streamWithdraw(amountToWithdraw, streamReason) )
                      setStreamReason("")
                      setStreamReasonUp(false)
                      setCustomStreamAmount("")
                    }
                  }}>
                    { currentButtonDisplay }
                  </Button></div>
                </div>

              )
            }else{
              withdrawButtonOrBalance = (
                <Button style={{paddingTop:-8}} onClick={()=>{setStreamReasonUp(true)}}>
                  { "$" + (parseFloat(formatEther(streamInfo[item]&&streamInfo[item].balance?streamInfo[item].balance:0)) * price).toFixed(2) }
                </Button>
              )
            }



          }else{
            withdrawButtonOrBalance = (
              <Balance
                balance={streamInfo[item]?streamInfo[item].balance:0}
                dollarMultiplier={price}
              />
            )
          }

          return (
            <List.Item key={"stream_"+item}>
              {addressDisplay}
              {withdrawButtonOrBalance}
            </List.Item>
          )

        }}
      />

      {withdrawalDisplay}

      <div style={{border:"1px solid #cccccc", padding:16, width:400, margin:"auto",marginTop:64}}>
        <div style={{margin:8,padding:8}}>
          <Select value={methodName} style={{ width: "100%" }} onChange={ setMethodName }>
            <Option key="openStream">openStream()</Option>
            <Option key="closeStream">closeStream()</Option>
          </Select>
        </div>
        <div style={{margin:8,padding:8}}>
          <AddressInput
            autoFocus
            ensProvider={mainnetProvider}
            placeholder="stream to address"
            value={streamToAddress}
            onChange={setStreamToAddress}
          />
        </div>
        {streamDetailForm}
        <div style={{margin:8,padding:8}}>
          <Button onClick={()=>{
            //console.log("METHOD",setMethodName)

            let calldata
            if(methodName=="openStream"){
              calldata = readContracts[contractName].interface.encodeFunctionData("openStream",[streamToAddress,parseEther(""+parseFloat(streamAmount).toFixed(12)),streamFrequency])
            }else{
              calldata = readContracts[contractName].interface.encodeFunctionData("closeStream",[streamToAddress])
            }
            console.log("calldata",calldata)
            setData(calldata)
            setAmount("0")
            setTo(readContracts[contractName].address)
            setTimeout(()=>{
              history.push('/create')
            },777)
          }}>
            Create Tx
          </Button>
        </div>
      </div>
    </div>
  );
}
