# Saweria API

This library provides a simple interface to interact with the Saweria API.
and create qris payment using only username 🚀

## Installation

```bash
npm install saweria-createqr
```

## Usage

### create Payment string method
```javascript
const {  createPaymentString, createPaymentQr } = require('@sumshiiy/saweria-createqr');

// example
createPaymentString(saweria_username, { amount: amount, message: message}) .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error);
    });


    // guide
createPaymentString("aisbirpedia", { amount: 1000, message: "message"}) .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error);
    });
```

The result is
```json
{
  created_by: 'Sumshiiy Developer Team',
  trx_id: '9e40d10b-cd05-4dda-b66d-66c07cd6d7b5',
  message: 'message',
  amount: 1000,
  qr_string: '00020101021226570011ID.DANA.WWW011893600915016937059202091693705920303UME51440014ID.CO.QRIS.WWW0215ID20210917307330303UME520473925303360540410085802ID5907saweria6015Kota Jakarta Pu61051034062720115XxuNZHGj9C8i6zZ60490011ID.DANA.WWW0425MER20210714007745096086410501163046696',
  created_at: 'Thu, 02 Jan 2025 03:38:25 GMT',
  total_dibayar: 1008,
  saweria_username: 'aisbirpedia',
  saweria_apikey: 'f870a41e-997f-4523-a6c1-a1cdfdf10eab'
}
```


### create Payment qr method
```javascript
const {  createPaymentString, createPaymentQr } = require('saweria-createqr');

// example
createPaymentQr(saweria_username,path, { amount: amount, message: message}) .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error);
    });


    // guide
createPaymentQr("aisbirpedia", { amount: 1000, message: "message"}) .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error);
    });
```

The result is
```json
{
  author: '@sumshiiy',
  trx_id: 'b3e77c50-1cb3-411a-ad97-87b1c98f6f09',
  message: 'message',
  amount: 1000,
  qr_string: '00020101021226570011ID.DANA.WWW011893600915016937059202091693705920303UME51440014ID.CO.QRIS.WWW0215ID20210917307330303UME520473925303360540410085802ID5907saweria6015Kota Jakarta Pu61051034062720115cwKvEUVJQdw5qxR60490011ID.DANA.WWW0425MER2021071400774509608641050116304E3F9',
  created_at: 'Thu, 02 Jan 2025 03:49:55 GMT',
  total_dibayar: 1008,
  saweria_username: 'aisbirpedia',
  saweria_apikey: 'f870a41e-997f-4523-a6c1-a1cdfdf10eab',
  qr_image: "https://files.catbox.moe"
}
```


## Methods

### createPaymentQr()
### createPaymentString()

## License

This project is licensed under the MIT License.