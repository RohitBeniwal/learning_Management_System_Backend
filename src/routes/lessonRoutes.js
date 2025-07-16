const express = require('express');
const lessonController = require('../controllers/lessonController');
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

router.route('/')
  .get(lessonController.getAllLessons);

router.route('/:id')
  .get(lessonController.getLesson)
  .patch(lessonController.updateLesson)
  .delete(lessonController.deleteLesson);

// Mark lesson as completed
router.post('/:id/complete', lessonController.completeLesson);

// Quiz routes for a specific lesson
router.route('/:lessonId/quizzes')
  .get(quizController.getAllQuizzes)
  .post(
    authMiddleware.restrictTo('instructor', 'admin'),
    quizController.createQuiz
  );

module.exports = router;