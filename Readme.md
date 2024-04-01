終了後、こちらのコマンドで、設定した優先手数料を取得できます。

```
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
  {
    "jsonrpc":"2.0", "id":1,
    "method": "getRecentPrioritizationFees",
    "params": [
      ["<自分のウォレットアドレス>"]
    ]
  }
'
```
