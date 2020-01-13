import JSZip, { JSZipObject } from "jszip";

export interface Sample {
  name: string;
  audioBuffer: AudioBuffer;
}

async function unpackZipObject(
  ctx: AudioContext,
  zipObject: JSZipObject
): Promise<Sample> {
  const encodedBuffer = await zipObject.async("arraybuffer");
  const audioBuffer = await ctx.decodeAudioData(encodedBuffer);
  return {
    name: zipObject.name,
    audioBuffer
  };
}

export async function loadSampleZip(ctx: AudioContext): Promise<Sample[]> {
  const resp = await fetch("/samples.zip");
  const blob: Blob = await resp.blob();
  const zip: JSZip = await JSZip.loadAsync(blob);
  const zipObjects: JSZipObject[] = [];
  zip.forEach((path, file) => {
    if (path.endsWith(".opus")) {
      zipObjects.push(file);
    }
  });
  return await Promise.all(zipObjects.map(zo => unpackZipObject(ctx, zo)));
}
