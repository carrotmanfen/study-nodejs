require('dotenv').config();

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const UpdateUserDto = require('../dtos/userUpdateDto');
const CreateUserDto = require('../dtos/userCreateDto');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - date
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         displayName:
 *           type: string
 *           description: The name of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *       example:
 *         displayName: name
 *         username: username
 *         password: P@ssw0rd
 */

/**
 * @swagger
 * /users/create:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 */
router.post('/create', async (req, res) => {
    const createUserDto = new CreateUserDto(req.body);
    const errors = createUserDto.validate();
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    const account = await User.findOne({ $or: [{username: createUserDto.username},{displayName:createUserDto.displayName}]});
    if (account) {
        if(account.username === createUserDto.username) {
            return res.status(400).json({ message: 'Username already exists' });
        }else {
            return res.status(400).json({ message: 'Display name already exists' });
        }
    }
    const newUser = new User(createUserDto);
    try {
        const savedUser = await newUser.save();
        res.json(savedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /users/get/me:
 *   get:
 *     summary: Get user by accessToken
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 displayName:
 *                   type: string
 *                 username:
 *                   type: string
 *                 password:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/get/me', authMiddleware, async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.sendStatus(401).json({ message: 'Unauthorized' });
        }
        const accessTokenSecret = process.env.ACCESS_TOKEN_KEY;
        jwt.verify(token, accessTokenSecret, async (err, user) => {
            if (err) {
                return res.sendStatus(401).json({ message: 'Unauthorized' });
            }

            const users = await User.findOne({ _id: user.userId });
            if (!users) {
                return res.status(400).json({ message: 'User not found' });
            }
            res.json(users);
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /users/update/me:
 *  patch:
 *    summary: Update user profile using accessToken
 *    tags: [User]
 *    requestBody:
 *      required: false
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              displayName:
 *                type: string
 *                description: The display name of the user
 *              username:
 *                type: string
 *                description: The username of the user
 *              password:
 *                type: string
 *                description: The password of the user
 *    responses:
 *      200:
 *        description: The user was successfully updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized - Invalid or missing access token
 */

router.patch('/update/me', authMiddleware, async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.sendStatus(401).json({ message: 'Unauthorized' });
        }
        const accessTokenSecret = process.env.ACCESS_TOKEN_KEY;
        jwt.verify(token, accessTokenSecret, async (err, user) => {
            if (err) {
                return res.sendStatus(401).json({ message: 'Unauthorized' });
            }

            const account = await User.findOne({ _id: user.userId });
            if (!account) {
                return res.status(400).json({ message: 'User not found' });
            }

            const updateUserDto = new UpdateUserDto(req.body);
            const errors = updateUserDto.validate();

            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            if (updateUserDto.displayName) {
                account.displayName = updateUserDto.displayName;
            }
            if (updateUserDto.username) {
                account.username = updateUserDto.username;
            }
            if (updateUserDto.password) {
                account.password = updateUserDto.password;
            }
            const updatedUser = await account.save();
            res.json(updatedUser);
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /users/delete/me:
 *   delete:
 *     summary: Delete user profile using accessToken
 *     tags: [User]
 *     responses:
 *       200:
 *         description: The user was successfully deleted
 *       401:
 *         description: Unauthorized - Invalid or missing access token
 *       500:
 *         description: Server error
 */

router.delete('/delete/me', authMiddleware, async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.sendStatus(401).json({ message: 'Unauthorized' });
        }
        const accessTokenSecret = process.env.ACCESS_TOKEN_KEY;
        jwt.verify(token, accessTokenSecret, async (err, user) => {
            if (err) {
                return res.sendStatus(401).json({ message: 'Unauthorized' });
            }

            const account = await User.findOne({ _id: user.userId });
            if (!account) {
                return res.status(400).json({ message: 'User not found' });
            }
            const result = await account.deleteOne({ _id: account._id }).exec()
            res.json({ message: 'User deleted successfully', result });
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;