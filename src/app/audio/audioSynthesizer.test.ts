// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SOUND_PROFILE_ID } from "../../styles/theme";
import { AudioSynthesizer, audioSynthesizer } from "./audioSynthesizer";

interface MockAudioNode {
  connect: ReturnType<typeof vi.fn>;
  disconnect?: ReturnType<typeof vi.fn>;
}

interface MockAudioParam {
  value: number;
  setValueAtTime: ReturnType<typeof vi.fn>;
  linearRampToValueAtTime: ReturnType<typeof vi.fn>;
  exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
}

interface MockGainNode extends MockAudioNode {
  gain: MockAudioParam;
}

interface MockOscillatorNode extends MockAudioNode {
  type: string;
  frequency: MockAudioParam;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

interface MockBiquadFilterNode extends MockAudioNode {
  type: string;
  frequency: MockAudioParam;
  Q: MockAudioParam;
}

interface MockBufferSourceNode extends MockAudioNode {
  buffer: AudioBuffer | null;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

class MockAudioContext {
  state: "running" | "suspended" = "running";
  currentTime: number = 0.1;
  sampleRate: number = 44100;
  destination: MockAudioNode = { connect: vi.fn() };

  createdOscillators: MockOscillatorNode[] = [];
  createdBufferSources: MockBufferSourceNode[] = [];
  createdGains: MockGainNode[] = [];
  createdFilters: MockBiquadFilterNode[] = [];
  createdBuffers: AudioBuffer[] = [];

  resume = vi.fn().mockResolvedValue(undefined);

  createBuffer(
    numberOfChannels: number,
    length: number,
    sampleRate: number,
  ): AudioBuffer {
    const channelData = new Float32Array(length);
    const buffer = {
      numberOfChannels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: vi.fn(() => channelData),
      copyFromChannel: vi.fn(),
      copyToChannel: vi.fn(),
    } as unknown as AudioBuffer;
    this.createdBuffers.push(buffer);
    return buffer;
  }

