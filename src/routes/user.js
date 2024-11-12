const express = require('express');
const router = express.Router();
const User = require('../services/users');
const { userSchema } = require('../middleware/validation');
const { authJWT } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Membuat user baru
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               profile:
 *                 type: object
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 *       400:
 *         description: Input tidak valid
 *       409:
 *         description: Email sudah digunakan
 *       500:
 *         description: Kesalahan server
 */

router.post('/register', async (req, res) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, profile } = req.body;
    const user = new User(name, email, password, profile);

    try {
        const existingUser = await user.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email sudah digunakan' });
        }

        const newUser = await user.register();
        res.status(201).json(newUser);
    } catch {
        res.status(500).json({ error: 'Gagal mendaftarkan user, coba lagi nanti.' });
    }
});


/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Berhasil login
 *       401:
 *         description: Email atau password salah
 */

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const userInstance = new User();
      const result = await userInstance.login(email, password);
      res.json(result);
    } catch (err) {
      console.error(err); // Log the error for debugging purposes
      res.status(401).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Menampilkan semua user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar user
 *       500:
 *         description: Kesalahan server
 */

router.get('/getUsers', authJWT, async (req, res) => {
    const userInstance = new User(); 
    try {
        const users = await userInstance.getAllUsers();
        res.json(users);
    } catch {
        res.status(500).json({ error: 'Gagal menampilkan user, coba lagi nanti.' });
    }
});

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   get:
 *     summary: Menampillkan user berdasarkan ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan user
 *       404:
 *         description: User tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */

router.get('/:userId', authJWT, async (req, res) => {
    const { userId } = req.params;
    const userInstance = new User();

    try {
        const user = await userInstance.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }
        res.json(user);
    } catch {
        res.status(500).json({ error: 'User tidak ditemukan, coba lagi nanti.' });
    }
});

module.exports = router;
