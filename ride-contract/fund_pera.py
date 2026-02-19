"""
Fund any Algorand Testnet address from the deployer account.
Usage: python fund_pera.py <PERA_ADDRESS> <AMOUNT_IN_ALGO>
"""
import sys
from algosdk.v2client.algod import AlgodClient
from algosdk import mnemonic, transaction
from dotenv import load_dotenv
import os

load_dotenv()

ALGOD_SERVER = os.getenv("ALGOD_SERVER", "https://testnet-api.algonode.cloud")
DEPLOYER_MNEMONIC = os.getenv("DEPLOYER_MNEMONIC")
DEPLOYER_ADDRESS = os.getenv("DEPLOYER_ADDRESS")

client = AlgodClient("", ALGOD_SERVER)

# Check deployer balance
info = client.account_info(DEPLOYER_ADDRESS)
deployer_balance = info["amount"] / 1_000_000
print(f"Deployer balance: {deployer_balance:.2f} ALGO")

if len(sys.argv) < 2:
    print("\nUsage: python fund_pera.py <PERA_ADDRESS> [AMOUNT]")
    print("Example: python fund_pera.py ABCD...XYZ 5")
    sys.exit(1)

receiver = sys.argv[1]
amount_algo = float(sys.argv[2]) if len(sys.argv) > 2 else 5.0
amount_micro = int(amount_algo * 1_000_000)

if deployer_balance < amount_algo + 0.1:
    print(f"Not enough ALGO. Have {deployer_balance:.2f}, need {amount_algo + 0.1:.2f}")
    sys.exit(1)

print(f"Sending {amount_algo} ALGO to {receiver[:8]}...{receiver[-4:]}...")

private_key = mnemonic.to_private_key(DEPLOYER_MNEMONIC)
params = client.suggested_params()
txn = transaction.PaymentTxn(DEPLOYER_ADDRESS, params, receiver, amount_micro)
signed = txn.sign(private_key)
tx_id = client.send_transaction(signed)
print(f"Transaction sent! TXID: {tx_id}")

transaction.wait_for_confirmation(client, tx_id, 4)
print(f"Confirmed! {amount_algo} ALGO sent!")
print(f"Explorer: https://testnet.explorer.perawallet.app/tx/{tx_id}")

info2 = client.account_info(receiver)
print(f"Receiver new balance: {info2['amount'] / 1_000_000:.2f} ALGO")
