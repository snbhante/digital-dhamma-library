insert into public.roles (name, description) values
('GUEST', 'Anonymous visitor'),
('READER', 'Authenticated reader'),
('CONTRIBUTOR', 'Can submit reviewed contributions'),
('TRANSLATOR', 'Translation contributor'),
('RESEARCHER', 'Research-oriented user'),
('EDITOR', 'Can review and publish approved content'),
('MODERATOR', 'Community moderation'),
('ADMIN', 'Application administrator'),
('SUPER_ADMIN', 'Full administrative control')
on conflict (name) do nothing;

insert into public.permissions (key, description) values
('content.read', 'Read public content'),
('content.create', 'Create content drafts'),
('content.edit', 'Edit content drafts'),
('content.review', 'Review contributions'),
('content.publish', 'Publish approved content'),
('content.delete', 'Delete content'),
('dictionary.read', 'Read dictionary data'),
('dictionary.edit', 'Edit dictionary records'),
('media.create', 'Create media metadata'),
('media.edit', 'Edit media metadata'),
('media.delete', 'Delete media metadata'),
('user.read', 'Read user administration records'),
('user.edit', 'Edit user administration records'),
('user.suspend', 'Suspend users'),
('role.assign', 'Assign roles'),
('comment.moderate', 'Moderate comments'),
('source.manage', 'Manage source metadata'),
('license.manage', 'Manage license metadata')
on conflict (key) do nothing;
