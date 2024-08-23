require('dotenv').config();

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const accessTokenSecret = process.env.ACCESS_TOKEN_KEY;
const refreshTokenSecret = process.env.REFRESH_TOKEN_KEY;

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Create a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *                 example: username
 *               password: 
 *                 type: string
 *                 example: P@ssw0rd
 *     responses:
 *       200:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string    
 *       400:
 *         description: Bad request
 */
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if(!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if(user.password !== req.body.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const accessToken = jwt.sign({ userId: user._id, displayName:user.displayName }, accessTokenSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id, displayName:user.displayName }, refreshTokenSecret, { expiresIn: '7y' });
        console.log(accessToken);
        console.log(refreshToken);
        res.json({
            accessToken,
            refreshToken
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;