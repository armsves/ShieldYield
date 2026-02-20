// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YieldVault
 * @notice Distributes yield to ShipNFT holders. Treasury deposits per collection; holders claim proportionally.
 * @dev Uses reward-per-share accounting. NFT contract notifies on transfers.
 */
contract YieldVault is ReentrancyGuard, Ownable {
    IERC20 public immutable paymentToken;

    struct CollectionData {
        uint256 accRewardPerShare; // scaled by 1e18
        uint256 totalShares;       // snapshot of NFT totalSupply
    }

    mapping(address => CollectionData) public collections;

    mapping(address => mapping(address => uint256)) public userRewardDebt;

    address public treasury;
    address public factory;

    event Deposited(address indexed collection, uint256 amount, uint256 totalShares);
    event Claimed(address indexed collection, address indexed user, uint256 amount);
    event TreasuryUpdated(address treasury);

    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        treasury = msg.sender;
    }

    /**
     * @notice Called by ShipNFT on transfer. Balances are post-transfer.
     */
    function onShareTransfer(
        address collection,
        address from,
        address to,
        uint256 /* tokenId */
    ) external {
        CollectionData storage col = collections[collection];
        if (col.totalShares == 0) return;

        uint256 balanceFrom = _balanceOf(collection, from);
        uint256 balanceTo = _balanceOf(collection, to);

        if (from != address(0)) {
            uint256 prevBalance = balanceFrom + 1;
            uint256 pending = (prevBalance * col.accRewardPerShare) / 1e18
                - userRewardDebt[collection][from];
            userRewardDebt[collection][from] = (balanceFrom * col.accRewardPerShare) / 1e18;
            if (pending > 0) {
                _pendingRewards[collection][from] += pending;
            }
        }
        if (to != address(0)) {
            userRewardDebt[collection][to] = (balanceTo * col.accRewardPerShare) / 1e18;
        }
    }

    mapping(address => mapping(address => uint256)) private _pendingRewards;

    function _balanceOf(address collection, address account) internal view returns (uint256) {
        (bool ok, bytes memory data) = collection.staticcall(
            abi.encodeWithSignature("balanceOf(address)", account)
        );
        return ok && data.length >= 32 ? abi.decode(data, (uint256)) : 0;
    }

    /**
     * @notice Treasury deposits yield for a collection. Callable by treasury or owner.
     */
    function deposit(address collection, uint256 amount) external nonReentrant {
        require(msg.sender == treasury || msg.sender == owner(), "Not treasury");
        require(amount > 0, "Zero amount");

        CollectionData storage col = collections[collection];
        uint256 supply = _totalSupply(collection);
        require(supply > 0, "No shares");

        paymentToken.transferFrom(msg.sender, address(this), amount);

        col.accRewardPerShare += (amount * 1e18) / supply;
        col.totalShares = supply;

        emit Deposited(collection, amount, supply);
    }

    function _totalSupply(address collection) internal view returns (uint256) {
        (bool ok, bytes memory data) = collection.staticcall(
            abi.encodeWithSignature("totalSupply()")
        );
        return ok && data.length >= 32 ? abi.decode(data, (uint256)) : 0;
    }

    function setFactory(address _factory) external onlyOwner {
        factory = _factory;
    }

    /**
     * @notice Initialize collection. Callable by owner or factory.
     */
    function initCollection(address collection) external {
        require(msg.sender == owner() || msg.sender == factory, "Not authorized");
        CollectionData storage col = collections[collection];
        require(col.totalShares == 0, "Already init");
        uint256 supply = _totalSupply(collection);
        require(supply > 0, "No shares");
        col.totalShares = supply;
    }

    /**
     * @notice Claim accrued yield for a collection.
     */
    function claim(address collection) external nonReentrant {
        _updateDebt(collection, msg.sender);

        uint256 pending = _pendingRewards[collection][msg.sender];
        require(pending > 0, "Nothing to claim");

        _pendingRewards[collection][msg.sender] = 0;
        paymentToken.transfer(msg.sender, pending);

        emit Claimed(collection, msg.sender, pending);
    }

    function _updateDebt(address collection, address user) internal {
        CollectionData storage col = collections[collection];
        uint256 balance = _balanceOf(collection, user);
        uint256 acc = col.accRewardPerShare;

        uint256 pending = (balance * acc) / 1e18 - userRewardDebt[collection][user];
        userRewardDebt[collection][user] = balance * acc / 1e18;

        if (pending > 0) {
            _pendingRewards[collection][user] += pending;
        }
    }

    function pendingReward(address collection, address user) external view returns (uint256) {
        CollectionData storage col = collections[collection];
        uint256 balance = _balanceOf(collection, user);
        uint256 acc = col.accRewardPerShare;
        uint256 debt = userRewardDebt[collection][user];
        uint256 fromShares = (balance * acc) / 1e18 > debt ? (balance * acc) / 1e18 - debt : 0;
        return _pendingRewards[collection][user] + fromShares;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }
}
