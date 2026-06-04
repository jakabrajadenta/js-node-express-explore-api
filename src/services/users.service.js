const repo = require('../repositories/users.repository');

const makeError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getUsers = async ({ page, limit, is_active }, log) => {
  const pageNum  = Math.max(1, parseInt(page, 10)  || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset   = (pageNum - 1) * limitNum;

  const filter = {};
  if (is_active !== undefined) {
    filter.is_active = is_active === 'true' || is_active === true;
  }

  log.debug('Fetching users list', { page: pageNum, limit: limitNum, filter });
  const { rows, total } = await repo.findAll({ limit: limitNum, offset, ...filter });

  return {
    users: rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  };
};

const getUserById = async (id, log) => {
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) throw makeError('Invalid user ID', 400);

  log.debug('Fetching user by ID', { id: numId });
  const user = await repo.findById(numId);
  if (!user) throw makeError(`User with ID ${numId} not found`, 404);
  return user;
};

const createUser = async (data, log) => {
  log.debug('Creating user', { username: data.username, email: data.email });
  try {
    return await repo.create(data);
  } catch (err) {
    if (err.code === '23505') {
      const field = (err.detail || '').includes('username') ? 'username' : 'email';
      throw makeError(`The ${field} is already taken`, 409);
    }
    throw err;
  }
};

const updateUser = async (id, data, log) => {
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) throw makeError('Invalid user ID', 400);

  log.debug('Updating user', { id: numId, fields: Object.keys(data) });

  const existing = await repo.findById(numId);
  if (!existing) throw makeError(`User with ID ${numId} not found`, 404);

  try {
    return await repo.update(numId, data);
  } catch (err) {
    if (err.code === '23505') {
      const field = (err.detail || '').includes('username') ? 'username' : 'email';
      throw makeError(`The ${field} is already taken`, 409);
    }
    throw err;
  }
};

const deleteUser = async (id, log) => {
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) throw makeError('Invalid user ID', 400);

  log.debug('Deleting user', { id: numId });
  const deleted = await repo.remove(numId);
  if (!deleted) throw makeError(`User with ID ${numId} not found`, 404);
  return deleted;
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
