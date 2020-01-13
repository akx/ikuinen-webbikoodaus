import React from "react";
import "./App.css";
import logo from "./logo.png";
import { loadSampleZip, Sample } from "./samples";
import sample from "lodash/sample";

const ctx = new AudioContext();

const App: React.FC = () => {
  const [samples, setSamples] = React.useState<Sample[] | undefined>();
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  React.useEffect(() => {
    loadSampleZip(ctx).then(newSamples => {
      setSamples(newSamples);
    });
  }, []);
  if (samples === undefined) {
    return <div>Loading samples...</div>;
  }
  const playNextSample = () => {
    const nextSample = sample(samples); // heh
    if (!nextSample) {
      setIsPlaying(false);
      return;
    }
    const node = ctx.createBufferSource();
    node.buffer = nextSample.audioBuffer;
    node.onended = () => {
      playNextSample();
    };
    node.connect(ctx.destination);
    node.start();
  };
  const start = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      playNextSample();
    }
  };
  return (
    <div className="App">
      <h1>Ikuinen Webbikoodaus</h1>
      <button onClick={start} disabled={isPlaying}>
        <img src={logo} alt="Logo" />
      </button>
      {samples?.length} samples loaded. Hit the button to play.
      <br />
      <br />
      Original content from <a href="https://webbidevaus.fi/">
        Webbidevaus
      </a>{" "}
      (CC BY-NC).
      <br />
      Code by @akx (<a href="https://akx.github.io">Github</a>,{" "}
      <a href="https://twitter.com/akx">Twitter</a>).
    </div>
  );
};

export default App;
