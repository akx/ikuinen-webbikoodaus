import { Sample } from "./samples";
import sample from "lodash/sample";
import logo from "./logo.png";
import React from "react";

const sampleNameHistory: string[] = [];

function pickNextSample(samples: Sample[]): Sample | undefined {
  let nextSample: Sample | undefined;
  for (let i = 0; i < 10; i++) {
    nextSample = sample(samples); // heh
    if (!nextSample || !sampleNameHistory.includes(nextSample.name)) {
      break;
    }
  }
  if (!nextSample) {
    return undefined;
  }
  sampleNameHistory.push(nextSample.name);
  if (sampleNameHistory.length >= 25) {
    sampleNameHistory.shift();
  }
  return nextSample;
}

interface PlayerProps {
  samples: Sample[];
  ctx: AudioContext;
  convolutionSample: Sample | undefined;
  convolutionGain: number;
  finalGain: number;
  speed: number;
}

class PlayerCore {
  private readonly ctx: AudioContext;
  private readonly samples: Sample[];
  private readonly convolverGainNode: GainNode;
  private readonly convolverNode: ConvolverNode;
  private readonly finalGainNode: GainNode;
  private speed: number = 1;
  private isPlaying: boolean = false;
  public newSampleCallback: (() => void) | undefined = undefined;

  constructor(ctx: AudioContext, samples: Sample[]) {
    this.ctx = ctx;
    this.samples = samples;
    this.finalGainNode = ctx.createGain();
    this.finalGainNode.connect(ctx.destination);
    this.convolverNode = ctx.createConvolver();
    this.convolverNode.connect(this.finalGainNode);
    this.convolverGainNode = ctx.createGain();
    this.convolverGainNode.connect(this.convolverNode);
  }

  public setConvolutionSample(sample: Sample): void {
    this.convolverNode.buffer = sample.audioBuffer;
  }

  public start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.playNextSample();
  }

  public stop(): void {
    this.isPlaying = false;
  }

  public setParameters(
    newSpeed: number,
    newConvolverGain: number,
    newFinalGain: number
  ): void {
    this.speed = newSpeed;
    this.convolverGainNode.gain.value = newConvolverGain;
    this.finalGainNode.gain.value = newFinalGain;
  }

  private playNextSample = () => {
    if (!this.isPlaying) {
      return;
    }
    const nextSample = pickNextSample(this.samples);
    if (!nextSample) {
      this.stop();
      return;
    }

    const node = this.ctx.createBufferSource();
    node.playbackRate.value = this.speed;
    node.buffer = nextSample.audioBuffer;
    node.onended = () => {
      this.playNextSample();
    };
    node.connect(this.finalGainNode);
    if (this.convolverGainNode.gain.value > 0) {
      node.connect(this.convolverGainNode);
    }
    node.start();
    if (this.newSampleCallback) {
      this.newSampleCallback();
    }
  };
}

// wherein one wonders if there was any point in making this a react component

const Player: React.FC<PlayerProps> = props => {
  const {
    samples,
    ctx,
    convolutionSample,
    convolutionGain,
    finalGain,
    speed
  } = props;
  const [angle, setAngle] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [core, setCore] = React.useState<PlayerCore | undefined>();
  React.useEffect(() => {
    const newCore = new PlayerCore(ctx, samples);
    setCore(newCore);
    return () => newCore.stop();
  }, [ctx, samples]);
  React.useEffect(() => {
    if (!(convolutionSample && core)) {
      return;
    }
    core.setConvolutionSample(convolutionSample);
  }, [core, convolutionSample]);
  React.useEffect(() => {
    if (core) {
      core.setParameters(speed, convolutionGain, finalGain);
    }
  }, [core, speed, convolutionGain, finalGain]);
  React.useEffect(() => {
    if (core) {
      core.newSampleCallback = () => setAngle(-15 + Math.random() * 30);
    }
  }, [core, setAngle]);

  const start = () => {
    if (core && !isPlaying) {
      setIsPlaying(true);
      core.start();
    }
  };
  return (
    <button
      onClick={start}
      disabled={isPlaying}
      style={{ transform: isPlaying ? `rotate(${angle}deg)` : undefined }}
    >
      <img src={logo} alt="Logo" />
    </button>
  );
};

export default Player;
