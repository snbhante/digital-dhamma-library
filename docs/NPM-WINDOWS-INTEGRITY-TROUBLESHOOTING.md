# npm Windows EINTEGRITY Troubleshooting

If `npm ci` reports:

```text
npm ERR! code EINTEGRITY
integrity checksum failed
```

and the affected package is `@next/env`, the most common cause is a corrupted npm cache or incomplete registry download.

## Clean procedure

From PowerShell:

```powershell
taskkill /F /IM node.exe
cd C:\Users\snbhante\VSCodeProjects\digital-dhamma-library
Remove-Item -Recurse -Force .\node_modules -ErrorAction SilentlyContinue
npm cache clean --force
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache" -ErrorAction SilentlyContinue
npm config set registry https://registry.npmjs.org/
npm cache verify
npm ci
```

If Windows reports `EPERM`, close VS Code and all Node processes, then retry PowerShell as Administrator.

Do **not** manually change the integrity hash in `package-lock.json`.

The lockfile should remain authoritative for the exact dependency tree.
