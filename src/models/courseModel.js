const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A course must have a title'],
    trim: true,
    maxlength: [100, 'A course title must have less or equal than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'A course must have a description'],
    trim: true
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A course must have an instructor']
  },
  category: {
    type: String,
    required: [true, 'A course must have a category'],
    trim: true
  },
  thumbnail: {
    type: String,
    default: 'default.jpg'
  },
  lessons: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  }],
  enrolledStudents: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for reviews
courseSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'course',
  localField: '_id'
});

// Middleware to update the updatedAt field on save
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Populate instructor when finding courses
courseSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'instructor',
    select: 'name email'
  });
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;