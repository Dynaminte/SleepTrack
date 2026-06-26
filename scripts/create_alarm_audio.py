import math
import os
import struct
import wave

out_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'audio')
os.makedirs(out_dir, exist_ok=True)


def write_tone(path, freq, duration=0.8, volume=0.5, sample_rate=22050):
    n_samples = int(sample_rate * duration)
    with wave.open(path, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        for i in range(n_samples):
            t = i / sample_rate
            value = int(32767 * volume * math.sin(2 * math.pi * freq * t))
            wav_file.writeframesraw(struct.pack('<h', value))


write_tone(os.path.join(out_dir, 'default.wav'), 440)
write_tone(os.path.join(out_dir, 'chime.wav'), 660, duration=0.6, volume=0.45)
write_tone(os.path.join(out_dir, 'digital.wav'), 880, duration=0.4, volume=0.55)
print('created', out_dir)
