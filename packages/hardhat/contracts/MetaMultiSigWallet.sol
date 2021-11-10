// SPDX-License-Identifier: MIT

//  Off-chain signature gathering multisig that streams funds - @austingriffith
//
// started from 🏗 scaffold-eth - meta-multi-sig-wallet example https://github.com/austintgriffith/scaffold-eth/tree/meta-multi-sig
//    (off-chain signature based multi-sig)
//  added a very simple streaming mechanism where `onlySelf` can open a withdraw-based stream
//

pragma solidity ^0.6.7;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";

contract MetaMultiSigWallet {
    using ECDSA for bytes32;

    event Deposit(address indexed sender, uint amount, uint balance);
    event ExecuteTransaction( address indexed owner, address payable to, uint256 value, bytes data, uint256 nonce, bytes32 hash, bytes result);
    event Owner( address indexed owner, bool added);
    event TransferFunds(address indexed reciever, uint256 value);
    mapping(address => bool) public isOwner;
    uint public signaturesRequired;
    uint public nonce;
    uint public chainId;

    constructor(uint256 _chainId, address[] memory _owners, uint _signaturesRequired) public {
        require(_signaturesRequired>0,"constructor: must be non-zero sigs required");
        signaturesRequired = _signaturesRequired;
        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner!=address(0), "constructor: zero address");
            require(!isOwner[owner], "constructor: owner not unique");
            isOwner[owner] = true;
            emit Owner(owner,isOwner[owner]);
        }
        chainId=_chainId;
    }

    modifier onlySelf() {
        require(msg.sender == address(this), "Not Self");
        _;
    }

    function addSigner(address newSigner, uint256 newSignaturesRequired) public onlySelf {
        require(newSigner!=address(0), "addSigner: zero address");
        require(!isOwner[newSigner], "addSigner: owner not unique");
        require(newSignaturesRequired>0,"addSigner: must be non-zero sigs required");
        isOwner[newSigner] = true;
        signaturesRequired = newSignaturesRequired;
        emit Owner(newSigner,isOwner[newSigner]);
    }

    function removeSigner(address oldSigner, uint256 newSignaturesRequired) public onlySelf {
        require(isOwner[oldSigner], "removeSigner: not owner");
        require(newSignaturesRequired>0,"removeSigner: must be non-zero sigs required");
        isOwner[oldSigner] = false;
        signaturesRequired = newSignaturesRequired;
        emit Owner(oldSigner,isOwner[oldSigner]);
    }

    function transferFunds(address payable to, uint256 value) public onlySelf {
        require(address(this).balance > value, "Not enough funds in Wallet");
        emit TransferFunds(to, value);
        to.transfer(value);

    }
    function updateSignaturesRequired(uint256 newSignaturesRequired) public onlySelf {
        require(newSignaturesRequired>0,"updateSignaturesRequired: must be non-zero sigs required");
        signaturesRequired = newSignaturesRequired;
    }

    function getTransactionHash( uint256 _nonce, address to, uint256 value, bytes memory data ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this),chainId,_nonce,to,value,data));
    }

    function executeTransaction( address payable to, uint256 value, bytes memory data, bytes[] memory signatures)
        public
        returns (bytes memory)
    {
        require(isOwner[msg.sender], "executeTransaction: only owners can execute");
        bytes32 _hash =  getTransactionHash(nonce, to, value, data);
        nonce++;
        uint256 validSignatures;
        address duplicateGuard;
        for (uint i = 0; i < signatures.length; i++) {
            address recovered = recover(_hash,signatures[i]);
            require(recovered>duplicateGuard, "executeTransaction: duplicate or unordered signatures");
            duplicateGuard = recovered;
            if(isOwner[recovered]){
              validSignatures++;
            }
        }

        require(validSignatures>=signaturesRequired, "executeTransaction: not enough valid signatures");

        (bool success, bytes memory result) = to.call{value: value}(data);
        require(success, "executeTransaction: tx failed");

        emit ExecuteTransaction(msg.sender, to, value, data, nonce-1, _hash, result);
        return result;
    }

    function recover(bytes32 _hash, bytes memory _signature) public pure returns (address) {
        return _hash.toEthSignedMessageHash().recover(_signature);
    }

    receive() payable external {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    //
    //  new streaming stuff
    //

    event OpenStream( address indexed to, uint256 amount, uint256 frequency );
    event CloseStream( address indexed to );
    event Withdraw( address indexed to, uint256 amount, string reason );

    struct Stream {
        uint256 amount;
        uint256 frequency;
        uint256 last;
    }
    mapping(address => Stream) public streams;

    function streamWithdraw(uint256 amount, string memory reason) public {
        require(streams[msg.sender].amount>0,"withdraw: no open stream");
        _streamWithdraw(msg.sender,amount,reason);
    }

    function _streamWithdraw(address payable to, uint256 amount, string memory reason) private {
        uint256 totalAmountCanWithdraw = streamBalance(to);
        require(totalAmountCanWithdraw>=amount,"withdraw: not enough");
        streams[to].last = streams[to].last + ((block.timestamp - streams[to].last) * amount / totalAmountCanWithdraw);
        emit Withdraw( to, amount, reason );
        to.transfer(amount);
    }

    function streamBalance(address to) public view returns (uint256){
      return (streams[to].amount * (block.timestamp-streams[to].last)) / streams[to].frequency;
    }

    function openStream(address to, uint256 amount, uint256 frequency) public onlySelf {
        require(streams[to].amount==0,"openStream: stream already open");
        require(amount>0,"openStream: no amount");
        require(frequency>0,"openStream: no frequency");

        streams[to].amount = amount;
        streams[to].frequency = frequency;
        streams[to].last = block.timestamp;

        emit OpenStream( to, amount, frequency );
    }

    function closeStream(address to) public onlySelf {
        require(streams[to].amount>0,"closeStream: stream already closed");
        _streamWithdraw(address(uint160(to)),streams[to].amount,"stream closed");
        delete streams[to];
        emit CloseStream( to );
    }


}
