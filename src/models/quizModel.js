const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A quiz must have a title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'A quiz must belong to a course']
  },
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  },
  questions: [{
    question: {
      type: String,
      required: [true, 'A question must have content']
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer'],
      default: 'multiple-choice'
    },
    points: {
      type: Number,
      default: 1
    }
  }],
  timeLimit: {
    type: Number, // in minutes
    default: 0 // 0 means no time limit
  },
  passingScore: {
    type: Number,
    default: 70 // percentage
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update the updatedAt field on save
quizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;