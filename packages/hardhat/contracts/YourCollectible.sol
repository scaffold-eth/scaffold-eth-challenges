pragma solidity 0.8.4;
// SPDX-License-Identifier: MIT

// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract YourCollectible is ERC721URIStorage, Ownable {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() public ERC721("YourCollectible", "YCB") {
    
  }

  function mintItem(address to, string memory tokenURI)
      public
      onlyOwner
      returns (uint256 id)
  {
      _tokenIds.increment();

      id = _tokenIds.current();
      _mint(to, id);
      _setTokenURI(id, tokenURI);

      return id;
  }
}
