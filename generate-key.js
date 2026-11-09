// generate-keys.js
// Run once: node generate-keys.js
// Produces private.pem and public.pem in the current directory.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const outDir = process.argv[2] || __dirname;
const masterKey = crypto.randomBytes(32); // AES-256


fs.writeFileSync(path.join(outDir, 'private.pem'), privateKey, { mode: 0o600 });
fs.writeFileSync(path.join(outDir, 'public.pem'), publicKey, { mode: 0o644 });
fs.writeFileSync(path.join(outDir, 'master.key'), masterKey, { mode: 0o600 });

console.log(`Keys written to ${outDir}`);
console.log('private.pem — keep this OUT of source control and restrict its ACLs to the app pool identity');
console.log('public.pem  — safe to embed in the client-facing response, but load it the same way for consistency');
console.log(`Master key written to ${outDir}\\master.key — keep out of source control, same ACLs as private.pem`);