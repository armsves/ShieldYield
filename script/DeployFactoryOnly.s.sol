// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/ShipCollectionFactory.sol";
import "../contracts/YieldVault.sol";

/**
 * Redeploy Factory only (e.g. after ShipNFT fix).
 * Requires: MARKETPLACE_ADDRESS, YIELD_VAULT_ADDRESS in .env
 *
 * Step 1: Run this script → deploy new Factory
 * Step 2: Vault OWNER runs SetVaultFactory.s.sol with NEW_FACTORY_ADDRESS
 */
contract DeployFactoryOnlyScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address marketplaceAddr = vm.envAddress("MARKETPLACE_ADDRESS");
        address vaultAddr = vm.envAddress("YIELD_VAULT_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        ShipCollectionFactory factory = new ShipCollectionFactory(
            marketplaceAddr,
            vaultAddr
        );

        vm.stopBroadcast();

        console.log("New Factory:", address(factory));
        console.log("");
        console.log("Next: Vault OWNER must run SetVaultFactory.s.sol with their key");
    }
}

