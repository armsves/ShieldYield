// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/ShipYieldMarketplace.sol";
import "../contracts/YieldVault.sol";
import "../contracts/ShipCollectionFactory.sol";
import "../contracts/MockERC20.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address paymentToken = vm.envAddress("PAYMENT_TOKEN");

        vm.startBroadcast(deployerPrivateKey);

        // $200 in 6 decimals (USDC)
        uint256 sharePrice = 200e6;

        ShipYieldMarketplace marketplace = new ShipYieldMarketplace(
            paymentToken,
            sharePrice
        );

        YieldVault vault = new YieldVault(paymentToken);
        vault.setTreasury(msg.sender);

        ShipCollectionFactory factory = new ShipCollectionFactory(
            address(marketplace),
            address(vault)
        );

        vault.setFactory(address(factory));

        vm.stopBroadcast();

        console.log("Marketplace:", address(marketplace));
        console.log("YieldVault:", address(vault));
        console.log("Factory:", address(factory));
    }
}
