const express = require('express');
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

router.route('/')
  .get(quizController.getAllQuizzes);

router.route('/:id')
  .get(quizController.getQuiz)
  .patch(quizController.updateQuiz)
  .delete(quizController.deleteQuiz);

// Submit quiz answers
router.post('/:id/submit', quizController.submitQuiz);

module.exports = router;