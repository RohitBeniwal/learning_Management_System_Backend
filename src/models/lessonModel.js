const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A lesson must have a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'A lesson must have content']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'A lesson must belong to a course']
  },
  order: {
    type: Number,
    required: [true, 'A lesson must have an order']
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  resources: [{
    name: String,
    file: String
  }],
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
lessonSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;