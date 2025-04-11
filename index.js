const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// In-memory storage
const users = [];
const exercises = [];

// Helper to generate simple IDs
let nextUserId = 1;

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  const newUser = {
    username: username,
    _id: nextUserId.toString()
  };
  
  nextUserId++;
  users.push(newUser);
  
  res.json({
    username: newUser.username,
    _id: newUser._id
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercise to a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;
  
  // Find user
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }
  
  // Create exercise
  const exerciseDate = date ? new Date(date) : new Date();
  
  const exercise = {
    userId: userId,
    description: description,
    duration: parseInt(duration),
    date: exerciseDate
  };
  
  exercises.push(exercise);
  
  // Format response
  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
    _id: user._id
  });
});

// Get user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  
  // Find user
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Filter exercises by user
  let userExercises = exercises.filter(e => e.userId === userId);
  
  // Apply date filters if provided
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(e => e.date >= fromDate);
  }
  
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(e => e.date <= toDate);
  }
  
  // Apply limit if provided
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }
  
  // Format log
  const log = userExercises.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  }));
  
  // Return response
  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  });
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
