import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// node --env-file=.env.local scripts/generate-funnel-voiceover.mjs
// One paid synthesis request; existing audio is protected from accidental reruns.
const root = fileURLToPath(new URL('../', import.meta.url));
const folder = path.join(root, 'output', 'fikra-funnel-vsl-2026-10-23');
const output = path.join(folder, 'fikra-funnel-george-raw.mp3');
try {
  let exists = false;
  try { await access(output); exists = true; } catch {}
  if (exists) throw new Error('Audio already exists; choose a new output for a new take.');
  const script = JSON.parse(await readFile(path.join(folder, 'script.json'), 'utf8'));
  const text = script.blocks.map(block => block.text).join('\n\n');
  const client = new ElevenLabsClient();
  if (typeof client.textToSpeech.convertWithTimestamps !== 'function') {
    throw new Error('This SDK lacks convertWithTimestamps.');
  }
  console.log('Generating full George narration with timing data…');
  const result = await client.textToSpeech.convertWithTimestamps(script.voice_id, {
    text,
    modelId: script.model_id,
    languageCode: 'ar',
    outputFormat: 'mp3_44100_128',
    voiceSettings: script.voice_settings,
  }, { timeoutInSeconds: 300, maxRetries: 0 });
  const encoded = result.audioBase64 ?? result.audio_base64;
  if (!encoded) throw new Error('Provider returned no audio.');
  await writeFile(output, Buffer.from(encoded, 'base64'), { flag: 'wx' });
  await writeFile(path.join(folder, 'provider-timing.json'), JSON.stringify({
    alignment: result.alignment,
    normalizedAlignment: result.normalizedAlignment ?? result.normalized_alignment,
  }, null, 2), { flag: 'wx' });
  console.log(output);
} catch (error) {
  console.error('Narration generation failed:', error.statusCode ?? error.status ?? error.name);
  if (error.body?.detail) console.error(JSON.stringify(error.body.detail));
  else if (error.message && !error.body) console.error(error.message);
  process.exitCode = 1;
}
