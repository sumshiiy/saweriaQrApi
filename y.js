
const { createPaymentQr } = require('.')
async function main(){
const p = await createPaymentQr("aisbirpedia", { amount: 10000, message: "semangat bang" })
console.log(p)
}
main()