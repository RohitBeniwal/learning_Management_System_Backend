const Quiz = require('../models/quizModel');
const Course = require('../models/courseModel');
const Progress = require('../models/progressModel');

exports.getAllQuizzes = async (req, res) => {
  try {
    let filter = {};
    if (req.params.courseId) filter = { course: req.params.courseId };
    if (req.params.lessonId) filter = { lesson: req.params.lessonId };

    const quizzes = await Quiz.find(filter);

    res.status(200).json({
      status: 'success',
      results: quizzes.length,
      data: {
        quizzes
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'No quiz found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        quiz
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    // If courseId is in params, add it to req.body
    if (req.params.courseId) req.body.course = req.params.courseId;
    if (req.params.lessonId) req.body.lesson = req.params.lessonId;

    // Check if course exists and user is instructor or admin
    const course = await Course.findById(req.body.course);

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'No course found with that ID'
      });
    }

    // Check if user is instructor of the course or admin
    if (req.user.role !== 'admin' && course.instructor.id !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to add quizzes to this course'
      });
    }

    const newQuiz = await Quiz.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        quiz: newQuiz
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'No quiz found with that ID'
      });
    }

    // Check if user is instructor of the course or admin
    const course = await Course.findById(quiz.course);

    if (req.user.role !== 'admin' && course.instructor.id !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this quiz'
      });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        quiz: updatedQuiz
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'No quiz found with that ID'
      });
    }

    // Check if user is instructor of the course or admin
    const course = await Course.findById(quiz.course);

    if (req.user.role !== 'admin' && course.instructor.id !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this quiz'
      });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'No quiz found with that ID'
      });
    }

    // Find progress record
    let progress = await Progress.findOne({
      user: req.user.id,
      course: quiz.course
    });

    if (!progress) {
      return res.status(404).json({
        status: 'fail',
        message: 'You are not enrolled in this course'
      });
    }

    // Check if quiz is already completed
    const quizResult = progress.quizResults.find(result => result.quiz.toString() === quiz.id);
    if (quizResult) {
      return res.status(400).json({
        status: 'fail',
        message: 'Quiz already completed'
      });
    }

    // Calculate score
    let score = 0;
    const answers = req.body.answers;

    quiz.questions.forEach((question, index) => {
      if (question.type === 'multiple-choice') {
        const correctOptionIndex = question.options.findIndex(option => option.isCorrect);
        if (answers[index] === correctOptionIndex) {
          score += question.points;
        }
      } else if (question.type === 'true-false') {
        const correctAnswer = question.options[0].isCorrect;
        if (answers[index] === correctAnswer) {
          score += question.points;
        }
      }
      // For short-answer, manual grading would be required
    });

    // Calculate percentage
    const totalPoints = quiz.questions.reduce((sum, question) => sum + question.points, 0);
    const percentage = (score / totalPoints) * 100;

    // Check if passed
    const passed = percentage >= quiz.passingScore;

    // Add quiz result to progress
    progress.quizResults.push({
      quiz: quiz.id,
      score: percentage,
      passed,
      completedAt: Date.now()
    });

    // Update last accessed
    progress.lastAccessed = Date.now();

    await progress.save();

    res.status(200).json({
      status: 'success',
      data: {
        score: percentage,
        passed,
        progress
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};