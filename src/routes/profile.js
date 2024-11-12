const express = require('express');
const router = express.Router();
const Profile = require('../services/profiles');
const { profileSchema } = require('../middleware/validation');

/**
 * @swagger
 * /api/v1/profiles:
 *   post:
 *     summary: Membuat profil baru
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               identityType:
 *                 type: string
 *               identityNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profil berhasil dibuat
 *       400:
 *         description: Input tidak valid
 *       500:
 *         description: Kesalahan server
 */
router.post('/', async (req, res) => {
    const { error } = profileSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { userId, identityType, identityNumber, address } = req.body;
    const profile = new Profile(userId, identityType, identityNumber, address);

    try {
        const newProfile = await profile.createProfile();
        res.status(201).json(newProfile); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/v1/profiles:
 *   get:
 *     summary: Menampilkan semua profil
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar profil
 *       500:
 *         description: Kesalahan server
 */

router.get('/', async (req, res) => {
    const profileInstance = new Profile();
    try {
        const profiles = await profileInstance.getAllProfiles();
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/v1/profiles/{profileId}:
 *   get:
 *     summary: Menampilkan profil berdasarkan ID
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID profil
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan profil
 *       404:
 *         description: Profil tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */

router.get('/:profileId', async (req, res) => {
    const { profileId } = req.params;

    const profileInstance = new Profile();
    try {
        const profile = await profileInstance.getProfileById(profileId);
        if (!profile) {
            return res.status(404).json({ error: 'Profile tidak ditemukan' });
        }
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;


