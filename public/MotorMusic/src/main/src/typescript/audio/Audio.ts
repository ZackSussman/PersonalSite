

//we represent audio as a list of tuples, where the left value is the left channel and the right 
//value is the right channel 
export type audio = [number, number][]

//global values for our audio
export const BUFFER_SIZE = 128;
import {PLAYBACK_SAMPLE_RATE} from "../../runtime-business/RuntimeConstants";

//an audio stream is a list of the audios where each audio has length BUFFER_SIZE
export type audioStream = audio[]

export type seconds = number //used to specify when an input to an audio function is in seconds

//utility for converting from a duration in seconds to the number of samples that will take (rounded)
export function durationToSamples(duration : seconds) {
    return Math.round(PLAYBACK_SAMPLE_RATE * duration);
}

export function numSamplesToDuration(numSamples : number) {
    return numSamples / PLAYBACK_SAMPLE_RATE;
}

//utility for constructing mono signals
export function sampleMap(sample : [number, number], f : (sample : number) => number ) : [number, number] {
    return [f(sample[0]), f(sample[1])];
}

//make silence
export function silence(duration : seconds) : audio {
    let numberOfSamples = durationToSamples(duration);
    return Array(numberOfSamples).fill([0, 0]);
}


//utility for getting an audio stream just from audio
export function audioToAudioStream(audio : audio) : audioStream {
    let res : audioStream = [];
    let audioBufferStartIndex = 0;
    while (audioBufferStartIndex + BUFFER_SIZE <= audio.length) {
        res.push(audio.slice(audioBufferStartIndex, audioBufferStartIndex + BUFFER_SIZE));
        audioBufferStartIndex += BUFFER_SIZE;
    }
    if (audioBufferStartIndex < audio.length) {
        let finalSamples : audio = audio.slice(audioBufferStartIndex, audio.length);
        let zeroPadding : audio = (new Array(BUFFER_SIZE - finalSamples.length)).fill([0, 0]);
        res.push(finalSamples.concat(zeroPadding));
    }
    return res;
}




