export class AudioManager {
  constructor() {
    this.ctx = null;
    this.gain = null;
    this.filter = null;
    this.muted = false;
  }

  unlock() {
    if (this.ctx) {
      const result = this.ctx.resume();
      result?.catch?.(() => {});
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") this.ctx.resume()?.catch?.(() => {});
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 3, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let index = 0; index < data.length; index += 1) {
      const white = Math.random() * 2 - 1;
      last = last * 0.988 + white * 0.012;
      data[index] = last * 0.62;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 720;
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0.24;
    source.connect(this.filter).connect(this.gain).connect(this.ctx.destination);
    source.start();
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.gain && this.ctx) {
      this.gain.gain.setTargetAtTime(muted ? 0 : 0.24, this.ctx.currentTime, 0.12);
    }
  }

  setScene(scene) {
    if (!this.ctx || !this.filter || !this.gain) return;
    const frequency = scene === "night" ? 480 : scene === "camp" || scene === "fire" ? 320 : 760;
    const level = scene === "camp" ? 0.12 : scene === "fire" ? 0.15 : 0.24;
    this.filter.frequency.setTargetAtTime(frequency, this.ctx.currentTime, 0.4);
    this.gain.gain.setTargetAtTime(this.muted ? 0 : level, this.ctx.currentTime, 0.4);
  }

  cue(frequency = 240, duration = 0.08) {
    if (!this.ctx || this.muted) return;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    oscillator.connect(gain).connect(this.ctx.destination);
    oscillator.start();
    oscillator.stop(this.ctx.currentTime + duration);
  }

  suspend() {
    this.ctx?.suspend()?.catch?.(() => {});
  }

  resume() {
    this.ctx?.resume()?.catch?.(() => {});
  }
}
