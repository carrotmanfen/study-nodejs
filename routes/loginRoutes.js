require('dotenv').config();

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const RefreshTokenDto = require('../dtos/userRefreshTokenDto');
const LoginUserDto = require('../dtos/userLoginDto');

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
        const loginUserDto = new LoginUserDto(req.body);
        const errors = loginUserDto.validate();
        if(errors.length > 0) {
            return res.status(400).json({ errors });
        }
        const user = await User.findOne({ username: loginUserDto.username });
        if(!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if(user.password !== loginUserDto.password) {
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

/**
 * @swagger
 * /auth/refreshToken:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: The access token was successfully refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Refresh token is required
 */

router.post('/refreshToken', (req, res) => {
    const refreshTokenDto = new RefreshTokenDto(req.body);
    const errors = refreshTokenDto.validate();
    if(errors.length > 0) {
        return res.status(400).json({ errors });
    }
    if (!refreshTokenDto) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }
    const refreshToken = refreshTokenDto.refreshToken;
    jwt.verify(refreshToken, refreshTokenSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const newAccessToken = jwt.sign({ userId: user.userId, displayName: user.displayName }, accessTokenSecret, { expiresIn: '15m' });
        res.json({
            accessToken: newAccessToken
        });
    });
});


module.exports = router;