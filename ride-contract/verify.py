"""Quick verification that the RideEscrow smart contract is live on Testnet."""
from algosdk.v2client import algod
import base64

client = algod.AlgodV2("", "https://testnet-api.algonode.cloud", 443)

APP_ID = 755780364

try:
    info = client.application_info(APP_ID)
    print(f"✅ App ID {APP_ID} EXISTS on Algorand Testnet!")
    print(f"   Creator: {info['params']['creator']}")
    
    gs = info.get("params", {}).get("global-state", [])
    print(f"   Global State ({len(gs)} items):")
    for item in gs:
        key = base64.b64decode(item["key"]).decode()
        val = item["value"].get("uint", 0)
        print(f"     {key} = {val}")
    
    print(f"\n🔗 Explorer: https://testnet.explorer.perawallet.app/application/{APP_ID}")
    print("✅ Smart contract is LIVE and ready!")
except Exception as e:
    print(f"❌ Error: {e}")
