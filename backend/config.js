//basic setup = load necessary packages
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Review = require('./models/Review'); 

const app = express();

//middleware
app.use(cors()); //safari block this
// Add this instead of simple app.use(cors())
// const corsOptions = {
//   origin: "127.0.0.1:5500",  // This is where Live Server runs
//   methods: "GET,POST,PUT,DELETE",
//   allowedHeaders: "Content-Type",
//   credentials: true
// };

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 5000;

//mongoDB connection
const mongodburi = "mongodb+srv://TerraGo:terrago123@cluster0.9deb0ii.mongodb.net/terragodb?retryWrites=true&w=majority";

mongoose.connect(mongodburi, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
}).catch((error) => {
    console.error('Connection error', error.message);
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
//create register (POST)
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ username, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//create login (POST)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        // 2. Hardcoded JWT Secret
        jwt.sign(
            payload,
            'secret_key', // Hardcoded secret for signing the token
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST endpoint for submitting reviews
// Create review (POST)
//still error, smtg with the cors (?) data express etc
app.post('/api/reviews', async (req, res) => {
    const { username, review } = req.body;

    if (!username || !review) {
        return res.status(400).json({ msg: 'Missing username or review' });
    }

    try {
        const newReview = new Review({ username, review });
        await newReview.save();
        res.status(201).json({ msg: 'Review submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get all reviews (GET)
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
