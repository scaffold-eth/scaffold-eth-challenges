
export default parseTransaction(readContracts, contractName, transactionData){
    const transactionInfo = readContracts[contractName].interface.parseTransaction(transactionData);

    const {name, payable, stateMutability, type, inputs, args} = transactionInfo.functionFragment;
    


}