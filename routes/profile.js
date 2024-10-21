const express = require('express');
const router = express.Router();
const Profile = require('../services/profiles');
const { profileSchema } = require('../services/validation');

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

router.get('/', async (req, res) => {
    const profileInstance = new Profile();
    try {
        const profiles = await profileInstance.getAllProfiles();
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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
