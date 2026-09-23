# RBAC and Permissions

Roles are bundles of permissions. Permissions are the real authorization boundary.

| Permission | Reader | Contributor | Translator | Researcher | Editor | Moderator | Admin |
|---|---:|---:|---:|---:|---:|---:|---:|
| content.read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| content.create | | ✓ | ✓ | | ✓ | | ✓ |
| content.edit | | own | own | | ✓ | | ✓ |
| content.review | | | | | ✓ | | ✓ |
| content.publish | | | | | ✓ | | ✓ |
| dictionary.read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| dictionary.edit | | | ✓ | | ✓ | | ✓ |
| media.create | | ✓ | ✓ | | ✓ | | ✓ |
| media.edit | | own | own | | ✓ | | ✓ |
| comment.moderate | | | | | | ✓ | ✓ |
| source.manage | | | | | ✓ | | ✓ |
| license.manage | | | | | ✓ | | ✓ |
| user.suspend | | | | | | | ✓ |
| role.assign | | | | | | | ✓ |

The production implementation should enforce privileged actions with database policies and/or server-side authorization, not merely hide buttons in the UI.
