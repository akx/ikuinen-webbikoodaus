import multiprocessing
import os
import random
import re
import subprocess
import tempfile
import zipfile
from collections import namedtuple
from typing import List

EncodeResult = namedtuple('EncodeResult', ('filename', 'opus_data'))

OPUSTAGS_PATH = os.environ.get('OPUSTAGS_PATH')


def select_samples(size_thresh_p, n_samples) -> List[os.DirEntry]:
    min_thresh = 0.5 - size_thresh_p / 2
    max_thresh = 0.5 + size_thresh_p / 2

    samples = [dent for dent in os.scandir('samples') if dent.name.endswith('.wav')]
    total_size = sum(dent.stat().st_size for dent in samples)
    average_size = total_size / len(samples)
    min_size = average_size * min_thresh
    max_size = average_size * max_thresh

    acceptable_samples = [dent for dent in samples if min_size <= dent.stat().st_size <= max_size]

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
    samples = select_samples(size_thresh_p=0.3, n_samples=250)
    with zipfile.ZipFile('public/samples.zip', 'w') as zf:
        with multiprocessing.Pool() as p:
            sample_paths = [dent.path for dent in samples]
            for result in p.imap_unordered(encode_opus, sample_paths, 5):
                opus_filename = re.sub(r'[^0-9]+', '_', os.path.basename(result.filename)).strip('_') + '.opus'
                print(result.filename, '=>', opus_filename, len(result.opus_data))
                zf.writestr(opus_filename, data=result.opus_data)


if __name__ == '__main__':
    main()
