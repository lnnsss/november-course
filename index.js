import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from "mongoose";
import {validationResult} from "express-validator";
import {registerValidation} from './validations/auth.js';
import UserModel from './models/User.js';

const PORT = process.env.PORT || 3001;
const MongoDBURL = 'mongodb+srv://bezborodnikovtimur:Nbveh2006!@cluster0.4djks.mongodb.net/november?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MongoDBURL)
    .then(() => console.log('Connected to DB'))
    .catch(err => console.log('DB Error', err));

const app = express();

app.use(express.json());

app.post('/auth/login', async (req, res) => {
    try {
        const user = await UserModel.findOne({email: req.body.email});
        if (!user) {
            return res.status(404).json({
                message: 'Польщователь не найден',
            })
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
        if (!isValidPass) {
            return res.status(400).json({
                message: 'Неверный логин или пароль',
            })
        }

        const token = jwt.sign({
            _id: user._id,
        }, 'secret123', {
            expiresIn: '24h',
        })

        const {passwordHash, ...userData} = user._doc;

        res.json({...userData, token});
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось авторизоваться',
        })
    }
})

app.post('/auth/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash,
        });

        const user = await doc.save();

        const token = jwt.sign({
            _id: user._id,
        }, 'secret123', {
            expiresIn: '24h',
        })

        const {passwordHash, ...userData} = user._doc;

        res.json({...userData, token});
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось зарегистрироваться',
        })
    }
});

app.get('/auth/me', (req, res) => {
    try {
        
    } catch (err) {
        
    }
})

app.listen(PORT, (err) => {
    if(err) {
        return console.error(err);
    }
    console.log(`Listening on port ${PORT}`);
})