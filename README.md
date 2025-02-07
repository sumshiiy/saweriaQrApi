![Sawer](https://cdn.aisbir.cloud/saweriaa.png)
# Saweria Qr Payment api
and saweria.co unofficial api that can create qris and check it automatically

> [Original Npmjs](https://www.npmjs.com/package/saweria-createqr) | [Repository](https://github.com/sumshiiy/saweriaQrApi)

## Featured
| todos | status |
|--|--|
| Checking Auto payment | ✅ |
| Checking User balance account | ✅ |
| Set Expiry duration of payment | ✅ |
| Catbox.moe as storage | ✅ |
| Ai message auto generated | ✅ |
| Auto check payment without logged in | ✅ |
| set webhook from api | ✅ |
| esm support | ⛔ |

## Algorithm
How auto check payments works :)
we doesnt steal your account
![Sawer](https://cdn.aisbir.cloud/op.png)
## Payment api
 ### **Creating Payment basic**
 This simple method to create payment using saweria
 ```js
const { SumshiiySawer } = require('saweria-createqr');
const sawer = new SumshiiySawer({ username: 'your saweria username', email: 'your saweria email', password: 'your saweria password'});

(async () => {
await sawer.login() // Login to your saweria account first

 await sawer.createPaymentQr(amount, duration) // the duration in minute

//example
const payment = await sawer.createPaymentQr(1000,30) // expired in 30 minute
console.log(payment)
})
```

> Response Status example
```json
{
  author: '@aisbirkoenz',
  trx_id: '21a8c370-5062-49af-b8dc-2a2d3cf3396c',
  status: 'Pending',
  status_simbolic: '⏳ Pending',
  message: 'Semangat terus broo! Kamu bisa!',
  amount: 1000,
  qr_string: '00020101021226570011ID.DANA.WWW011893600915016937059202091693705920303UME51440014ID.CO.QRIS.WWW0215ID20210917307330303UME520473925303360540410085802ID5907saweria6015Kota Jakarta Pu61051034062720115ree9HxQL8uRztkJ60490011ID.DANA.WWW0425MER20210714007745096086410501163048419',
  created_at: 'Mon, 03 Feb 2025 16:36:07 GMT',
  invoice_url: 'https://saweria.co/qris/21a8c370-5062-49af-b8dc-2a2d3cf3396c',
  total_dibayar: 1008,
  saweria_username: 'aisbirpedia',
  saweria_apikey: 'f870a41e-997f-4523-a6c1-a1cdfdf10eab',
  qr_image: 'https://files.catbox.moe/a9p9cg.jpg',
  expired_in: 2025-02-03T16:37:08.356Z
}
```

### Cek Payment Status V1
You must logged in to use payment status v1
 ```js
const { SumshiiySawer } = require('saweria-createqr');
const sawer = new SumshiiySawer({ username: 'your saweria username', email: 'your saweria email', password: 'your saweria password'});

(async () => {

 await sawer.cekPaymentV1(trxid) // trx id received after createpayment

//example
const payment = await sawer.createPaymentQr(1000,30) // expired in 30 minute

const tes = setInterval(async() => {
   
 const paymentStatus = await sawer.cekpayment(p.trx_id)
 console.log(paymentStatus)

 if (paymentStatus.status === "Paid") {
    console.log('Payment Berhasil, Menghentikan interval')
     clearInterval(tes)
 }
}, 7000);
})
```
> example if pending
```json
{
  author: '@aisbirkoenz',
  code: 200,
  trx_id: '0f141a97-80a0-48c7-89ea-8f4d9e277abf',
  username: 'aisbirpedia',
  status: 'Pending',
  status_simbolic: '⏳ Pending',
  amount: 1000,
  invoice_url: 'https://saweria.co/qris/0f141a97-80a0-48c7-89ea-8f4d9e277abf',
  total_dibayar: 1008,
  created_at: 'Mon, 03 Feb 2025 16:37:02 GMT',
  expired_in: '2025-02-03T16:38:02.602Z'
}
```
>  example if paid
```json
{
  author: '@aisbirkoenz',
  code: 200,
  trx_id: '0f141a97-80a0-48c7-89ea-8f4d9e277abf',
  username: 'aisbirpedia',
  status: 'Paid',
  status_simbolic: '✅ Paid',
  amount: 1000,
  invoice_url: 'https://saweria.co/qris/0f141a97-80a0-48c7-89ea-8f4d9e277abf',
  total_dibayar: 1008,
  created_at: 'Mon, 03 Feb 2025 16:37:02 GMT',
  expired_in: '2025-02-03T16:38:02.602Z'
}
```

> example if expired
```json
{
  author: '@aisbirkoenz',
  code: 200,
  trx_id: '0f141a97-80a0-48c7-89ea-8f4d9e277abf',
  username: 'aisbirpedia',
  status: 'Expired',
  status_simbolic: '⛔ Expired',
  amount: 1000,
  invoice_url: 'https://saweria.co/qris/0f141a97-80a0-48c7-89ea-8f4d9e277abf',
  total_dibayar: 1008,
  created_at: 'Mon, 03 Feb 2025 16:37:02 GMT',
  expired_in: '2025-02-03T16:38:02.602Z'
}
```



### Cek Payment Status V2
You Doesn't need logged in
 ```js
const { SumshiiySawer } = require('saweria-createqr');
const sawer = new SumshiiySawer({ username: 'your saweria username', email: 'your saweria email', password: 'your saweria password'});

(async () => {

 await sawer.cekPaymentV2(trxid) // trx id received after createpayment

//example
const payment = await sawer.cekPaymentV2(1000,30) // expired in 30 minute

const tes = setInterval(async() => {
   
 const paymentStatus = await sawer.cekPaymentV2(p.trx_id)
 console.log(paymentStatus)

 if (paymentStatus.status === "Paid") {
    console.log('Payment Berhasil, Menghentikan interval')
     clearInterval(tes)
 }
}, 7000);
})
```
> example if pending
```json
{
  author: '@aisbirkoenz',
  code: 200,
  trx_id: '0f141a97-80a0-48c7-89ea-8f4d9e277abf',
  username: 'aisbirpedia',
  status: 'Pending',
  status_simbolic: '⏳ Pending',
  amount: 1000,
  invoice_url: 'https://saweria.co/qris/0f141a97-80a0-48c7-89ea-8f4d9e277abf',
  total_dibayar: 1008,
  created_at: 'Mon, 03 Feb 2025 16:37:02 GMT',
  expired_in: '2025-02-03T16:38:02.602Z'
}
```
>  example if paid
```json
{
  author: '@aisbirkoenz',
  code: 200,
  trx_id: '0f141a97-80a0-48c7-89ea-8f4d9e277abf',
  username: 'aisbirpedia',
  status: 'Paid',
  status_simbolic: '✅ Paid',
  amount: 1000,
  invoice_url: 'https://saweria.co/qris/0f141a97-80a0-48c7-89ea-8f4d9e277abf',
  total_dibayar: 1008,
  created_at: 'Mon, 03 Feb 2025 16:37:02 GMT',
  expired_in: '2025-02-03T16:38:02.602Z'
}
```

> example if expired
```json
{
  author: '@aisbirkoenz',
  code: 200,
  trx_id: '0f141a97-80a0-48c7-89ea-8f4d9e277abf',
  username: 'aisbirpedia',
  status: 'Expired',
  status_simbolic: '⛔ Expired',
  amount: 1000,
  invoice_url: 'https://saweria.co/qris/0f141a97-80a0-48c7-89ea-8f4d9e277abf',
  total_dibayar: 1008,
  created_at: 'Mon, 03 Feb 2025 16:37:02 GMT',
  expired_in: '2025-02-03T16:38:02.602Z'
}
```
## Misc
### Set Webhook url
```js
const { SumshiiySawer } = require('saweria-createqr');
const sawer = new SumshiiySawer({ username: 'your saweria username', email: 'your saweria email', password: 'your saweria password'});

(async () => {
const webhook = await sawer.setWebhook()
console.log(webhook)
})
```
> Example result
```json
{ 
  status: true,
 message: 'Webhook Berhasil Di Set',
  type: 'WEBHOOK'
   }
```
### Cek balance
you must be logged in to cek balance
```js
const { SumshiiySawer } = require('saweria-createqr');
const sawer = new SumshiiySawer({ username: 'your saweria username', email: 'your saweria email', password: 'your saweria password'});

(async () => {
const saldoku = await sawer.getSaldo()
console.log(saldoku)
})
```

> response status
```json
{ 
    author: '@aisbirkoenz',
 balance: 99999999999999
  }
```


### Set Fee
you must be logged in to settings fee
```js
const { SumshiiySawer } = require('saweria-createqr');
const sawer = new SumshiiySawer({ username: 'your saweria username', email: 'your saweria email', password: 'your saweria password'});

(async () => {
const saldoku = await sawer.setFee('buyer / seller')
console.log(saldoku)
})
```

> response status
```json
{ status: true, message: 'Fee Berhasil Di Set ke STREAMER' }
```
 # Information🚨
- Use for fraud and phishing purposes, we will not be responsible, we only make modules so that people can make further integrations on saweria.co
- All Copyright Regarded by sumshiiy developer team
Any security purpose? mail us [abuse@aisbir.cloud](mailto:abuse@aisbir.cloud)

# Author
[Sumshiiy developer team](https://t.me/aisbirkoenz)