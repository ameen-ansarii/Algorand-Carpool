import logging

import algokit_utils

logger = logging.getLogger(__name__)


def deploy() -> None:
    """Deploy RideEscrow contract to the configured network (testnet)."""
    from smart_contracts.artifacts.ride_escrow.ride_escrow_client import (
        RideEscrowFactory,
    )

    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    factory = algorand.client.get_typed_app_factory(
        RideEscrowFactory, default_sender=deployer_.address
    )

    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        # Fund the contract with 1 ALGO for minimum balance
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=1),
                sender=deployer_.address,
                receiver=app_client.app_address,
            )
        )

    logger.info(
        f"Deployed {app_client.app_name} with App ID: {app_client.app_id} "
        f"at address: {app_client.app_address}"
    )

    # Print deployment info for submission
    print(f"\n{'='*60}")
    print(f"✅ DEPLOYMENT SUCCESSFUL!")
    print(f"{'='*60}")
    print(f"App Name:    {app_client.app_name}")
    print(f"App ID:      {app_client.app_id}")
    print(f"App Address: {app_client.app_address}")
    print(f"Network:     Algorand Testnet")
    print(f"Explorer:    https://testnet.explorer.perawallet.app/application/{app_client.app_id}")
    print(f"{'='*60}\n")
