import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { createWriteStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Run with: node --env-file=.env.local scripts/elevenlabs-voice-test.mjs
// The SDK reads ELEVENLABS_API_KEY directly from the environment.
const client = new ElevenLabsClient();
const text = 'هلا والله! مع فكرة، موقعك الإلكتروني جاهز خلال سبعة أيام. وإذا ما عجبك التصميم، نرجّع لك فلوسك.';
const voiceId = 'JBFqnCBsd6RMkjVDRZzb'; // George, a stock multilingual test voice.
const modelId = 'eleven_v4';
const root = fileURLToPath(new URL('../', import.meta.url));
const directory = path.join(root, 'output', 'voice-tests');
const name = `fikra-arabic-${new Date().toISOString().replace(/[:.]/g, '-')}`;

try {
  await mkdir(directory, { recursive: true });
  const audio = await client.textToSpeech.convert(voiceId, {
    text,
    modelId,
    languageCode: 'ar',
    outputFormat: 'mp3_44100_128',
    voiceSettings: { stability: 0.5, similarityBoost: 0.75 },
  });
  const output = path.join(directory, `${name}.mp3`);
  await pipeline(Readable.fromWeb(audio), createWriteStream(output, { flags: 'wx' }));
  await writeFile(path.join(directory, `${name}.json`), JSON.stringify({
    text, voiceId, voiceName: 'George', modelId, languageCode: 'ar',
    note: 'Gulf Arabic wording; stock voice, not a custom Qatari voice.',
  }, null, 2), { flag: 'wx' });
  console.log(output);
} catch (error) {
  // Do not dump SDK request objects or credentials to the terminal.
  console.error('Voice test failed:', error.statusCode || error.status || error.name);
  if (error.body?.detail) console.error(JSON.stringify(error.body.detail));
  process.exitCode = 1;
}
