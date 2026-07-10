const Department = require('../models/Department');

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('head', 'name email phone');
    res.status(200).json({ success: true, departments });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, head } = req.body;
    const deptExists = await Department.findOne({ code: code.toUpperCase() });
    if (deptExists) {
      return res.status(400).json({ success: false, message: 'Department code already exists' });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      head: head || null,
    });

    res.status(201).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, description, head } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    if (name) department.name = name;
    if (code) department.code = code.toUpperCase();
    if (description !== undefined) department.description = description;
    if (head !== undefined) department.head = head || null;

    await department.save();
    res.status(200).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await department.deleteOne();
    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};
