import {
  DEFAULT_SOUND_PROFILE,
  SOUND_PROFILE_ID,
  type SoundProfileId,
} from "../../styles/theme";

export interface AudioSynthesizerOptions {
  profile?: SoundProfileId;
  muted?: boolean;
  volume?: number;
  audioContextFactory?: () => AudioContext | undefined;
}

export class AudioSynthesizer {
  private profile: SoundProfileId;
  private muted: boolean;
  private volume: number;
  private readonly audioContextFactory: () => AudioContext | undefined;
  private ctx: AudioContext | undefined;
  private initAttempted = false;
  private noiseBuffer: AudioBuffer | undefined;
  private noiseBufferCtx: AudioContext | undefined;

  constructor(options: AudioSynthesizerOptions = {}) {
    this.profile = options.profile ?? DEFAULT_SOUND_PROFILE;
    this.muted = options.muted ?? false;
    this.volume = Math.max(0, Math.min(1, options.volume ?? 0.8));
    this.audioContextFactory =
      options.audioContextFactory ??
      (() => {
        if (typeof window === "undefined") {
          return undefined;
        }
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioCtx) {
          return undefined;
        }
        return new AudioCtx();
      });
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public getProfile(): SoundProfileId {
    return this.profile;
  }

  public setProfile(profile: SoundProfileId): void {
    this.profile = profile;
  }

  public getContext(): AudioContext | undefined {
    if (!this.ctx && !this.initAttempted) {
      this.initAttempted = true;
      try {
        this.ctx = this.audioContextFactory();
      } catch {
        this.ctx = undefined;
      }
    }
    return this.ctx;
  }

  public ensureAudioContext(): AudioContext | undefined {
    const ctx = this.getContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  public init(): void {
    this.ensureAudioContext();
  }

  public attachGlobalUnlockListeners(): () => void {
    if (typeof window === "undefined") {
      return () => {};
    }
    const unlock = () => {
      this.ensureAudioContext();
    };
    window.addEventListener("pointerdown", unlock, {
      once: true,
      passive: true,
    });
    window.addEventListener("keydown", unlock, {
      once: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }

  public getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBufferCtx === ctx) {
      return this.noiseBuffer;
    }
    const sampleRate = ctx.sampleRate || 44100;
    const bufferSize = Math.floor(sampleRate * 0.05); // 50ms buffer
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    this.noiseBufferCtx = ctx;
    return buffer;
  }

  public playKeyPressSound(
    profile: SoundProfileId = this.profile,
    char?: string,
  ): void {
    if (this.muted || profile === SOUND_PROFILE_ID.MUTE) {
      return;
    }

    try {
      const ctx = this.ensureAudioContext();
      if (!ctx) {
        return;
      }

      const now = ctx.currentTime;
      const pitchVariance = this.getPitchVariance(char);

      switch (profile) {
        case SOUND_PROFILE_ID.LINEAR:
          this.playLinear(ctx, now, pitchVariance);
          break;
        case SOUND_PROFILE_ID.CLICKY:
          this.playClicky(ctx, now, pitchVariance);
          break;
        case SOUND_PROFILE_ID.SOFT_BUBBLE:
          this.playSoftBubble(ctx, now, pitchVariance);
          break;
        default:
          break;
      }
    } catch {
      // Audio execution failure must never crash the typing application
    }
  }

  private getPitchVariance(char?: string): number {
    if (!char) {
      return 1.0 + (Math.random() * 0.06 - 0.03);
    }
    const code = char.charCodeAt(0);
    const offset = ((code % 11) - 5) * 0.006;
    return 1.0 + offset;
  }

  private playLinear(
    ctx: AudioContext,
    now: number,
    pitchVariance: number,
  ): void {
    // 1. 30ms low-pass filtered noise burst transient (800Hz * pitchVariance) for rich deep thock
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.getNoiseBuffer(ctx);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(800 * pitchVariance, now);

    const noiseGain = ctx.createGain();
    const noisePeak = 0.28 * this.volume;
    noiseGain.gain.setValueAtTime(noisePeak, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.03);

    // 2. Low-frequency resonant mechanical body thud
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = "sine";
    const baseFreq = 140 * pitchVariance;
    const targetFreq = 65 * pitchVariance;

    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.035);

    const oscPeak = 0.22 * this.volume;
    oscGain.gain.setValueAtTime(oscPeak, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  private playClicky(
    ctx: AudioContext,
    now: number,
    pitchVariance: number,
  ): void {
    // 1. 15ms high-pass filtered noise burst transient (2500Hz * pitchVariance)
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.getNoiseBuffer(ctx);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.setValueAtTime(2500 * pitchVariance, now);

    const noiseGain = ctx.createGain();
    const noisePeak = 0.24 * this.volume;
    noiseGain.gain.setValueAtTime(noisePeak, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.015);

    // 2. 25ms resonant tactile body click (600Hz -> 200Hz)
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();

    bodyOsc.type = "sine";
    bodyOsc.frequency.setValueAtTime(600 * pitchVariance, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(
      200 * pitchVariance,
      now + 0.025,
    );

    const bodyPeak = 0.18 * this.volume;
    bodyGain.gain.setValueAtTime(bodyPeak, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.025);
  }

  private playSoftBubble(
    ctx: AudioContext,
    now: number,
    pitchVariance: number,
  ): void {
    // Smooth pitch-envelope sine sweep (480Hz -> 780Hz) with smooth gain decay
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const startFreq = 480 * pitchVariance;
    const peakFreq = 780 * pitchVariance;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.04);

    const gainPeak = 0.24 * this.volume;
    gain.gain.setValueAtTime(gainPeak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const audioSynthesizer = new AudioSynthesizer();
