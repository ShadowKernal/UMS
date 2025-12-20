-- Seed a first admin user for prodprepmaster.
-- Replace the placeholders before running in Neon SQL Editor.
-- Generate a bcrypt hash from your password:
--   node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('YOUR_PASSWORD',10))"

INSERT INTO users (
  id,
  email,
  email_norm,
  email_verified_at,
  password_hash,
  status,
  display_name,
  created_at,
  updated_at,
  last_login_at
) VALUES (
  '0ab98073-d552-48ff-88f6-a069bfac2837',
  'admin@example.com',
  'admin@example.com',
  EXTRACT(EPOCH FROM NOW())::INTEGER,
  '$2a$10$TOEfUFP.glLfK1msNCMazuJ3kASOKg6Z2WdxBdTrsrBfnRiOdsXTe',
  'ACTIVE',
  'Admin',
  EXTRACT(EPOCH FROM NOW())::INTEGER,
  EXTRACT(EPOCH FROM NOW())::INTEGER,
  NULL
);

INSERT INTO user_roles (user_id, role_name, assigned_by_user_id, assigned_at)
VALUES ('0ab98073-d552-48ff-88f6-a069bfac2837', 'ADMIN', NULL, EXTRACT(EPOCH FROM NOW())::INTEGER);
