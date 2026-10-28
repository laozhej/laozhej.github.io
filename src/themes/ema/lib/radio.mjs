// Sakura Radio: three short, original music-box loops synthesised with Web Audio.
// No audio files ship with the site. The engine lives on window so a tune keeps
// playing while Ema pages swap, and it stops shortly after the last page lets go.
const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const midi = (name) => {
  const [, pitch, octave] = name.match(/^([A-G](?:#|b)?)(-?\d)$/);
  return 12 * (Number(octave) + 1) + NOTE[pitch];
};
const hz = (note) => 440 * 2 ** ((note - 69) / 12);

// Each bar is eight eighth-notes; "-" is a rest. Chords are bass roots plus a triad.
export const TRACKS = [
  {
    bpm: 84,
    chords: ['C3 E4 G4', 'A2 C4 E4', 'F2 A3 C4', 'G2 B3 D4', 'C3 E4 G4', 'E2 G3 B3', 'F2 A3 C4', 'C3 E4 G4'],
    melody: [
      'E5 - G5 - A5 G5 E5 -', 'C5 - E5 - D5 C5 A4 -', 'F5 - A5 - G5 F5 D5 -', 'E5 D5 C5 - D5 - G4 -',
      'E5 - G5 - C6 - B5 A5', 'G5 - E5 - G5 - E5 D5', 'C5 - F5 - E5 - D5 -', 'C5 - - - G4 - - -',
    ],
  },
  {
    bpm: 96,
    chords: ['A2 C4 E4', 'F2 A3 C4', 'C3 E4 G4', 'G2 B3 D4', 'A2 C4 E4', 'F2 A3 C4', 'G2 B3 D4', 'E2 G#3 B3'],
    melody: [
      'A4 C5 E5 - A5 - E5 C5', 'F5 - E5 - C5 - A4 -', 'G4 C5 E5 - G5 - E5 -', 'D5 - B4 - G4 - B4 D5',
      'E5 - A5 - G5 E5 C5 -', 'F5 - A5 - C6 - A5 F5', 'G5 - F5 E5 D5 - B4 -', 'E5 - G#5 - B5 - - -',
    ],
  },
  {
    bpm: 72,
    chords: ['F2 A3 C4', 'D3 F3 A3', 'Bb2 D4 F4', 'C3 E4 G4', 'F2 A3 C4', 'A2 C4 E4', 'Bb2 D4 F4', 'F2 A3 C4'],
    melody: [
      'A4 - C5 - F5 - E5 C5', 'D5 - F5 - A5 - F5 D5', 'Bb4 - D5 - F5 - D5 -', 'C5 - E5 - G5 - E5 C5',
      'F5 - A5 - C6 - A5 -', 'E5 - C5 - A4 - C5 E5', 'D5 - F5 - E5 - G5 -', 'F5 - - - C5 - - -',
    ],
  },
].map((track) => ({
  ...track,
  step: 30 / track.bpm,
  steps: track.melody.flatMap((bar) => bar.split(/\s+/).map((note) => (note === '-' ? null : midi(note)))),
  chordNotes: track.chords.map((chord) => chord.split(/\s+/).map(midi)),
}));
export const trackLength = (track) => track.steps.length * track.step;

export function getRadio(win) {
  if (!win.__emaRadio) win.__emaRadio = createRadio(win);
  return win.__emaRadio;
}

function createRadio(win) {
  const AudioContext = win.AudioContext || win.webkitAudioContext;
  const listeners = new Set();
  let ctx = null, master = null, input = null;
  let index = 0, volume = 0.6, playing = false;
  let origin = 0, nextTime = 0, step = 0, paused = 0;
  let pump = 0, releaseTimer = 0, holds = 0;
  const track = () => TRACKS[index];
  const emit = () => listeners.forEach((listener) => listener());

  function ensure() {
    if (ctx || !AudioContext) return !!ctx;
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = volume * 0.5;
    // A short feedback echo gives the music box a little room.
    const delay = ctx.createDelay(1);
    const feedback = ctx.createGain(), wet = ctx.createGain();
    delay.delayTime.value = 0.27; feedback.gain.value = 0.28; wet.gain.value = 0.22;
    input = ctx.createGain();
    input.connect(master);
    input.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(wet); wet.connect(master);
    master.connect(ctx.destination);
    return true;
  }
  function tone(frequency, time, { peak, decay, type = 'sine' }) {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type; osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
    osc.connect(gain); gain.connect(input);
    osc.start(time); osc.stop(time + decay + 0.05);
  }
  function schedule(at, position) {
    const current = track();
    const note = current.steps[position];
    if (note !== null) {
      tone(hz(note), at, { peak: 0.2, decay: 1.5 });
      tone(hz(note) * 4, at, { peak: 0.025, decay: 0.35, type: 'triangle' });
    }
    if (position % 8 === 0) {
      const [root, ...triad] = current.chordNotes[position / 8];
      tone(hz(root), at, { peak: 0.09, decay: current.step * 7 });
      triad.forEach((value) => tone(hz(value), at, { peak: 0.028, decay: current.step * 8 }));
    } else if (position % 8 === 4) {
      tone(hz(current.chordNotes[(position - 4) / 8][0]), at, { peak: 0.06, decay: current.step * 3 });
    }
  }
  function tick() {
    const current = track();
    while (nextTime < ctx.currentTime + 0.25) {
      schedule(nextTime, step);
      nextTime += current.step;
      step = (step + 1) % current.steps.length;
    }
  }
  function startAt(seconds) {
    const current = track();
    step = Math.ceil(seconds / current.step - 1e-6) % current.steps.length;
    origin = ctx.currentTime + 0.05 - seconds;
    nextTime = origin + step * current.step;
    if (step === 0 && seconds > 0) nextTime = origin + trackLength(current);
    win.clearInterval(pump);
    pump = win.setInterval(tick, 60);
    tick();
  }
  function stopPump() { win.clearInterval(pump); pump = 0; }

  const radio = {
    supported: !!AudioContext,
    get index() { return index; },
    get playing() { return playing; },
    get volume() { return volume; },
    position() {
      const length = trackLength(track());
      if (!playing || !ctx) return paused % length;
      // Playback starts a few milliseconds ahead; count that lead-in as zero.
      return Math.max(0, ctx.currentTime - origin) % length;
    },
    async play() {
      if (!ensure()) return;
      win.clearTimeout(releaseTimer);
      await ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
      playing = true;
      startAt(paused);
      emit();
    },
    pause() {
      if (!playing) return;
      paused = radio.position();
      playing = false;
      stopPump();
      if (ctx) {
        master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
        win.setTimeout(() => { if (!playing) ctx.suspend(); }, 300);
      }
      emit();
    },
    select(next) {
      index = (next + TRACKS.length) % TRACKS.length;
      paused = 0;
      if (playing) startAt(0);
      emit();
    },
    setVolume(value) {
      volume = Math.max(0, Math.min(1, value));
      if (master) master.gain.setTargetAtTime(volume * 0.5, ctx.currentTime, 0.03);
      emit();
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    // Pages hold the radio while they show its controls. When the last Ema page
    // lets go and no other mounts within a moment (e.g. switching to Blank), it stops.
    hold() { holds += 1; win.clearTimeout(releaseTimer); },
    release() {
      holds = Math.max(0, holds - 1);
      if (holds) return;
      win.clearTimeout(releaseTimer);
      releaseTimer = win.setTimeout(() => { if (!holds) radio.pause(); }, 1500);
    },
  };
  return radio;
}
