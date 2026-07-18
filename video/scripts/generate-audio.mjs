import fs from 'node:fs';
import path from 'node:path';

const sampleRate = 48000;
const duration = 30;
const channels = 2;
const frames = sampleRate * duration;
const data = new Int16Array(frames * channels);

const clamp = (value) => Math.max(-1, Math.min(1, value));
const smooth = (value) => value * value * (3 - 2 * value);
const envelope = (t, start, length, attack = 0.03, release = 0.18) => {
  if (t < start || t > start + length) return 0;
  const local = t - start;
  const a = smooth(Math.min(1, local / attack));
  const r = smooth(Math.min(1, (length - local) / release));
  return a * r;
};

const tonalEvents = [
  [0.10, 0.32, 220, 0.16], [0.52, 0.22, 330, 0.10], [1.00, 0.18, 440, 0.09],
  [3.05, 0.50, 196, 0.18], [3.24, 0.55, 293.66, 0.14], [3.48, 0.62, 440, 0.12],
  [7.55, 0.16, 523.25, 0.09], [8.05, 0.16, 659.25, 0.08],
  [10.20, 0.18, 392, 0.09], [11.55, 0.18, 493.88, 0.08], [13.00, 0.18, 587.33, 0.08],
  [16.95, 0.45, 261.63, 0.12], [17.12, 0.48, 392, 0.10],
  [23.55, 0.30, 329.63, 0.10], [24.05, 0.30, 392, 0.10], [24.55, 0.45, 493.88, 0.11],
  [28.15, 0.55, 392, 0.14], [28.35, 0.65, 493.88, 0.13], [28.55, 0.85, 659.25, 0.12],
];

const clickEvents = [4.62, 5.04, 5.46, 5.88, 6.30, 6.72, 7.14, 8.72, 9.12, 9.52, 10.80, 12.18];
const whooshEvents = [2.85, 7.35, 16.70, 23.30, 27.90];

for (let i = 0; i < frames; i++) {
  const t = i / sampleRate;
  const barPhase = (t % 2) / 2;
  const pulse = Math.exp(-barPhase * 12);
  const sub = Math.sin(Math.PI * 2 * 55 * t) * pulse * 0.035;
  const padEnvelope = Math.min(1, t / 1.5) * Math.min(1, (duration - t) / 2.2);
  const pad = (
    Math.sin(Math.PI * 2 * 110 * t) +
    0.55 * Math.sin(Math.PI * 2 * 164.81 * t + 0.4) +
    0.35 * Math.sin(Math.PI * 2 * 220 * t + 1.1)
  ) * 0.018 * padEnvelope;

  let tone = 0;
  for (const [start, length, frequency, gain] of tonalEvents) {
    const env = envelope(t, start, length);
    tone += Math.sin(Math.PI * 2 * frequency * (t - start)) * env * gain;
    tone += Math.sin(Math.PI * 2 * frequency * 2 * (t - start)) * env * gain * 0.18;
  }

  let clicks = 0;
  for (const start of clickEvents) {
    const local = t - start;
    if (local >= 0 && local < 0.045) {
      const decay = Math.exp(-local * 90);
      clicks += (Math.sin(Math.PI * 2 * 1550 * local) + Math.sin(Math.PI * 2 * 2150 * local) * 0.4) * decay * 0.045;
    }
  }

  let whoosh = 0;
  for (const start of whooshEvents) {
    const local = t - start;
    if (local >= 0 && local < 0.55) {
      const env = Math.sin(Math.PI * (local / 0.55));
      const noise = Math.sin(i * 12.9898 + Math.sin(i * 0.013) * 78.233);
      whoosh += noise * env * 0.025;
    }
  }

  const mono = clamp(sub + pad + tone + clicks + whoosh);
  const width = Math.sin(Math.PI * 2 * 0.11 * t) * 0.012 * padEnvelope;
  data[i * 2] = Math.round(clamp(mono + width) * 32767);
  data[i * 2 + 1] = Math.round(clamp(mono - width) * 32767);
}

const byteLength = data.byteLength;
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + byteLength, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(channels, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * channels * 2, 28);
header.writeUInt16LE(channels * 2, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(byteLength, 40);

const output = path.resolve('public', 'dokugen-score.wav');
fs.mkdirSync(path.dirname(output), {recursive: true});
fs.writeFileSync(output, Buffer.concat([header, Buffer.from(data.buffer)]));
console.log(`Generated ${output} (${duration}s stereo WAV)`);
