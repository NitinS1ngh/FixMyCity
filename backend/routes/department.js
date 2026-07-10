const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, restrictTo } = require('../middleware/auth');

router.route('/')
  .get(protect, getDepartments)
  .post(protect, restrictTo('admin'), createDepartment);

router.route('/:id')
  .put(protect, restrictTo('admin'), updateDepartment)
  .delete(protect, restrictTo('admin'), deleteDepartment);

module.exports = router;
