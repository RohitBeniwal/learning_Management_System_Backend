const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Progress must belong to a user']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Progress must belong to a course']
  },
  completedLessons: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  }],
  quizResults: [{
    quiz: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quiz'
    },
    score: Number,
    passed: Boolean,
    completedAt: Date
  }],
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completionPercentage: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date
});

// Populate user and course when finding progress
progressSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email'
  }).populate({
    path: 'course',
    select: 'title'
  });
  next();
});

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;