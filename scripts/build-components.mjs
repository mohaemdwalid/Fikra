import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
await build({entryPoints:['components/project-skyline.tsx'],bundle:true,minify:true,format:'iife',target:['es2020'],outfile:'assets/project-skyline.js',define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
execFileSync('node_modules/.bin/tailwindcss',['-i','styles/components.css','-o','assets/project-skyline.utilities.css','--minify'],{stdio:'inherit'});
