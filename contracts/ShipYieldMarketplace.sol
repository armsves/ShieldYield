// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ShipYieldMarketplace
 * @notice Fixed-price marketplace for vessel share NFTs. Price: $200 (in payment token units).
 * @dev Payment token typically USDC (6 decimals): 200e6 = $200
 */
contract ShipYieldMarketplace is ReentrancyGuard, Ownable {
    IERC20 public immutable paymentToken;

    /// @dev USDC 6 decimals: 200e6. For 18 decimals use 200e18.
    uint256 public sharePrice;

    struct Listing {
        address collection;
        uint256 tokenId;
        address seller;
    }

    mapping(address => mapping(uint256 => Listing)) public listings;
    uint256 public listingCount;
    uint256 public feeBps; // basis points, e.g. 250 = 2.5%
    address public feeRecipient;

    event Listed(address indexed collection, uint256 indexed tokenId, address seller);
    event Unlisted(address indexed collection, uint256 indexed tokenId);
    event Purchased(
        address indexed collection,
        uint256 indexed tokenId,
        address buyer,
        address seller,
        uint256 price
    );

    constructor(
        address _paymentToken,
        uint256 _sharePrice
    ) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        sharePrice = _sharePrice;
        feeRecipient = msg.sender;
    }

    function list(address collection, uint256 tokenId) external nonReentrant {
        IERC721(collection).transferFrom(msg.sender, address(this), tokenId);
        listings[collection][tokenId] = Listing({
            collection: collection,
            tokenId: tokenId,
            seller: msg.sender
        });
        listingCount++;
        emit Listed(collection, tokenId, msg.sender);
    }

    function batchList(address collection, uint256[] calldata tokenIds) external nonReentrant {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            IERC721(collection).transferFrom(msg.sender, address(this), tokenId);
            listings[collection][tokenId] = Listing({
                collection: collection,
                tokenId: tokenId,
                seller: msg.sender
            });
            listingCount++;
            emit Listed(collection, tokenId, msg.sender);
        }
    }

    function unlist(address collection, uint256 tokenId) external nonReentrant {
        Listing memory l = listings[collection][tokenId];
        require(l.seller == msg.sender, "Not seller");
        delete listings[collection][tokenId];
        listingCount--;
        IERC721(collection).transferFrom(address(this), msg.sender, tokenId);
        emit Unlisted(collection, tokenId);
    }

    function buy(address collection, uint256 tokenId) external nonReentrant {
        Listing memory l = listings[collection][tokenId];
        require(l.seller != address(0), "Not listed");

        delete listings[collection][tokenId];
        listingCount--;

        uint256 fee = (sharePrice * feeBps) / 10_000;
        uint256 toSeller = sharePrice - fee;

        require(
            paymentToken.transferFrom(msg.sender, address(this), sharePrice),
            "Payment failed"
        );

        if (fee > 0 && feeRecipient != address(0)) {
            paymentToken.transfer(feeRecipient, fee);
        }
        paymentToken.transfer(l.seller, toSeller);

        IERC721(collection).transferFrom(address(this), msg.sender, tokenId);

        emit Purchased(collection, tokenId, msg.sender, l.seller, sharePrice);
    }

    function setSharePrice(uint256 _sharePrice) external onlyOwner {
        sharePrice = _sharePrice;
    }

    function setFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Max 10%");
        feeBps = _feeBps;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }

    function isListed(address collection, uint256 tokenId) external view returns (bool) {
        return listings[collection][tokenId].seller != address(0);
    }
}
