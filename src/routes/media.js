const express = require('express');
const router = express.Router();
const multerConfig = require('../middleware/multer');
const mediaService = require('../services/media');

/**
 * @swagger
 * /api/v1/media/upload:
 *   post:
 *     summary: Upload gambar
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Gambar berhasil di-upload
 *       400:
 *         description: Gagal upload gambar
 */
router.post('/upload', multerConfig.image.single('image'), async (req, res) => {
  try {
    const image = await mediaService.uploadImage(req, res);
    res.status(201).json(image);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/media:
 *   get:
 *     summary: Mendapatkan semua gambar
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar gambar
 *       400:
 *         description: Gagal mendapatkan daftar gambar
 */
router.get('/', async (req, res) => {
    try {
        const images = await mediaService.getAllImages();
        res.status(200).json(images);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/v1/media/{imageId}:
 *   get:
 *     summary: Mendapatkan gambar berdasarkan ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID gambar
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan gambar
 *       404:
 *         description: Gambar tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get('/:imageId', async (req, res) => {
  try {
    const image = await mediaService.getImageById(req.params.imageId);
    if (!image) {
        return res.status(404).json({ error: 'Gambar tidak ditemukan' });
    }
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/media/user/{userId}:
 *   get:
 *     summary: Mendapatkan gambar berdasarkan ID user
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan gambar
 *       404:
 *         description: Gambar tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const images = await mediaService.getImageByUserId(req.params.userId);
    if (!images) {
      return res.status(404).json({ error: 'Gambar tidak ditemukan' });
    }
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/media/{imageId}:
 *   delete:
 *     summary: Menghapus gambar berdasarkan ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID gambar
 *     responses:
 *       200:
 *         description: Berhasil menghapus gambar
 *       500:
 *         description: Gagal menghapus gambar
 */
router.delete('/:imageId', async (req, res) => {
  try {
    const result = await mediaService.deleteImage(req.params.imageId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/media/{imageId}:
 *   put:
 *     summary: Mengedit informasi gambar berdasarkan ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID gambar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gambar berhasil di-update
 *       500:
 *         description: Gagal meng-update gambar
 */
router.put('/:imageId', async (req, res) => {
  try {
    const { title, description } = req.body;
    const updatedImage = await mediaService.editImage(req.params.imageId, title, description);
    res.json(updatedImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
