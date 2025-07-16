const express = require('express');
const courseController = require('../controllers/courseController');
const lessonController = require('../controllers/lessonController');
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourse);

// Protect all routes after this middleware
router.use(authMiddleware.protect);

// Enroll in a course
router.post('/:id/enroll', courseController.enrollCourse);

// Create a new course (instructors and admins only)
router.post('/', 
  authMiddleware.restrictTo('instructor', 'admin'),
  courseController.createCourse
);

// Update and delete course (instructors of the course and admins only)
router.route('/:id')
  .patch(courseController.updateCourse)
  .delete(courseController.deleteCourse);

// Lesson routes
router.route('/:courseId/lessons')
  .get(lessonController.getAllLessons)
  .post(
    authMiddleware.restrictTo('instructor', 'admin'),
    lessonController.createLesson
  );

// Quiz routes
router.route('/:courseId/quizzes')
  .get(quizController.getAllQuizzes)
  .post(
    authMiddleware.restrictTo('instructor', 'admin'),
    quizController.createQuiz
  );

module.exports = router;