const multer = require('multer');   
const path = require('path');
const fs = require('fs');

const generateFileName = (req, file, cb) => {
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
};

const generateStorage = (folder) => {
    const dir = path.join(__dirname, folder);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, dir);
        },
        filename: generateFileName
    });
}

module.exports = { 
    image: multer({ 
        storage: generateStorage('public/images'),
        limits: {fileSize: 5 * 1024 * 1024},
        fileFilter: (req, file, cb) => {
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                const err = new Error(`Hanya menerima file gambar dengan format ${allowedMimeTypes.join(', ')}`);
                cb(err, false);
            }
        }
    })
};