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

app.get('/travelPlanner', (req, res) => {
    res.render('travelPlanner');
});

app.get('/carbonFootprint', (req, res) => {
    res.render('carbonFootprint');
});

app.get('/profileManagement', (req, res) => {
    res.render('profileManagement');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});