// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/MockERC20.sol";
import "../contracts/ShipYieldMarketplace.sol";
import "../contracts/YieldVault.sol";
import "../contracts/ShipCollectionFactory.sol";
import "../contracts/ShipNFT.sol";

contract ShipYieldTest is Test {
    MockERC20 public usdc;
    ShipYieldMarketplace public marketplace;
    YieldVault public vault;
    ShipCollectionFactory public factory;

    address alice = address(0xA);
    address treasury = address(0xB);

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        usdc.mint(alice, 1_000_000e6);

        uint256 sharePrice = 200e6;
        marketplace = new ShipYieldMarketplace(address(usdc), sharePrice);

        vault = new YieldVault(address(usdc));
        vault.setTreasury(treasury);

        factory = new ShipCollectionFactory(address(marketplace), address(vault));
        vault.setFactory(address(factory));
    }

    function test_createCollection() public {
        vm.prank(alice);
        (address nft, uint256 id) = factory.createCollection(
            "MSC Aurora",
            "MSAUR",
            "https://api.shipyield.com/metadata/1/",
            1_000_000 // $1M ship = 5000 shares
        );

        assertEq(id, 0);
        assertTrue(nft != address(0));

        (address nftAddr,, uint256 shareCount) = factory.collections(0);
        assertEq(nftAddr, nft);
        assertEq(shareCount, 5000);

        assertEq(IERC721(nft).balanceOf(address(marketplace)), 5000);
        assertTrue(marketplace.isListed(nft, 1));
        assertTrue(marketplace.isListed(nft, 5000));
        assertFalse(marketplace.isListed(nft, 5001));
    }

    function test_buyShare() public {
        vm.prank(alice);
        (address nft,) = factory.createCollection(
            "MSC Aurora",
            "MSAUR",
            "https://api.shipyield.com/metadata/1/",
            1_000 // 5 shares
        );

        address buyer = address(0xC);
        usdc.mint(buyer, 1000e6);

        vm.prank(buyer);
        usdc.approve(address(marketplace), 200e6);
        vm.prank(buyer);
        marketplace.buy(nft, 1);

        assertEq(IERC721(nft).ownerOf(1), buyer);
        assertEq(usdc.balanceOf(buyer), 800e6);
    }

    function test_depositAndClaim() public {
        vm.prank(alice);
        (address nft,) = factory.createCollection(
            "MSC Aurora",
            "MSAUR",
            "https://api.shipyield.com/metadata/1/",
            1_000 // 5 shares total
        );

        address buyer = address(0xC);
        usdc.mint(buyer, 1000e6);
        vm.startPrank(buyer);
        usdc.approve(address(marketplace), 200e6);
        marketplace.buy(nft, 1);
        vm.stopPrank();

        usdc.mint(treasury, 100e6);
        vm.prank(treasury);
        usdc.approve(address(vault), 100e6);
        vm.prank(treasury);
        vault.deposit(nft, 100e6);

        uint256 pending = vault.pendingReward(nft, buyer);
        assertEq(pending, 20e6); // 1 share of 5 total: 1/5 * 100e6 = 20e6

        vm.prank(buyer);
        vault.claim(nft);
        assertEq(usdc.balanceOf(buyer), 800e6 + 20e6); // 800 + 20 USDC
    }
}
