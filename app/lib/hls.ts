import { exec } from 'child_process';

export function convertToHLS(inputPath: string, outputDir: string) {
  const command = `ffmpeg -i "${inputPath}" -preset veryfast -g 48 -sc_threshold 0 -map 0:v:0 -map 0:a:0 -map 0:v:0 -map 0:a:0 -s:v:0 1280x720 -b:v:0 3500k -s:v:1 1920x1080 -b:v:1 6000k -var_stream_map \"v:0,a:0 v:1,a:1\" -hls_time 6 -hls_playlist_type vod -master_pl_name master.m3u8 -f hls "${outputDir}/v%v/prog.m3u8"`;

  return new Promise<void>((resolve, reject) => {
    exec(command, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
