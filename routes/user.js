const express = require('express');
const router = express.Router();
const User = require('../services/users');
const { userSchema } = require('../services/validation');

router.post('/', async (req, res) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, profile } = req.body;

    const user = new User(name, email, password, profile);

    try {
        const newUser = await user.register();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    const userInstance = new User(); 
    try {
        const users = await userInstance.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    const userInstance = new User();
    try {
        const user = await userInstance.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
