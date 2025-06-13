// Load environment variables from a .env file (if present)
require('dotenv').config();

// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer'); // For file uploads
const fs = require('fs'); // For file system operations
const { type } = require('os');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Initialize the Express application
const app = express();

// --- Middleware Setup ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data
app.use(cookieParser());

// --- File Upload Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// --- Frontend Serving Configuration ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// --- MongoDB Connection ---
const PORT = process.env.PORT || 3000;
const MONGODB_URI = "mongodb+srv://TerraGo:terrago123@cluster0.9deb0ii.mongodb.net/terragodb?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    });

// --- User Schema and Model ---
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: String
    },
    phoneNumber: {
        type: String
    }
});

const User = mongoose.model('User', userSchema, 'users');

// --- View Routes ---
app.get('/register', (req, res) => {
    res.render('register', { error: null, formData: null });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/profileManagement', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('profileManagement', { user });
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).send('Server error');
    }
});

app.get('/carbonFootprint', (req, res) => {
    res.render('carbonFootprint');
});

app.get('/travelPlanner', (req, res) => {
    res.render('travelPlanner');
});

app.get('/weatherModule', (req, res) => {
    res.render('weatherModule');
});

app.get('/logout', (req, res) => {
    res.clearCookie('token'); // clear the JWT token cookie
    res.redirect('/login');   // redirect to login page (or use '/' for home)
});


// --- API Routes ---
app.post('/register', upload.single('profilePic'), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const profilePicPath = req.file ? '/uploads/' + req.file.filename : null;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Remove uploaded file if user already exists
            if (req.file) fs.unlinkSync(req.file.path);
            return res.render('register', {
                error: 'Email already exists',
                formData: req.body
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profilePic: profilePicPath
        });

        await newUser.save();
        res.redirect('/login?registration=success');
    } catch (error) {
        // Remove uploaded file if error occurs
        if (req.file) fs.unlinkSync(req.file.path);
        console.error('Registration error:', error);
        res.render('register', {
            error: 'Registration failed. Please try again.',
            formData: req.body
        });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { userId: user._id };
        const token = jwt.sign(payload, 'secret_key', { expiresIn: '1h' });

        res
            .cookie('token', token, {
                httpOnly: true,
                maxAge: 3600000 // 1 hour
            })
            .json({ msg: 'Login successful' });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).send('Server error during login');
    }
});

app.post('/updateProfilePic', authenticateUser, upload.single('profilePic'), async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Save new profile picture path
        user.profilePic = '/uploads/' + req.file.filename;
        await user.save();

        res.redirect('/profileManagement');
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).send('Failed to update profile picture');
    }
});

function authenticateUser(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, 'secret_key');
        req.userId = decoded.userId;
        next();
    } catch (err) {
        console.error('JWT verification failed:', err);
        res.redirect('/login');
    }
}