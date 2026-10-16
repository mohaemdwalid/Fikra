import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

mkdirSync('assets/tilted-grid', { recursive: true });
await build({
  entryPoints: ['src/hero.tsx'], bundle: true, minify: true,
  format: 'esm', target: ['es2022'], outfile: 'assets/tilted-grid/hero.js',
  define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'eof',
});
execFileSync('node_modules/.bin/tailwindcss', [
  '-i', 'src/styles/hero.css', '-o', 'assets/tilted-grid/hero.css', '--minify',
], { stdio: 'inherit' });
