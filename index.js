/*
Created By Sumshiiy Developer Team
Any Steal Of Code will be takedown
Do not change anything above this
*/

const axios = require('axios');
const cheerio = require('cheerio');
const listpesan = require('./pesan.js');
const chalk = require('chalk')
const randomUser = require('random-user');
const { createQr } = require('./lib/createQr.js');

const baseUrl = 'https://backend.saweria.co';
const frontUrl = 'https://saweria.co';
const logdebug = (pesan) => {
    console.log(chalk.yellowBright('saweria - ') + pesan)
}

/**
 * Creates a payment QR string for a specified Saweria user.
 *
 * @param {string} saweria_username - The username of the Saweria account. saweria.co/aisbirpedia
 * @param {Object} options - The options for the payment.
 * @param {number} options.amount - The amount to be paid (minimum 1000).
 * @param {string} options.message - The message to be included with the payment.
 * @throws {Error} If any required parameter is missing or if the amount is less than 1000.
 * @returns {Promise<Object>} An object containing payment details and the generated QR code.
 */
async function createPaymentString(saweria_username, { amount}) {
    if (!saweria_username || !amount ) {
        throw new Error('Parameter Is Missing!');
    }
    if (amount < 1000) {
        throw new Error('Minimum Amount Is 5000');
    }
    const pesan = listpesan[Math.floor(Math.random() * listpesan.length)];
    logdebug(`Mengambil Data Saweria saweria.co/${saweria_username}`)
    const response = await axios.get(`${frontUrl}/${saweria_username}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
    });
    const $ = cheerio.load(response.data);

    const nextDataScript = $('#__NEXT_DATA__').html();
    if (!nextDataScript) {
        logdebug('Akun saweria ini tidak aktif atau tidak ditemukan')
        throw new Error('Akun Saweria Tidak Ditemukan');
    
    }
    const nextData = JSON.parse(nextDataScript);
    const userId = nextData?.props?.pageProps?.data?.id;
    if (!userId) {
        logdebug('Akun saweria ini tidak aktif atau tidak ditemukan')
        throw new Error('Akun Saweria Tidak Ditemukan');
    }
    const p = await randomUser('simple');

    const username = p.username;
    const ps = await axios.post(`${baseUrl}/donations/${userId}`, {
        "agree": true,
        "notUnderage": true,
        "message": pesan,
        "amount": parseInt(amount),
        "payment_type": "qris",
        "vote": "",
        "currency": "IDR",
        "customer_info": {
            "first_name": "",
            "email": `${username}@gmail.com`,
            "phone": ""
        }
    });
    const pc = ps.data.data;
    const daa = {
        "author": "@sumshiiy",
        "trx_id": pc.id,
        "message": pesan,
        "amount": amount,
        "invoice_url": `https://saweria.co/qris/${pc.id}`,
        "qr_string": pc.qr_string,
        "created_at": pc.created_at,
        "total_dibayar": pc.amount_raw,
        "saweria_username": saweria_username,
        "saweria_apikey": userId
    };
    return daa;
}

/**
 * Creates a payment QR code for a specified Saweria user.
 *
 * @param {string} saweria_username - The username of the Saweria account. saweria.co/aisbirpedia
 * @param {string} path - The path where the QR code image will be saved.
 * @param {Object} options - The options for the payment.
 * @param {number} options.amount - The amount to be paid (minimum 1000).
 * @param {string} options.message - The message to be included with the payment.
 * @throws {Error} If any required parameter is missing or if the amount is less than 1000.
 * @returns {Promise<Object>} An object containing payment details and the generated QR code.
 */
async function createPaymentQr(saweria_username,{ amount }) {
    if (!saweria_username || !amount ) {
        throw new Error('Parameter Is Missing!');
    }
    if (amount < 1000) {
        throw new Error('Minimum Amount Is 5000');
    }
    const pesan = listpesan[Math.floor(Math.random() * listpesan.length)];
    logdebug(`Mengambil Data Saweria saweria.co/${saweria_username}`)
    const response = await axios.get(`${frontUrl}/${saweria_username}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
    });
    const $ = cheerio.load(response.data);
    const nextDataScript = $('#__NEXT_DATA__').html();
    if (!nextDataScript) {
        logdebug('Akun saweria ini tidak aktif atau tidak ditemukan')
        throw new Error('Akun Saweria Tidak Ditemukan');
    }
    const nextData = JSON.parse(nextDataScript);
    const userId = nextData?.props?.pageProps?.data?.id;
    if (!userId) {
        logdebug('Akun saweria ini tidak aktif atau tidak ditemukan')
        throw new Error('Akun Saweria Tidak Ditemukan');
    }
    const p = await randomUser('simple');

    const username = p.username;
    const ps = await axios.post(`${baseUrl}/donations/${userId}`, {
        "agree": true,
        "notUnderage": true,
        "message": pesan,
        "amount": parseInt(amount),
        "payment_type": "qris",
        "vote": "",
        "currency": "IDR",
        "customer_info": {
            "first_name": "",
            "email": `${username}@gmail.com`,
            "phone": ""
        }
    });
    const pc = ps.data.data;
    const qr = await createQr(pc.qr_string);
    const daa = {
        "author": "@sumshiiy",
        "trx_id": pc.id,
        "message": pesan,
        "amount": amount,
        "qr_string": pc.qr_string,
        "created_at": pc.created_at,
        "invoice_url": `https://saweria.co/qris/${pc.id}`,
        "total_dibayar": pc.amount_raw,
        "saweria_username": saweria_username,
        "saweria_apikey": userId,
        "qr_image": qr.url
    };
    return daa;
}

module.exports = { createPaymentString, createPaymentQr };
