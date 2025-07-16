const Progress = require('../models/progressModel');
const Course = require('../models/courseModel');

exports.getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id });

    res.status(200).json({
      status: 'success',
      results: progress.length,
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

exports.getCourseProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (!progress) {
      return res.status(404).json({
        status: 'fail',
        message: 'No progress found for this course'
      });
    }

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

exports.getInstructorCourseProgress = async (req, res) => {
  try {
    // Check if user is instructor of the course or admin
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'No course found with that ID'
      });
    }

    if (req.user.role !== 'admin' && course.instructor.id !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to view progress for this course'
      });
    }

    const progress = await Progress.find({ course: req.params.courseId });

    res.status(200).json({
      status: 'success',
      results: progress.length,
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