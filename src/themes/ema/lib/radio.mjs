import manifest from '../../../../public/themes/ema/audio/ASSETS.json' with { type: 'json' };

export const TRACKS = manifest.assets.map(({ id, file, duration }) => ({
  id, src: `/themes/ema/audio/${file}`, duration,
}));

// Keep one player across Ema page swaps. Set its source only when playback is requested.
export function getRadio(win) {
  if (!win.__emaRadio) win.__emaRadio = createRadio(win);
  return win.__emaRadio;
}

function createRadio(win) {
  const audio = typeof win.Audio === 'function' ? new win.Audio() : null;
  const AudioContext = win.AudioContext || win.webkitAudioContext;
  const listeners = new Set();
  let index = 0, volume = 0.6, releaseTimer = 0, holds = 0;
  let request = 0, wantsPlayback = false, failed = false;
  let nativeVolume = false, context, gain;
  if (audio) {
    audio.preload = 'none';
    try {
      audio.volume = volume;
      nativeVolume = audio.volume === volume;
    } catch { /* Some browsers only expose the device's volume. */ }
  }

  const currentTrack = () => TRACKS[index];
  const emit = () => listeners.forEach((listener) => listener());

  function resumeVolume() {
    if (nativeVolume || !AudioContext) return;
    if (!context) {
      context = new AudioContext();
      gain = context.createGain();
      context.createMediaElementSource(audio).connect(gain);
      gain.connect(context.destination);
      gain.gain.value = volume;
      context.addEventListener('statechange', () => {
        if (context.state === 'interrupted') radio.pause();
      });
    }
    if (context.state !== 'running') return context.resume();
  }

  function selectTrack(next, resume) {
    request += 1;
    wantsPlayback = false;
    failed = false;
    index = ((next % TRACKS.length) + TRACKS.length) % TRACKS.length;
    if (audio?.hasAttribute('src')) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    if (resume) void radio.play();
    else emit();
  }

  const radio = {
    supported: Boolean(audio),
    volumeSupported: nativeVolume || Boolean(audio && AudioContext),
    get index() { return index; },
    get playing() { return Boolean(audio && wantsPlayback && !audio.paused && !audio.ended && !failed); },
    get failed() { return failed; },
    get volume() { return volume; },
    get duration() { return Number.isFinite(audio?.duration) ? audio.duration : currentTrack().duration; },
    position() { return audio?.currentTime ?? 0; },
    async play() {
      if (!audio) return;
      const attempt = ++request;
      wantsPlayback = true;
      failed = false;
      if (!audio.hasAttribute('src') || audio.error) audio.src = currentTrack().src;
      try {
        // Both media APIs must be called before the initiating click's user activation expires.
        const started = Promise.all([resumeVolume(), audio.play()]);
        emit();
        await started;
      } catch {
        if (attempt !== request) return;
        wantsPlayback = false;
        failed = true;
        audio.pause();
      }
      if (attempt === request) emit();
    },
    pause() {
      request += 1;
      wantsPlayback = false;
      audio?.pause();
      emit();
    },
    select(next) { selectTrack(next, radio.playing); },
    setVolume(value) {
      volume = Math.max(0, Math.min(1, value));
      if (nativeVolume) audio.volume = volume;
      if (gain) gain.gain.value = volume;
      emit();
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    hold() {
      holds += 1;
      win.clearTimeout(releaseTimer);
    },
    // A replacement Ema page gets the same player. Leaving the theme pauses it.
    release() {
      holds = Math.max(0, holds - 1);
      if (holds) return;
      win.clearTimeout(releaseTimer);
      releaseTimer = win.setTimeout(() => { if (!holds) radio.pause(); }, 1500);
    },
  };

  audio?.addEventListener('playing', emit);
  audio?.addEventListener('durationchange', emit);
  audio?.addEventListener('pause', () => {
    if (audio.paused && !audio.ended) wantsPlayback = false;
    emit();
  });
  audio?.addEventListener('ended', () => {
    if (wantsPlayback && audio.ended) selectTrack(index + 1, true);
  });
  audio?.addEventListener('error', () => {
    if (!audio.error) return;
    wantsPlayback = false;
    failed = true;
    emit();
  });
  return radio;
}
