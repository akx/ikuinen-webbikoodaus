"""
Transcode floating-point WAV in fltp_samples to 16-bit PCM in pcm_samples.
"""
import multiprocessing
import os
import subprocess


def transcode(filename):
    target_filename = filename.replace('fltp_samples/', 'pcm_samples/').replace(' ', '_').replace('#', '')
    subprocess.check_call([
        '/usr/bin/env',
        'ffmpeg',
        '-hide_banner',
        '-loglevel', 'panic',
        '-i', filename,
        '-c:a', 'pcm_s16le',
        '-ac', '1',
        target_filename,
    ])
    return target_filename


def main():
    samples = [dent for dent in os.scandir('fltp_samples') if dent.name.endswith('.wav')]
    with multiprocessing.Pool(processes=10) as p:
        for result in p.imap_unordered(transcode, [dent.path for dent in samples]):
            print(result)


if __name__ == '__main__':
    main()
