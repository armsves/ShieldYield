// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/YieldVault.sol";

/**
 * Vault owner calls setFactory(newFactory). Must be run by the vault's owner.
 * Requires: VAULT_ADDRESS, NEW_FACTORY_ADDRESS in .env (or pass as args)
 *
 * Usage:
 *   forge script script/SetVaultFactory.s.sol:SetVaultFactoryScript --rpc-url $RPC_URL --broadcast \
 *     -vvvv --sig "run(address,address)" $YIELD_VAULT_ADDRESS $NEW_FACTORY_ADDRESS
 */
contract SetVaultFactoryScript is Script {
    function run(address vaultAddress, address newFactoryAddress) external {
        uint256 ownerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(ownerPrivateKey);

        YieldVault vault = YieldVault(payable(vaultAddress));
        vault.setFactory(newFactoryAddress);

        vm.stopBroadcast();

        console.log("Vault factory updated to:", newFactoryAddress);
    }
}
