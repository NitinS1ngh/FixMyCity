const { body, validationResult } = require('express-validator');

const validateComplaint = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('category').notEmpty().withMessage('Category is required').trim(),
  body('location.address').notEmpty().withMessage('Address is required').trim(),
  body('location.ward').notEmpty().withMessage('Ward is required').trim(),
  body('location.area').notEmpty().withMessage('Area is required').trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateComplaint };
