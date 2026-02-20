// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/MockERC20.sol";
import "../contracts/ShipYieldMarketplace.sol";
import "../contracts/YieldVault.sol";
import "../contracts/ShipCollectionFactory.sol";

/**
 * Full deployment including a mock USDC (6 decimals) for local/testnet.
 */
contract DeployWithMockScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        if (deployerPrivateKey == 0) {
            deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80; // anvil default
        }

        vm.startBroadcast(deployerPrivateKey);

        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 6);
        usdc.mint(msg.sender, 10_000_000e6);

        uint256 sharePrice = 200e6;
        ShipYieldMarketplace marketplace = new ShipYieldMarketplace(
            address(usdc),
            sharePrice
        );

        YieldVault vault = new YieldVault(address(usdc));
        vault.setTreasury(msg.sender);

        ShipCollectionFactory factory = new ShipCollectionFactory(
            address(marketplace),
            address(vault)
        );

        vault.setFactory(address(factory));

        vm.stopBroadcast();

        console.log("USDC (mock):", address(usdc));
        console.log("Marketplace:", address(marketplace));
        console.log("YieldVault:", address(vault));
        console.log("Factory:", address(factory));
    }
}
