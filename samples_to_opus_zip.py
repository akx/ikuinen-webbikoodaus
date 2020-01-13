import multiprocessing
import os
import random
import re
import subprocess
import wave
import zipfile
from collections import namedtuple
from typing import List

EncodeResult = namedtuple('EncodeResult', ('filename', 'opus_data'))

OPUSTAGS_PATH = os.environ.get('OPUSTAGS_PATH')


def get_wave_length_sec(filename: str) -> float:
    with wave.open(filename) as wf:
        return wf.getnframes() / wf.getparams().framerate


def select_samples(*, n_samples: int, min_length: float, max_length: float) -> List[os.DirEntry]:
    samples = [dent for dent in os.scandir('pcm_samples') if dent.name.endswith('.wav')]
    acceptable_samples = [dent for dent in samples if min_length <= get_wave_length_sec(dent.path) <= max_length]
    print(f'{len(acceptable_samples)} acceptable samples, choosing {n_samples}')
    return random.sample(acceptable_samples, n_samples)


def encode_opus(input_filename: str):
    args = [
        '/usr/bin/env',
        'opusenc',
        '--discard-comments',
        '--bitrate', '25',
        '--framesize', '60',
        '--downmix-mono',
        '--speech',
        input_filename,
        '-',
    ]
    opus_data = subprocess.check_output(args, encoding=None, stderr=subprocess.DEVNULL)
    # TODO: opustags doesn't seem to be killing the encoder metadata as it should :(
    # if OPUSTAGS_PATH:
    #     with tempfile.NamedTemporaryFile(suffix='.opus') as tempf:
    #         tempf.write(opus_data)
    #         tempf.flush()
    #         subprocess.check_call([
    #             OPUSTAGS_PATH,
    #             '-D',
    #             '-i',
    #             tempf.name,
    #         ])
    #         tempf.seek(0)
    #         opus_data = tempf.read()
    #         print('nep')
    return EncodeResult(filename=input_filename, opus_data=opus_data)


def main():
    samples = select_samples(n_samples=400, min_length=0.1, max_length=1.75)
    with zipfile.ZipFile('public/samples.zip', 'w') as zf:
        with multiprocessing.Pool() as p:
            sample_paths = [dent.path for dent in samples]
            for result in p.imap_unordered(encode_opus, sample_paths, 5):
                opus_filename = re.sub(r'[^0-9]+', '_', os.path.basename(result.filename)).strip('_') + '.opus'
                print(result.filename, '=>', opus_filename, len(result.opus_data))
                zf.writestr(opus_filename, data=result.opus_data)


if __name__ == '__main__':
    main()
