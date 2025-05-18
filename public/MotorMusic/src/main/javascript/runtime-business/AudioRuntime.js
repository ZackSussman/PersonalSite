let audioContext = null;


//audio for the current code
//stored as an array of arrays of arrays. 
//[block1, block2, block3], where each blocki = [[left1, right1], [left2, right2], ...]
var computedAudio = undefined;

export function initializeAudioRuntime() {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext({ latencyHint: "interactive" });
    audioContext.resume();
   // console.log("AudioContext created");
  } else {
   // console.log("Reusing existing AudioContext");
  }
  return audioContext;
}

export function setComputedAudio(audio) {
    computedAudio = audio;
}


//TO REFACTOR: the fadeout audio function relies on data which is sit wethin this beginNewPlayback function
export function beginNewPlayback() {

  let audioContext = initializeAudioContext();
  let audioContextStartTime = Date.now();
  try {
    audioContext.resume();
  } catch (error) {
    console.log("UNABLE tO RESUME AUDIO CONTEXT: ", error)
  }
  //("the state of the audio context is " + audioContext.state);
  let processorNode;
 
  /*
  try {
    processorNode = new AudioWorkletNode(audioContext, "AudioGenerator");
  } catch (e) {
    try {
      const version = Date.now(); // Use a timestamp or unique version
      await audioContext.audioWorklet.addModule(`src/audio/AudioGenerator.js?version=${version}`);
      processorNode = new AudioWorkletNode(audioContext, "AudioGenerator", {
        channelCount: 2,  // Force stereo output (2 channels)
        channelCountMode: 'explicit',  // Ensure the node always has 2 channels
        channelInterpretation: 'speakers',  // Ensures stereo output as expected
        processorOptions: {
          sampleArrays: computedAudio, //replace with sample arrays given from typescript
        }
      });
    } catch (e) {
      console.log(`** Error: Unable to create worklet node: ${e}`);
    }
  }
  const gainNode = audioContext.createGain();
  processorNode.connect(gainNode).connect(audioContext.destination);*/
}

export function fadeOutAudio() {
    const fadeOutDuration = 0.1;
    const currentTime = audioContext.currentTime;

    // Schedule a smooth fade-out
    gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime); // Set current gain
    gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);

    // Disconnect the processorNode after the fade-out is complete
    setTimeout(() => {
      //  console.log("number of inputs is " + audioContext.destination.numberOfInputs);
        processorNode.disconnect();
        gainNode.disconnect();
        audioContext.close();
    }, fadeOutDuration * 1000);
}
  