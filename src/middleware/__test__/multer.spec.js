const multer = require('../multer');
const fs = require('fs');
const path = require('path');

describe('Multer Middleware', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should accept allowed image MIME types', async () => {
        const req = {};
        const file = { mimetype: 'image/jpeg' };
        const result = await new Promise((resolve, reject) => {
            multer.image.fileFilter(req, file, (err, accepted) => {
                if (err) reject(err);
                resolve({ err, accepted });
            });
        });
    
        expect(result.err).toBeNull();
        expect(result.accepted).toBe(true);
    });

    test('should reject disallowed file MIME types', async () => {
        const req = {};
        const file = { mimetype: 'application/pdf' };
        const result = await new Promise((resolve) => {
            multer.image.fileFilter(req, file, (err, accepted) => {
                if (err) {
                    resolve({ err, accepted: false });
                }
                resolve({ err, accepted });
            });
        });
    
        expect(result.err).toBeInstanceOf(Error);
        expect(result.err.message).toBe('Hanya menerima file gambar dengan format image/jpeg, image/png, image/jpg');
        expect(result.accepted).toBe(false);
    });       

    test('should limit file size to 5MB', () => {
        const limits = multer.image.limits;
        expect(limits.fileSize).toBe(5 * 1024 * 1024);
    });

    test('should generate a storage path and create the folder if not exists', async () => {
        const folderPath = path.join(__dirname, '../', 'public', 'images');
        console.log(folderPath);
        
        // Mock fs.existsSync dan fs.mkdirSync
        const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        const mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation((path, options) => {
            console.log('mkdirSync called with:', path, options); 
        });
    
        // Memanggil generateStorage untuk trigger pembuatan folder
        await new Promise((resolve, reject) => {
            multer.image.storage.getDestination({}, {}, (err, destination) => {
                if (err) reject(err);
                resolve(destination);
            });
        });
    
        expect(mkdirSyncSpy).toHaveBeenCalledWith(folderPath, { recursive: true });
    
        existsSyncSpy.mockRestore();
        mkdirSyncSpy.mockRestore();
    });
    
    test('should generate unique filename based on timestamp', async () => {
        const file = { originalname: 'test-image.jpg' };
        const req = {};
    
        const filename = await new Promise((resolve, reject) => {
            multer.image.storage.getFilename(req, file, (err, filename) => {
                if (err) reject(err);
                resolve(filename);
            });
        });
    
        expect(filename).toMatch(/^\d+\.jpg$/); // Timestamp dgn .jpg extension
    });    
});