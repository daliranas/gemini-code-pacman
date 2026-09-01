/**
 * Module Audio: Synthétiseur chiptune Web Audio API complet et procédural.
 * Gère la musique de fond du menu rétro, l'intro jingle, les SFX in-game et le mode Mute.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmInterval = null;
    this.currentNoteIndex = 0;
    this.masterGain = null;
  }

  init() {
    if (!this.audioCtx) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      } catch (e) {
        console.warn('Web Audio API non supportée:', e);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.audioCtx.currentTime);
    }
    return this.isMuted;
  }

  setMute(mute) {
    this.isMuted = mute;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.audioCtx.currentTime);
    }
  }

  playTone(freq, type = 'square', duration = 0.1, gainVal = 0.1, pitchEnd = null) {
    if (!this.audioCtx || this.isMuted) return;
    this.init();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    const now = this.audioCtx.currentTime;
    osc.frequency.setValueAtTime(freq, now);
    if (pitchEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(10, pitchEnd), now + duration);
    }

    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  playIntroJingle(onComplete) {
    if (!this.audioCtx) this.init();
    if (!this.audioCtx || this.isMuted) {
      if (onComplete) setTimeout(onComplete, 1200);
      return;
    }

    // Mélodie légendaire d'intro Pac-Man en fréquences pures (Hz)
    const melody = [
      { f: 493.88, d: 0.12 }, // B4
      { f: 987.77, d: 0.12 }, // B5
      { f: 739.99, d: 0.12 }, // F#5
      { f: 622.25, d: 0.12 }, // D#5
      { f: 987.77, d: 0.08 }, // B5
      { f: 739.99, d: 0.16 }, // F#5
      { f: 622.25, d: 0.20 }, // D#5
      { f: 0, d: 0.04 },      // Silence
      { f: 523.25, d: 0.12 }, // C5
      { f: 1046.50, d: 0.12 },// C6
      { f: 783.99, d: 0.12 }, // G5
      { f: 659.25, d: 0.12 }, // E5
      { f: 1046.50, d: 0.08 },// C6
      { f: 783.99, d: 0.16 }, // G5
      { f: 659.25, d: 0.20 }, // E5
    ];

    let delay = 0;
    melody.forEach((note) => {
      setTimeout(() => {
        if (note.f > 0 && !this.isMuted) {
          this.playTone(note.f, 'triangle', note.d * 0.95, 0.15);
        }
      }, delay);
      delay += note.d * 1000;
    });

    if (onComplete) {
      setTimeout(onComplete, delay + 100);
    }
  }

  startMenuMusic() {
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.currentNoteIndex = 0;

    // Arpège chiptune rétro 80s continu
    const bassline = [
      110, 110, 220, 164.81, 146.83, 110, 130.81, 146.83,
      110, 110, 220, 164.81, 196.00, 164.81, 146.83, 130.81,
      98,  98,  196, 146.83, 130.81, 98,  123.47, 130.81,
      123.47, 123.47, 246.94, 164.81, 146.83, 130.81, 123.47, 110
    ];

    const stepTime = 140; // ms
    this.bgmInterval = setInterval(() => {
      if (!this.bgmPlaying) return;
      if (!this.audioCtx) this.init();
      if (!this.isMuted && this.audioCtx && this.audioCtx.state === 'running') {
        const freq = bassline[this.currentNoteIndex % bassline.length];
        this.playTone(freq, 'triangle', 0.12, 0.06);
        
        // Harmonie légère de synthétiseur un temps sur deux
        if (this.currentNoteIndex % 4 === 0) {
          this.playTone(freq * 2, 'sawtooth', 0.08, 0.02);
        }
      }
      this.currentNoteIndex++;
    }, stepTime);
  }

  stopMenuMusic() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  playEatPellet() {
    this.playTone(480, 'triangle', 0.06, 0.08, 220);
  }

  playEatEnergizer() {
    this.playTone(300, 'square', 0.18, 0.12, 900);
  }

  playEatGhost() {
    this.playTone(200, 'sine', 0.35, 0.25, 1200);
  }

  playDeath() {
    if (!this.audioCtx) this.init();
    if (!this.audioCtx || this.isMuted) return;

    // Son de descente modulée caractéristique
    const pitches = [550, 500, 450, 400, 350, 300, 250, 200, 150, 100, 70];
    pitches.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'sawtooth', 0.07, 0.15);
      }, i * 65);
    });
  }

  playVictory() {
    if (!this.audioCtx) this.init();
    if (!this.audioCtx || this.isMuted) return;

    const victoryNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    victoryNotes.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'square', 0.15, 0.15);
      }, i * 100);
    });
  }
}
