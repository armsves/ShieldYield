// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ShipNFT
 * @notice ERC721 representing fractional shares ($200 each) of a tokenized cargo vessel.
 * @dev One contract per ship collection. All tokens minted at creation.
 */
contract ShipNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId;
    string private _baseTokenURI;
    address public immutable yieldVault;

    event BaseURIUpdated(string uri);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 totalShares_,
        address mintTo_,
        address yieldVault_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
        yieldVault = yieldVault_;
        _nextTokenId = 1;

        for (uint256 i = 0; i < totalShares_; i++) {
            _safeMint(mintTo_, _nextTokenId);
            _nextTokenId++;
        }
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function setBaseURI(string calldata uri) external onlyOwner {
        _baseTokenURI = uri;
        emit BaseURIUpdated(uri);
    }

    /**
     * @notice Notify YieldVault when tokens are transferred (for reward accounting).
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        address previousOwner = super._update(to, tokenId, auth);

        if (yieldVault != address(0)) {
            IYieldVaultNotify(yieldVault).onShareTransfer(
                address(this),
                from,
                to,
                tokenId
            );
        }

        return previousOwner;
    }
}

interface IYieldVaultNotify {
    function onShareTransfer(
        address collection,
        address from,
        address to,
        uint256 tokenId
    ) external;
}
