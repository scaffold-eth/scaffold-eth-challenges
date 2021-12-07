pragma solidity >=0.6.0 <0.7.0;
// SPDX-License-Identifier: MIT

// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract YourCollectible is ERC721, Ownable {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  string [] public tokenUris = [ 
    "QmX8RD8frmYVJeg35Gwc7MYTncE3tVdi5f4bJHACef7pp7",
    "QmcDemZ6C8f3Q9ty452VHATTMS1rhZ6v1BjY7SNUmLuuV5",
    "QmeMCfTvc4s5HEm6BDdhwJStYKhj8QL4jVut7usJZ9rcg7",
    "Qmapq27cuZ2nFdSU56ttrjyoeZxDtpckRFGrBnT1sbCoDD",
    "QmSiepKy4bEzHxUj1eBr3pXj57S26sx3syBa38cywj9bEc",
    "QmRkng9gegRktuTYzFzNex3EqKTYrgYT8CNLiiZ36ZgQ9s",
    "QmdEzRm4WrQaA6RBQq7Z7gYHKunp1i1ofBpKKnuR3KfzJk",
    "QmZZJwioX1MucPPrtASLANwt1jLA4YuLTkxdoDskWodkGY",
    "QmcdsR4tn8fLtwVSLcfNcBrVTzg58tbGs84gKvhcowvWtx",
    "QmeY893QobkcKY2BFBrajgHs546qD1i3K8oPHWgH51kLN1",
    "QmdEF9whqBPUU6trg7K4AMx5uHFgPkGsFSmE3cnWRbsb69",
    "QmNyB5JFvx2845NGZXv4wTurMwwdcSNnUTusJa8U7ACseu"
  ];

  constructor() public ERC721("YourCollectible", "YCB") {
    _setBaseURI("https://ipfs.io/ipfs/");
  }

  function mintItem(address to)
      public
      onlyOwner
      returns (uint256)
  {
      _tokenIds.increment();

      uint256 id = _tokenIds.current();
      _mint(to, id);
      _setTokenURI(id, tokenUris[id-1]);

      return id;
  }
}
