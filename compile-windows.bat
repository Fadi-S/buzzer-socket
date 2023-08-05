CALL npm run build
CALL node --experimental-sea-config sea-config.json
CALL node -e "require('fs').copyFileSync(process.execPath, 'dist/app.exe')"
CALL signtool remove /s dist/app.exe
CALL npx postject dist/app.exe NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2