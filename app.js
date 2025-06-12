const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static files like CSS and JS
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/weatherModule', (req, res) => {
    res.render('weatherModule');
});

// Start server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});