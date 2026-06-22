export function isVideoSrc(src: string): boolean {
  return /\.(mp4|webm)$/i.test(src);
}

export function webmVariant(mp4Src: string): string {
  return mp4Src.replace(/\.mp4$/i, ".webm");
}

export function posterVariant(videoSrc: string): string {
  return videoSrc.replace(/\.(mp4|webm)$/i, "-poster.jpg");
}
