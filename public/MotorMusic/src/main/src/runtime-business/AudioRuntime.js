export let audioContext = null;
let processorNode = null;
let gainNode = null;


import { PLAYBACK_SAMPLE_RATE } from "../../generated-javascript/main/src/runtime-business/RuntimeConstants.js";
// audio for the current code
// stored as an array of arrays of arrays. 
// [block1, block2, block3], where each blocki = [[left1, right1], [left2, right2], ...]
let computedAudio = undefined;

export function initializeAudioRuntime() {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext({ latencyHint: "interactive", sampleRate: PLAYBACK_SAMPLE_RATE});
    audioContext.resume();
  }
  return audioContext;
}

export function setComputedAudio(audio) {
  computedAudio = audio;
}

//returns the starting time of audio playback
export async function beginNewPlayback() {
  audioContext = initializeAudioRuntime();

  if (computedAudio == undefined) {
    throw new Error("error: cannot playback when computedAudio is undefined");
  }

  try {
    await audioContext.resume();
  } catch (error) {
    console.error("Unable to resume audio context:", error);
    return;
  }

  // Disconnect previous nodes if they exist
  if (processorNode) {
    try { processorNode.disconnect(); } catch (_) {}
    processorNode = null;
  }

  if (gainNode) {
    try { gainNode.disconnect(); } catch (_) {}
    gainNode = null;
  }

  try {
     processorNode = new AudioWorkletNode(audioContext, "AudioGenerator", {
      channelCount: 2,
      channelCountMode: 'explicit',
      channelInterpretation: 'speakers',
      processorOptions: {
        sampleArrays: computedAudio,
      }
  });
  } catch (e) {
    try {
      const version = Date.now(); // Unique version for cache busting
      await audioContext.audioWorklet.addModule(`src/audio/AudioGenerator.js?version=${version}`);
      processorNode = new AudioWorkletNode(audioContext, "AudioGenerator", {
        channelCount: 2,
        channelCountMode: 'explicit',
        channelInterpretation: 'speakers',
        processorOptions: {
          sampleArrays: computedAudio,
        }
      });
    } catch (e2) {
      console.error("Error creating AudioWorkletNode:", e2);
      return;
    }
  }

  gainNode = audioContext.createGain();
  processorNode.connect(gainNode).connect(audioContext.destination);
  return audioContext.currentTime;
}

export function fadeOutAudio() {
  if (!audioContext || !gainNode || !processorNode) return;

  const fadeOutDuration = 0.1;
  const currentTime = audioContext.currentTime;

  gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
  gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);

  setTimeout(() => {
    try { processorNode.disconnect(); } catch (_) {}
    try { gainNode.disconnect(); } catch (_) {}
    processorNode = null;
    gainNode = null;

    try {
      audioContext.close();
    } catch (_) {}
    audioContext = null;
  }, fadeOutDuration * 1000);
}
