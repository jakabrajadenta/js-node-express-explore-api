const logger = require('../utils/logger');
const userService = require('../services/users.service');
const { validateCreateUser, validateUpdateUser } = require('../validators/users.validator');
const { success, error } = require('../utils/response');

const getUsers = async (req, res, next) => {
  const log = logger.child({ traceId: req.traceId });
  try {
    const { page, limit, is_active } = req.query;
    const result = await userService.getUsers({ page, limit, is_active }, log);
    return success(res, result, 'Users retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  const log = logger.child({ traceId: req.traceId });
  try {
    const user = await userService.getUserById(req.params.id, log);
    return success(res, user, 'User retrieved successfully');
  } catch (err) {
    if (err.statusCode) return error(res, err.message, err.statusCode);
    next(err);
  }
};

const createUser = async (req, res, next) => {
  const log = logger.child({ traceId: req.traceId });
  try {
    const validationErrors = validateCreateUser(req.body);
    if (validationErrors.length) return error(res, 'Validation failed', 422, validationErrors);

    const user = await userService.createUser(req.body, log);
    return success(res, user, 'User created successfully', 201);
  } catch (err) {
    if (err.statusCode) return error(res, err.message, err.statusCode);
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  const log = logger.child({ traceId: req.traceId });
  try {
    const validationErrors = validateUpdateUser(req.body);
    if (validationErrors.length) return error(res, 'Validation failed', 422, validationErrors);

    const user = await userService.updateUser(req.params.id, req.body, log);
    return success(res, user, 'User updated successfully');
  } catch (err) {
    if (err.statusCode) return error(res, err.message, err.statusCode);
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  const log = logger.child({ traceId: req.traceId });
  try {
    await userService.deleteUser(req.params.id, log);
    return success(res, null, 'User deleted successfully');
  } catch (err) {
    if (err.statusCode) return error(res, err.message, err.statusCode);
    next(err);
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
