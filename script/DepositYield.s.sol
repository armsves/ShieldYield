// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../contracts/YieldVault.sol";
import "../contracts/ShipCollectionFactory.sol";

/**
 * @title DepositYieldScript
 * @notice Treasury deposits USDC into YieldVault for a collection. Run after creating collections.
 * @dev Set COLLECTION_ID and DEPOSIT_AMOUNT (in USDC, 6 decimals). Treasury needs USDC balance.
 *
 *   forge script script/DepositYield.s.sol:DepositYieldScript \
 *     --rpc-url $RPC_URL --broadcast \
 *     --private-key $PRIVATE_KEY
 *
 * Env: YIELD_VAULT_ADDRESS, FACTORY_ADDRESS, PAYMENT_TOKEN, COLLECTION_ID, DEPOSIT_AMOUNT
 */
contract DepositYieldScript is Script {
    function run() external {
        address vaultAddr = vm.envAddress("YIELD_VAULT_ADDRESS");
        address factoryAddr = vm.envAddress("FACTORY_ADDRESS");
        address paymentTokenAddr = vm.envAddress("PAYMENT_TOKEN");
        uint256 collectionId = vm.envOr("COLLECTION_ID", uint256(0));
        uint256 amount = vm.envOr("DEPOSIT_AMOUNT", uint256(1000e6)); // default 1000 USDC

        require(vaultAddr != address(0), "YIELD_VAULT_ADDRESS required");
        require(factoryAddr != address(0), "FACTORY_ADDRESS required");
        require(paymentTokenAddr != address(0), "PAYMENT_TOKEN required");

        uint256 pk = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(pk);

        ShipCollectionFactory factory = ShipCollectionFactory(factoryAddr);
        (address nft, , ) = factory.collections(collectionId);
        require(nft != address(0), "Collection not found");

        IERC20 usdc = IERC20(paymentTokenAddr);
        YieldVault vault = YieldVault(vaultAddr);

        usdc.approve(vaultAddr, amount);
        vault.deposit(nft, amount);

        console.log("Deposited", amount / 1e6, "USDC for collection", collectionId);

        vm.stopBroadcast();
    }
}
