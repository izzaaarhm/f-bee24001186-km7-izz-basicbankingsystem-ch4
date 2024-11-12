const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const imagekit = require('../libs/imagekit');
const fs = require('fs');
const path = require('path');

class MediaService {

  async uploadImage(req, res) {
    try {
      const { title, description, userId } = req.body;
      const imageFile = req.file;

      if (!imageFile) {
        throw new Error('Tidak ada file gambar yang diunggah');
      }

      // Upload ke imagekit
      const imagePath = path.join(__dirname, '../', imageFile.path);
      const imageUpload = await imagekit.upload({
        file: fs.readFileSync(imagePath), // Membaca file untuk diunggah
        fileName: imageFile.filename,
        folder: '/images',
      });

      // Simpan data gambar di database
      const newImage = await prisma.image.create({
        data: {
          title,
          description,
          url: imageUpload.url,
          userId: parseInt(userId),
        },
      });

      // Hapus file lokal setelah diunggah ke imagekit
      fs.unlinkSync(imagePath);

      return res.json(newImage);
    } catch (error) {
      throw new Error(`Gagal mengunggah gambar: ${error.message}`);
    }
  }

  async getAllImages() {
    try {
      const images = await prisma.image.findMany();
      return images;
    } catch (error) {
      throw new Error(`Gagal mengambil semua gambar: ${error.message}`);
    }
  }

  async getImageById(imageId) {
    try {
      const image = await prisma.image.findUnique({
        where: { id: parseInt(imageId) },
        include: { user: true },
      });
      if (!image) throw new Error('Gambar tidak ditemukan');
      return image;
    } catch (error) {
      throw new Error(`Gagal mengambil gambar: ${error.message}`);
    }
  }

  async getImageByUserId(userId) {
    try {
      const images = await prisma.image.findMany({
        where: { userId: parseInt(userId) },
      });
      return images;
    } catch (error) {
      throw new Error(`Gagal mengambil gambar berdasarkan user: ${error.message}`);
    }
  }

  // Fungsi untuk menghapus gambar berdasarkan ID
  async deleteImage(imageId) {
    try {
      const image = await prisma.image.findUnique({
        where: { id: parseInt(imageId) },
      });
      if (!image) throw new Error('Gambar tidak ditemukan');

      // Hapus dari ImageKit berdasarkan fileId
      const fileId = image.url.split('/').pop().split('.')[0]; // Mendapatkan fileId dari URL
      await imagekit.deleteFile(fileId);

      // Hapus dari database
      await prisma.image.delete({
        where: { id: parseInt(imageId) },
      });
      return { message: 'Gambar berhasil dihapus' };
    } catch (error) {
      throw new Error(`Gagal menghapus gambar: ${error.message}`);
    }
  }

  // Fungsi untuk mengedit informasi gambar
  async editImage(imageId, title, description) {
    try {
      const updatedImage = await prisma.image.update({
        where: { id: parseInt(imageId) },
        data: { title, description },
      });
      return updatedImage;
    } catch (error) {
      throw new Error(`Gagal mengedit gambar: ${error.message}`);
    }
  }
}

module.exports = new MediaService();
