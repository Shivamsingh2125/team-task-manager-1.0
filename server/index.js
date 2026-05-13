require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Initialize Express
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Production Frontend
if (process.env.NODE_ENV === 'production') {

  // Static folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // React/Vite frontend route
  app.use((req, res) => {
    res.sendFile(
      path.resolve(__dirname, '../client/dist/index.html')
    );
  });

} else {

  // Development Route
  app.get('/', (req, res) => {
    res.send('API is running...');
  });

}

// Error Middleware
app.use((err, req, res, next) => {

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production'
      ? null
      : err.stack,
  });

});

// Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});