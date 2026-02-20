// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./ShipNFT.sol";
import "./ShipYieldMarketplace.sol";
import "./YieldVault.sol";

/**
 * @title ShipCollectionFactory
 * @notice Deploys new ShipNFT collections, mints all shares to marketplace, and initializes yield vault.
 * @dev Call createCollection(price) to tokenize a ship: shares = floor(price / 200).
 */
contract ShipCollectionFactory {
    uint256 public constant SHARE_PRICE_USD = 200;

    ShipYieldMarketplace public immutable marketplace;
    YieldVault public immutable yieldVault;

    struct CollectionInfo {
        address nft;
        string name;
        uint256 shareCount;
    }

    mapping(uint256 => CollectionInfo) public collections;
    uint256 public collectionCount;

    event CollectionCreated(
        uint256 indexed id,
        address nft,
        string name,
        uint256 shareCount
    );

    constructor(address _marketplace, address _yieldVault) {
        marketplace = ShipYieldMarketplace(payable(_marketplace));
        yieldVault = YieldVault(_yieldVault);
    }

    /**
     * @param name Ship name (e.g. "MSC Aurora")
     * @param symbol Collection symbol (e.g. "MSAUR")
     * @param baseURI Base URI for token metadata
     * @param shipPriceUsd Total ship value in USD; shares = floor(price / 200)
     */
    function createCollection(
        string calldata name,
        string calldata symbol,
        string calldata baseURI,
        uint256 shipPriceUsd
    ) external returns (address nft, uint256 id) {
        require(shipPriceUsd >= SHARE_PRICE_USD, "Price < 200");
        uint256 shareCount = shipPriceUsd / SHARE_PRICE_USD;
        require(shareCount > 0, "No shares");

        nft = address(new ShipNFT(
            name,
            symbol,
            baseURI,
            shareCount,
            address(this),
            address(yieldVault)
        ));

        id = collectionCount++;
        collections[id] = CollectionInfo({
            nft: nft,
            name: name,
            shareCount: shareCount
        });

        yieldVault.initCollection(nft);

        ShipNFT(nft).setApprovalForAll(address(marketplace), true);
        uint256[] memory tokenIds = new uint256[](shareCount);
        for (uint256 i = 0; i < shareCount; i++) {
            tokenIds[i] = i + 1;
        }
        marketplace.batchList(nft, tokenIds);

        emit CollectionCreated(id, nft, name, shareCount);
    }
}
