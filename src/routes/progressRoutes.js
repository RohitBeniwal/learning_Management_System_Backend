const express = require('express');
const progressController = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

// Get user's progress for all courses
router.get('/', progressController.getUserProgress);

// Get user's progress for a specific course
router.get('/courses/:courseId', progressController.getCourseProgress);

// Get all students' progress for a course (instructors and admins only)
router.get('/instructor/courses/:courseId', 
  authMiddleware.restrictTo('instructor', 'admin'),
  progressController.getInstructorCourseProgress
);

module.exports = router;