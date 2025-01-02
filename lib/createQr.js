const qrcode = require('qrcode')
const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data')
const { join } = require('path')
function uploadToCatboxMoe(Path) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(Path)) return reject(new Error("File not Found"));
        try {
            const form = new FormData();
            form.append("reqtype", "fileupload");
            form.append("fileToUpload", fs.createReadStream(Path));

            const data = await axios({
                url: "https://catbox.moe/user/api.php",
                method: "POST",
                headers: {
                    ...form.getHeaders()
                },
                data: form
            });

            if (data.data) {
                fs.unlinkSync(Path);
                return resolve(data.data);
            } else {
                return reject(new Error("Unexpected API response structure"));
            }
        } catch (err) {
            return reject(new Error(String(err)));
        }
    });
}
const createQr = async (text, format = 'jpg') => {
    const filename = `${Date.now()}.${format}`;
    try {
        const filePath = join(__dirname, "/", filename);
        await qrcode.toFile(filePath, text, {
            width: 1020,
        });
        const url = await uploadToCatboxMoe(filePath);
        return {
            url:url
        };
    } catch (err) {
        console.error('Error creating QR code:', err);
        throw err;
    }
};

module.exports = {createQr}

