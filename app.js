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
const Review = require('./backend/models/Review');
const Transport = require('./backend/models/Transport');
const Favourite = require('./backend/models/Favourite');
const Accomodation = require('./backend/models/Accomodation');

// Initialize the Express application
const app = express();

// --- Middleware Setup ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

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
    phoneNum: {
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
        const { name, email, password, phoneNum } = req.body;
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
            profilePic: profilePicPath,
            phoneNum
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

// Route for deleting a profile
app.post('/deleteProfile', authenticateUser, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Optional: delete the profile picture file if it exists
        if (user.profilePic) {
            const filePath = path.join(__dirname, 'public', user.profilePic);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.clearCookie('token'); // Logout the user
        res.redirect('/register'); // Redirect to register or homepage
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).send('Error deleting profile');
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

// Route for changing password
app.post('/changePassword', authenticateUser, async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).send("User not found");

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).send("Current password is incorrect");

        if (newPassword !== confirmPassword)
            return res.status(400).send("New passwords do not match");

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        res.redirect('/profileManagement');
    } catch (err) {
        console.error("Password change error:", err);
        res.status(500).send("Server error");
    }
});

// update Username
app.post('/updateName', authenticateUser, async (req, res) => {
    const { newName } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).send('User not found');
        user.name = newName;
        await user.save();
        res.redirect('/profileManagement');
    } catch (err) {
        console.error('Name update error:', err);
        res.status(500).send('Failed to update name');
    }
});

// Update Email
app.post('/updateEmail', authenticateUser, async (req, res) => {
    const { newEmail } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).send('User not found');
        user.email = newEmail;
        await user.save();
        res.redirect('/profileManagement');
    } catch (err) {
        console.error('Email update error:', err);
        res.status(500).send('Failed to update email');
    }
});

// Update Phone Number
// app.post('/updatePhoneNumber', authenticateUser, async (req, res) => {
//     const { phoneNum } = req.body;
//     try {
//         const user = await User.findById(req.userId);
//         if (!user) return res.status(404).send('User not found');
//         user.phoneNum = phoneNum;
//         await user.save();
//         res.redirect('/profileManagement');
//     } catch (err) {
//         console.error('Phone number update error:', err);
//         res.status(500).send('Failed to update phone number');
//     }
// });
app.post('/updatePhoneNumber', authenticateUser, async (req, res) => {
    const { phoneNum } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).send('User not found');
        user.phoneNum = phoneNum;
        await user.save();
        res.redirect('/profileManagement');
    } catch (err) {
        console.error('Phone number update error:', err);
        res.status(500).send('Failed to update phone number');
    }
});



// POST endpoint for submitting reviews
// Create review (POST)
// POST endpoint for submitting reviews (with user authentication)
app.post('/api/reviews', authenticateUser, async (req, res) => {
    const { review } = req.body;

    if (!review) {
        return res.status(400).json({ msg: 'Missing review text' });
    }

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const newReview = new Review({
            username: user.name, // automatically pulls the logged-in user's name
            review: review
        });

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

//get transport
app.get('/api/transports', async (req, res) => {
    try {
        const transports = await Transport.find();
        res.json(transports);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/api/accomodation', async (req, res) => {
    try {
        const accomodation = await Accomodation.find();
        res.json(accomodation);
    } catch (err) {
        console.error("❌ Error fetching accommodations:", err);
        res.status(500).json({ error: 'Failed to fetch accomodation' });
    }
});

//get fav
app.get('/api/favourites', async (req, res) => {
    try {
        const favs = await Favourite.find();
        res.json(favs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch favourites' });
    }
});

//save to favourites
app.post('/api/favourites', async (req, res) => {
    const { name, type, image } = req.body;

    try {
        const existing = await Favourite.findOne({ name, type, image });

        if (existing) {
            return res.status(200).json({ message: 'Already in favourites', alreadySaved: true });
        }

        const favourite = new Favourite({ name, type, image });
        await favourite.save();

        res.status(201).json({ message: 'Favourite saved', alreadySaved: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save favourite' });
    }
});

//delete fav
app.delete('/api/favourites/:name', async (req, res) => {
    const { name } = req.params;
    const { type, image } = req.query; // optional filters

    try {
        // Build a query object
        const query = { name };
        if (type) query.type = type;
        if (image) query.image = image;

        const deleted = await Favourite.findOneAndDelete(query);

        if (!deleted) {
            return res.status(404).json({ message: 'Favourite not found' });
        }

        res.status(200).json({ message: 'Favourite removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete favourite' });
    }
});   