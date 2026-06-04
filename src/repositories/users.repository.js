const pool = require('../config/database');

const COLUMNS = 'id, username, email, full_name, phone, is_active, created_at, updated_at';

const findAll = async ({ limit, offset, is_active }) => {
  const params = [];
  let where = '';

  if (is_active !== undefined) {
    params.push(is_active);
    where = `WHERE is_active = $${params.length}`;
  }

  params.push(limit, offset);

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT ${COLUMNS}
       FROM user_management.users
       ${where}
       ORDER BY id ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    ),
    pool.query(
      `SELECT COUNT(*) AS total FROM user_management.users ${where}`,
      is_active !== undefined ? [is_active] : []
    )
  ]);

  return { rows: dataResult.rows, total: parseInt(countResult.rows[0].total, 10) };
};

const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM user_management.users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ username, email, full_name, phone = '', is_active = true }) => {
  const { rows } = await pool.query(
    `INSERT INTO user_management.users (username, email, full_name, phone, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUMNS}`,
    [username.trim(), email.trim().toLowerCase(), full_name.trim(), (phone || '').trim(), is_active]
  );
  return rows[0];
};

const update = async (id, fields) => {
  const ALLOWED_KEYS = ['username', 'email', 'full_name', 'phone', 'is_active'];
  const setClauses = [];
  const params = [];

  for (const key of ALLOWED_KEYS) {
    if (fields[key] === undefined) continue;
    const val = typeof fields[key] === 'string' ? fields[key].trim() : fields[key];
    params.push(key === 'email' ? val.toLowerCase() : val);
    setClauses.push(`${key} = $${params.length}`);
  }

  params.push(id);
  const { rows } = await pool.query(
    `UPDATE user_management.users
     SET ${setClauses.join(', ')}
     WHERE id = $${params.length}
     RETURNING ${COLUMNS}`,
    params
  );
  return rows[0] || null;
};

const remove = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM user_management.users WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows[0] || null;
};

module.exports = { findAll, findById, create, update, remove };
