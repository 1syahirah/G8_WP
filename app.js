const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static files like CSS and JS
app.use(express.static(path.join(__dirname, 'public')));

// Route
app.get('/login', (req, res) => {
    res.render('login');
});

// Start server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});