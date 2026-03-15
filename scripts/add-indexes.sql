create index if not exists applications_session_token_idx
  on applications (session_token);

create index if not exists applications_user_id_idx
  on applications (user_id);

create index if not exists applications_status_idx
  on applications (status);

create index if not exists applications_created_at_desc_idx
  on applications (created_at desc);
