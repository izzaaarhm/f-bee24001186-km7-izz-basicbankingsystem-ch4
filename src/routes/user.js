const express = require('express');
const router = express.Router();
const User = require('../services/users');
const { userSchema } = require('../middleware/validation');
const { authJWT } = require('../middleware/auth');
const Notification = require('../libs/socket');

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
        Notification.push('notification', `Selamat Datang ${newUser.name}!`);
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Error in /register:', err);
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

    if (!email || !password) {
        return res.status(400).json({ error: 'Email dan password diperlukan.' });
    }

    try {
        const userInstance = new User();
        const result = await userInstance.login(email, password);
        res.json(result);
    } catch (err) {
        console.error('Error in /login:', err);
        res.status(401).json({ error: err.message });
    }
});

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { title: 'Lupa Password' });
});

/**
 * @swagger
 * /api/v1/users/forgot-password:
 *   post:
 *     summary: Mengirimkan link reset password
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
 *     responses:
 *       200:
 *         description: Link reset password berhasil dikirim
 *       404:
 *         description: Email tidak ditemukan
 */
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email diperlukan.' });
    }

    try {
        const userInstance = new User();
        const result = await userInstance.forgotPassword(email);
        res.json(result);
    } catch (err) {
        console.error('Error in /forgot-password:', err);
        res.status(404).json({ error: err.message });
    }
});

router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    res.render('reset-password', { title: 'Reset Password', token });
});

/**
 * @swagger
 * /api/v1/users/reset-password/{token}:
 *   post:
 *     summary: Mereset password menggunakan token
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token reset password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password berhasil direset
 *       400:
 *         description: Token tidak valid atau kadaluarsa
 */
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }

    try {
        const userInstance = new User();
        const result = await userInstance.resetPassword(token, password);
        Notification.push('notification', 'Password berhasil direset');
        res.json(result);
    } catch (err) {
        console.error('Error in /reset-password:', err);
        res.status(400).json({ error: err.message });
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
 */
router.get('/getUsers', authJWT, async (req, res) => {
    const userInstance = new User();
    try {
        const users = await userInstance.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error('Error in /getUsers:', err);
        res.status(500).json({ error: 'Gagal menampilkan user, coba lagi nanti.' });
    }
});

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   get:
 *     summary: Menampilkan user berdasarkan ID
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
    } catch (err) {
        console.error('Error in /:userId:', err);
        res.status(500).json({ error: 'Gagal menampilkan user, coba lagi nanti.' });
    }
});

module.exports = router;