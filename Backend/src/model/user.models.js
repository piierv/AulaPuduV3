const { getSql } = require('../data/data');

async function getProfile(userId) {
  const sql = getSql();
  const rows = await sql/*sql*/`
    select id, email, profile_data, specialization, created_at, updated_at
    from public.users
    where id = ${userId}
    limit 1;
  `;
  return rows[0] || null;
}

async function upsertProfile({ id, email, profile_data, specialization }) {
  const sql = getSql();
  const rows = await sql/*sql*/`
    insert into public.users (id, email, profile_data, specialization)
    values (${id}, ${email}, ${profile_data}, ${specialization})
    on conflict (id) do update
    set email          = excluded.email,
        profile_data   = coalesce(excluded.profile_data, public.users.profile_data),
        specialization = coalesce(excluded.specialization, public.users.specialization)
    returning id, email, profile_data, specialization, created_at, updated_at;
  `;
  return rows[0];
}

module.exports = { getProfile, upsertProfile };
