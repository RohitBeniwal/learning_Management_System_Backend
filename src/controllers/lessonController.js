const Lesson = require('../models/lessonModel');
const Course = require('../models/courseModel');
const Progress = require('../models/progressModel');

exports.getAllLessons = async (req, res) => {
  try {
    let filter = {};
    if (req.params.courseId) filter = { course: req.params.courseId };

    const lessons = await Lesson.find(filter).sort('order');

    res.status(200).json({
      status: 'success',
      results: lessons.length,
      data: {
        lessons
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'No lesson found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        lesson
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createLesson = async (req, res) => {
  try {
    // If courseId is in params, add it to req.body
    if (req.params.courseId) req.body.course = req.params.courseId;

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
        message: 'You do not have permission to add lessons to this course'
      });
    }

    // Get the highest order number and add 1
    const highestOrder = await Lesson.findOne({ course: req.body.course }).sort('-order');
    req.body.order = highestOrder ? highestOrder.order + 1 : 1;

    const newLesson = await Lesson.create(req.body);

    // Add lesson to course
    await Course.findByIdAndUpdate(req.body.course, {
      $push: { lessons: newLesson.id }
    });

    res.status(201).json({
      status: 'success',
      data: {
        lesson: newLesson
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'No lesson found with that ID'
      });
    }

    // Check if user is instructor of the course or admin
    const course = await Course.findById(lesson.course);

    if (req.user.role !== 'admin' && course.instructor.id !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this lesson'
      });
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        lesson: updatedLesson
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'No lesson found with that ID'
      });
    }

    // Check if user is instructor of the course or admin
    const course = await Course.findById(lesson.course);

    if (req.user.role !== 'admin' && course.instructor.id !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this lesson'
      });
    }

    await Lesson.findByIdAndDelete(req.params.id);

    // Remove lesson from course
    await Course.findByIdAndUpdate(lesson.course, {
      $pull: { lessons: lesson.id }
    });

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

exports.completeLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'No lesson found with that ID'
      });
    }

    // Find progress record
    let progress = await Progress.findOne({
      user: req.user.id,
      course: lesson.course
    });

    if (!progress) {
      return res.status(404).json({
        status: 'fail',
        message: 'You are not enrolled in this course'
      });
    }

    // Check if lesson is already completed
    if (progress.completedLessons.includes(lesson.id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Lesson already marked as completed'
      });
    }

    // Add lesson to completed lessons
    progress.completedLessons.push(lesson.id);

    // Update last accessed
    progress.lastAccessed = Date.now();

    // Calculate completion percentage
    const course = await Course.findById(lesson.course);
    const totalLessons = course.lessons.length;
    progress.completionPercentage = (progress.completedLessons.length / totalLessons) * 100;

    // Check if course is completed
    if (progress.completionPercentage === 100) {
      progress.completed = true;
      progress.completedAt = Date.now();
    }

    await progress.save();

    res.status(200).json({
      status: 'success',
      data: {
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