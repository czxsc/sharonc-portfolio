#!/usr/bin/env python3
"""Frame a record-pokeleet.mjs capture and encode it for the case page.

Run with `python3 scripts/render-walkthrough.py <capture dir> <out stem> [poster s]`
(needs Pillow, and ffmpeg on PATH or the imageio-ffmpeg package).
Writes <out stem>.mp4 and <out stem>.webp, the poster: the frame at
`poster s` seconds, so the still is the recording's payoff rather than
the dashboard every walkthrough opens on (it's all a reduced-motion
reader sees until they press Play).

The capture is every repaint at 2x with its wall-clock timestamp, plus a
list of camera moves logged by the script as it drove the app. This
resamples the repaints onto a steady clock and, frame by frame, crops
to wherever the camera is at that moment:

- zoom interpolates in log space, so 1x -> 2x takes as long to feel as
  2x -> 4x would, and the center interpolates linearly; both on a
  quintic ease, which starts and lands more softly than a cubic;
- a move that starts before the previous one has landed starts from
  wherever the camera actually is, so moves chain without a hitch;
- the crop is clamped inside the screen, so the camera never shows past
  the app's edge — near an edge it slides instead;
- the last LOOP_FADE seconds dissolve into the first frame, so the
  <video loop> on the page comes round without a cut.
"""
import json
import math
import os
import shutil
import subprocess
import sys

from PIL import Image

OUT_W, OUT_H = 1600, 1000
FPS = 60
LOOP_FADE = 0.6
CRF = 26


def ffmpeg_exe():
    found = shutil.which('ffmpeg')
    if found:
        return found
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def smooth(k):
    k = min(1.0, max(0.0, k))
    return k * k * k * (k * (k * 6 - 15) + 10)


class Camera:
    def __init__(self, events, t0, view):
        self.view = view
        self.start = (1.0, view['width'] / 2, view['height'] / 2)
        # each move remembers where the camera was when it began
        self.moves = []
        for ev in sorted((e for e in events if e['type'] == 'cam'), key=lambda e: e['ts']):
            t = ev['ts'] - t0
            frm = self.at(t)
            self.moves.append((t, ev['ms'] / 1000, frm, (ev['zoom'], ev['cx'], ev['cy'])))

    def at(self, t):
        state = self.start
        for (ts, dur, frm, to) in self.moves:
            if t < ts:
                break
            k = smooth((t - ts) / dur if dur else 1)
            z = math.exp(math.log(frm[0]) + (math.log(to[0]) - math.log(frm[0])) * k)
            state = (z, frm[1] + (to[1] - frm[1]) * k, frm[2] + (to[2] - frm[2]) * k)
        return state

    def box(self, t, scale):
        z, cx, cy = self.at(t)
        w, h = self.view['width'] / z, self.view['height'] / z
        x0 = min(max(cx - w / 2, 0), self.view['width'] - w)
        y0 = min(max(cy - h / 2, 0), self.view['height'] - h)
        return (x0 * scale, y0 * scale, (x0 + w) * scale, (y0 + h) * scale)


def main(cap, stem, poster_at=0.0):
    with open(os.path.join(cap, 'manifest.json')) as f:
        m = json.load(f)
    frames = m['frames']
    t0 = frames[0]['ts']
    span = m['ended'] - t0
    cam = Camera(m['events'], t0, m['viewport'])
    scale = m['dsf']

    n = int(span * FPS)
    fade = int(LOOP_FADE * FPS)
    os.makedirs(os.path.dirname(stem) or '.', exist_ok=True)
    enc = subprocess.Popen([
        ffmpeg_exe(), '-y', '-loglevel', 'error',
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{OUT_W}x{OUT_H}', '-r', str(FPS), '-i', '-',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', str(CRF), '-tune', 'animation',
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', stem + '.mp4',
    ], stdin=subprocess.PIPE)

    src_i = 0
    cache = {}

    def source(i):
        if i not in cache:
            cache.clear()
            cache[i] = Image.open(os.path.join(cap, 'frames', frames[i]['file'])).convert('RGB')
        return cache[i]

    first = None
    poster_k = min(n - 1, round(poster_at * FPS))
    for k in range(n):
        t = k / FPS
        while src_i + 1 < len(frames) and frames[src_i + 1]['ts'] - t0 <= t:
            src_i += 1
        out = source(src_i).resize((OUT_W, OUT_H), Image.LANCZOS, box=cam.box(t, scale))
        if first is None:
            first = out
        if k == poster_k:
            out.save(stem + '.webp', quality=80, method=6)
        left = n - k
        if left <= fade:
            out = Image.blend(out, first, smooth(1 - (left - 1) / fade))
        enc.stdin.write(out.tobytes())
    enc.stdin.close()
    enc.wait()
    size = os.path.getsize(stem + '.mp4') / 1e6
    print(f'{stem}.mp4: {n / FPS:.1f}s at {FPS}fps, {size:.2f} MB')


if __name__ == '__main__':
    if len(sys.argv) not in (3, 4):
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) == 4 else 0.0)