  createBufferSource(): MockBufferSourceNode {
    const source: MockBufferSourceNode = {
      buffer: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    this.createdBufferSources.push(source);
    return source;
  }

  createGain(): MockGainNode {
    const gain: MockGainNode = {
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    this.createdGains.push(gain);
    return gain;
  }

  createOscillator(): MockOscillatorNode {
    const osc: MockOscillatorNode = {
      type: "sine",
      frequency: {
        value: 440,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      start: vi.fn(),
      stop: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    this.createdOscillators.push(osc);
    return osc;
  }

  createBiquadFilter(): MockBiquadFilterNode {
    const filter: MockBiquadFilterNode = {
      type: "lowpass",
      frequency: {
        value: 350,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      Q: {
        value: 1,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    this.createdFilters.push(filter);
    return filter;
  }
}

describe("AudioSynthesizer", () => {
  let mockCtx: MockAudioContext;
  let factoryCount: number;
  let synth: AudioSynthesizer;

  beforeEach(() => {
    mockCtx = new MockAudioContext();
    factoryCount = 0;
    synth = new AudioSynthesizer({
      audioContextFactory: () => {
        factoryCount++;
        return mockCtx as unknown as AudioContext;
      },
    });
  });

  it("initializes AudioContext lazily on first playback or init call", () => {
    expect(factoryCount).toBe(0);
    synth.playKeyPressSound(SOUND_PROFILE_ID.LINEAR, "a");
    expect(factoryCount).toBe(1);
  });

  it("resumes suspended AudioContext on user interaction and init", () => {
    mockCtx.state = "suspended";
    synth.init();
    expect(mockCtx.resume).toHaveBeenCalled();

    mockCtx.resume.mockClear();
    synth.playKeyPressSound(SOUND_PROFILE_ID.LINEAR, "a");
    expect(mockCtx.resume).toHaveBeenCalled();
  });

  it("attaches global unlock listeners to pointerdown and keydown", () => {
    mockCtx.state = "suspended";
    const cleanup = synth.attachGlobalUnlockListeners();
    expect(typeof cleanup).toBe("function");

    window.dispatchEvent(new Event("pointerdown"));
    expect(mockCtx.resume).toHaveBeenCalled();

    cleanup();
  });

  it("caches procedural white noise buffer for identical audio contexts", () => {
    const ctx = mockCtx as unknown as AudioContext;
    const buf1 = synth.getNoiseBuffer(ctx);
    const buf2 = synth.getNoiseBuffer(ctx);

    expect(buf1).toBe(buf2);
    expect(mockCtx.createdBuffers.length).toBe(1);
    expect(buf1.getChannelData).toHaveBeenCalledWith(0);
  });

  it("synthesizes linear profile with low-pass filtered noise burst and deep resonant body thud", () => {
    synth.playKeyPressSound(SOUND_PROFILE_ID.LINEAR, "k");

    // Noise buffer source + body oscillator
    expect(mockCtx.createdBufferSources.length).toBe(1);
    expect(mockCtx.createdFilters.length).toBe(1);
    expect(mockCtx.createdOscillators.length).toBe(1);
    expect(mockCtx.createdGains.length).toBe(2);

    // Filter verification: lowpass around 800Hz
    const filter = mockCtx.createdFilters[0];
    expect(filter.type).toBe("lowpass");
    const filterFreq = filter.frequency.setValueAtTime.mock.calls[0][0];
    expect(filterFreq).toBeGreaterThanOrEqual(750);
    expect(filterFreq).toBeLessThanOrEqual(850);
    expect(filter.frequency.setValueAtTime.mock.calls[0][1]).toBe(
      mockCtx.currentTime,
    );

    // Noise source verification
    const noiseSource = mockCtx.createdBufferSources[0];
    expect(noiseSource.start).toHaveBeenCalled();
    expect(noiseSource.stop).toHaveBeenCalled();
    expect(noiseSource.connect).toHaveBeenCalledWith(filter);

    // Body oscillator verification: 140Hz -> 65Hz
    const osc = mockCtx.createdOscillators[0];
    expect(osc.type).toBe("sine");
    const oscStartFreq = osc.frequency.setValueAtTime.mock.calls[0][0];
    expect(oscStartFreq).toBeGreaterThanOrEqual(130);
    expect(oscStartFreq).toBeLessThanOrEqual(150);

    const oscTargetFreq =
      osc.frequency.exponentialRampToValueAtTime.mock.calls[0][0];
    expect(oscTargetFreq).toBeGreaterThanOrEqual(60);
    expect(oscTargetFreq).toBeLessThanOrEqual(70);
  });

  it("synthesizes clicky profile with high-pass filtered noise snap and tactile resonant body", () => {
    synth.playKeyPressSound(SOUND_PROFILE_ID.CLICKY, "m");

    expect(mockCtx.createdBufferSources.length).toBe(1);
    expect(mockCtx.createdFilters.length).toBe(1);
    expect(mockCtx.createdOscillators.length).toBe(1);
    expect(mockCtx.createdGains.length).toBe(2);

    // Highpass filter at ~2500Hz
    const filter = mockCtx.createdFilters[0];
    expect(filter.type).toBe("highpass");
    const filterFreq = filter.frequency.setValueAtTime.mock.calls[0][0];
    expect(filterFreq).toBeGreaterThanOrEqual(2350);
    expect(filterFreq).toBeLessThanOrEqual(2650);

    // Resonant body click at 600Hz -> 200Hz
    const osc = mockCtx.createdOscillators[0];
    expect(osc.type).toBe("sine");
    const oscStartFreq = osc.frequency.setValueAtTime.mock.calls[0][0];
    expect(oscStartFreq).toBeGreaterThanOrEqual(570);
    expect(oscStartFreq).toBeLessThanOrEqual(630);

    const oscTargetFreq =
      osc.frequency.exponentialRampToValueAtTime.mock.calls[0][0];
    expect(oscTargetFreq).toBeGreaterThanOrEqual(190);
    expect(oscTargetFreq).toBeLessThanOrEqual(210);
  });

  it("synthesizes soft-bubble profile with smooth pitch-envelope sine sweep (480Hz -> 780Hz)", () => {
    synth.playKeyPressSound(SOUND_PROFILE_ID.SOFT_BUBBLE, "e");

    expect(mockCtx.createdOscillators.length).toBe(1);
    expect(mockCtx.createdGains.length).toBe(1);

    const osc = mockCtx.createdOscillators[0];
    expect(osc.type).toBe("sine");
    const oscStartFreq = osc.frequency.setValueAtTime.mock.calls[0][0];
    expect(oscStartFreq).toBeGreaterThanOrEqual(460);
    expect(oscStartFreq).toBeLessThanOrEqual(500);

    const oscTargetFreq =
      osc.frequency.exponentialRampToValueAtTime.mock.calls[0][0];
    expect(oscTargetFreq).toBeGreaterThanOrEqual(750);
    expect(oscTargetFreq).toBeLessThanOrEqual(810);

    expect(osc.start).toHaveBeenCalled();
    expect(osc.stop).toHaveBeenCalled();
  });

  it("does not create audio nodes when profile is mute", () => {
    synth.playKeyPressSound(SOUND_PROFILE_ID.MUTE, "a");
    expect(mockCtx.createdOscillators.length).toBe(0);
    expect(mockCtx.createdBufferSources.length).toBe(0);
    expect(mockCtx.createdGains.length).toBe(0);
  });

  it("does not create audio nodes when synthesizer is muted", () => {
    synth.setMuted(true);
    expect(synth.isMuted()).toBe(true);

    synth.playKeyPressSound(SOUND_PROFILE_ID.LINEAR, "a");
    expect(mockCtx.createdOscillators.length).toBe(0);
    expect(mockCtx.createdBufferSources.length).toBe(0);

    synth.setMuted(false);
    expect(synth.isMuted()).toBe(false);

    synth.playKeyPressSound(SOUND_PROFILE_ID.LINEAR, "a");
    expect(mockCtx.createdOscillators.length).toBeGreaterThan(0);
  });

  it("manages volume and clamps values between 0 and 1", () => {
    synth.setVolume(0.5);
    expect(synth.getVolume()).toBe(0.5);

    synth.setVolume(1.5);
    expect(synth.getVolume()).toBe(1);

    synth.setVolume(-0.5);
    expect(synth.getVolume()).toBe(0);
  });

  it("manages active sound profile", () => {
    expect(synth.getProfile()).toBe(SOUND_PROFILE_ID.LINEAR);

    synth.setProfile(SOUND_PROFILE_ID.CLICKY);
    expect(synth.getProfile()).toBe(SOUND_PROFILE_ID.CLICKY);

    // Calling play without profile uses current active profile
    synth.playKeyPressSound();
    expect(mockCtx.createdOscillators.length).toBeGreaterThan(0);
  });

  it("applies deterministic pitch variance within ±3% for different characters", () => {
    synth.playKeyPressSound(SOUND_PROFILE_ID.SOFT_BUBBLE, "a");
    synth.playKeyPressSound(SOUND_PROFILE_ID.SOFT_BUBBLE, "z");

    expect(mockCtx.createdOscillators.length).toBe(2);
    const firstFreqCall =
      mockCtx.createdOscillators[0].frequency.setValueAtTime.mock.calls[0][0];
    const secondFreqCall =
      mockCtx.createdOscillators[1].frequency.setValueAtTime.mock.calls[0][0];

    // Frequencies should vary slightly within ±3% of 480Hz
    expect(firstFreqCall).toBeGreaterThan(465);
    expect(firstFreqCall).toBeLessThan(495);
    expect(secondFreqCall).toBeGreaterThan(465);
    expect(secondFreqCall).toBeLessThan(495);
    expect(firstFreqCall).not.toBe(secondFreqCall);
  });

  it("gracefully handles environments without Web Audio API support", () => {
    const brokenSynth = new AudioSynthesizer({
      audioContextFactory: () => {
        throw new Error("AudioContext not supported");
      },
    });

    expect(() => {
      brokenSynth.playKeyPressSound(SOUND_PROFILE_ID.LINEAR, "a");
    }).not.toThrow();
  });

  it("exports default singleton audioSynthesizer", () => {
    expect(audioSynthesizer).toBeInstanceOf(AudioSynthesizer);
  });
});
