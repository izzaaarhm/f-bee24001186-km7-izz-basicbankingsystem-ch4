const express = require('express');
const router = express.Router();
const multerConfig = require('../middleware/multer');
const mediaService = require('../services/media');

router.post('/upload', multerConfig.image.single('image'), async (req, res) => {
  try {
    const image = await mediaService.uploadImage(req, res);
    res.status(201).json(image);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
    try {
        const images = await mediaService.getAllImages();
        res.status(200).json(images);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

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

//DELETE
router.delete('/:imageId', async (req, res) => {
  try {
    const result = await mediaService.deleteImage(req.params.imageId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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