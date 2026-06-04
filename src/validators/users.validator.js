const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateCreateUser = (body) => {
  const errors = [];

  if (!body.username || typeof body.username !== 'string' || !body.username.trim()) {
    errors.push({ field: 'username', message: 'Required, must be a non-empty string' });
  } else if (body.username.trim().length > 50) {
    errors.push({ field: 'username', message: 'Must not exceed 50 characters' });
  }

  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Required, must be a non-empty string' });
  } else if (!EMAIL_RE.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'Must be a valid email address' });
  } else if (body.email.trim().length > 255) {
    errors.push({ field: 'email', message: 'Must not exceed 255 characters' });
  }

  if (!body.full_name || typeof body.full_name !== 'string' || !body.full_name.trim()) {
    errors.push({ field: 'full_name', message: 'Required, must be a non-empty string' });
  } else if (body.full_name.trim().length > 255) {
    errors.push({ field: 'full_name', message: 'Must not exceed 255 characters' });
  }

  if (body.phone !== undefined && body.phone !== null) {
    if (typeof body.phone !== 'string') {
      errors.push({ field: 'phone', message: 'Must be a string' });
    } else if (body.phone.trim().length > 20) {
      errors.push({ field: 'phone', message: 'Must not exceed 20 characters' });
    }
  }

  if (body.is_active !== undefined && body.is_active !== null) {
    if (typeof body.is_active !== 'boolean') {
      errors.push({ field: 'is_active', message: 'Must be a boolean (true or false)' });
    }
  }

  return errors;
};

const validateUpdateUser = (body) => {
  const errors = [];
  const ALLOWED = ['username', 'email', 'full_name', 'phone', 'is_active'];

  if (!ALLOWED.some((f) => body[f] !== undefined)) {
    errors.push({ field: 'body', message: 'At least one field must be provided for update' });
    return errors;
  }

  if (body.username !== undefined) {
    if (typeof body.username !== 'string' || !body.username.trim()) {
      errors.push({ field: 'username', message: 'Must be a non-empty string' });
    } else if (body.username.trim().length > 50) {
      errors.push({ field: 'username', message: 'Must not exceed 50 characters' });
    }
  }

  if (body.email !== undefined) {
    if (typeof body.email !== 'string' || !body.email.trim()) {
      errors.push({ field: 'email', message: 'Must be a non-empty string' });
    } else if (!EMAIL_RE.test(body.email.trim())) {
      errors.push({ field: 'email', message: 'Must be a valid email address' });
    } else if (body.email.trim().length > 255) {
      errors.push({ field: 'email', message: 'Must not exceed 255 characters' });
    }
  }

  if (body.full_name !== undefined) {
    if (typeof body.full_name !== 'string' || !body.full_name.trim()) {
      errors.push({ field: 'full_name', message: 'Must be a non-empty string' });
    } else if (body.full_name.trim().length > 255) {
      errors.push({ field: 'full_name', message: 'Must not exceed 255 characters' });
    }
  }

  if (body.phone !== undefined) {
    if (typeof body.phone !== 'string') {
      errors.push({ field: 'phone', message: 'Must be a string' });
    } else if (body.phone.trim().length > 20) {
      errors.push({ field: 'phone', message: 'Must not exceed 20 characters' });
    }
  }

  if (body.is_active !== undefined) {
    if (typeof body.is_active !== 'boolean') {
      errors.push({ field: 'is_active', message: 'Must be a boolean (true or false)' });
    }
  }

  return errors;
};

module.exports = { validateCreateUser, validateUpdateUser };
