import { mkdir } from 'fs/promises';
import { spawn } from 'child_process';

export async function convertToHLS(inputPath: string, outputDir: string) {
  await Promise.all([
    mkdir(outputDir, { recursive: true }),
    mkdir(`${outputDir}/v0`, { recursive: true }),
    mkdir(`${outputDir}/v1`, { recursive: true })
  ]);

  const args = [
    '-i', inputPath,
    '-preset', 'veryfast',
    '-g', '48',
    '-sc_threshold', '0',
    '-map', '0:v:0',
    '-map', '0:a:0',
    '-map', '0:v:0',
    '-map', '0:a:0',
    '-s:v:0', '1280x720',
    '-b:v:0', '3500k',
    '-s:v:1', '1920x1080',
    '-b:v:1', '6000k',
    '-var_stream_map', 'v:0,a:0 v:1,a:1',
    '-hls_time', '6',
    '-hls_playlist_type', 'vod',
    '-master_pl_name', 'master.m3u8',
    '-f', 'hls',
    `${outputDir}/v%v/prog.m3u8`
  ];

  return new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';

    ffmpeg.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    ffmpeg.on('error', reject);
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`ffmpeg exited with code ${code ?? 'unknown'}: ${stderr.slice(-1200)}`));
    });
  });
}
