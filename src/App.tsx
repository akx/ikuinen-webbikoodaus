import React from "react";
import "./App.css";
import { loadSampleFile, loadSampleZip, Sample } from "./samples";
import Player from "./Player";
import { LabeledInput } from "./LabeledInput";

const ctx = new AudioContext();

const App: React.FC = () => {
  const [samples, setSamples] = React.useState<Sample[] | undefined>();
  const [convolutionResponse, setConvolutionResponse] = React.useState<
    Sample | undefined
  >();
  const [convolutionGain, setConvolutionGain] = React.useState<number>(0);
  const [finalGain, setFinalGain] = React.useState<number>(1);
  const [speed, setSpeed] = React.useState<number>(1);
  React.useEffect(() => {
    loadSampleZip(ctx, "./samples.zip").then(
      newSamples => {
        setSamples(newSamples);
      },
      err => {
        alert(`Failed to load samples, sorry!\n${err}`);
        throw err;
      }
    );
  }, []);
  React.useEffect(() => {
    loadSampleFile(ctx, "./bedroom.opus").then(sample => {
      setConvolutionResponse(sample);
    });
  }, []);
  if (samples === undefined) {
    return <div>Loading samples...</div>;
  }

  return (
    <div className="App">
      <h1>Ikuinen Webbikoodaus</h1>
      <Player
        convolutionSample={convolutionResponse}
        convolutionGain={convolutionGain}
        finalGain={finalGain}
        speed={speed}
        ctx={ctx}
        samples={samples}
      />
      {samples?.length} samples loaded. Hit the button to play.
      <br />
      {convolutionResponse ? (
        <LabeledInput
          label="Ambience"
          type="range"
          min={0}
          max={5}
          step={0.1}
          value={convolutionGain}
          onChange={e => setConvolutionGain(e.target.valueAsNumber)}
        />
      ) : null}
      <LabeledInput
        label="Speed"
        type="range"
        min={0.02}
        max={4}
        step={0.1}
        value={speed}
        onChange={e => setSpeed(e.target.valueAsNumber)}
      />
      <LabeledInput
        label="Volume"
        type="range"
        min={0}
        max={2}
        step={0.1}
        value={finalGain}
        onChange={e => setFinalGain(e.target.valueAsNumber)}
      />
      Original content from <a href="https://webbidevaus.fi/">Webbidevaus</a>{" "}
      (CC BY-NC).
      <br />
      Code by @akx (<a href="https://akx.github.io">Github</a>,{" "}
      <a href="https://twitter.com/akx">Twitter</a>).
    </div>
  );
};

export default App;
