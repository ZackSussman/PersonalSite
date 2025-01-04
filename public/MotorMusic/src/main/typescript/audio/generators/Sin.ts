//generate sin waves 

import {audio, SAMPLE_RATE, durationToSamples, seconds} from "../Audio";

//generate a mono sin wave at the specified frequency (in hertz) for the given duration (in seconds)
export function makeSin(frequency : number, duration : seconds) : audio {
    let res = [];
    let secondsPerSample = 1 / SAMPLE_RATE;
    const num_samples = durationToSamples(duration);
    let t = 0;
    for (let i = 0; i < num_samples; i += 1) {
        let sampleValue = Math.sin(2.0 * Math.PI * frequency * t);
        res.push([sampleValue, sampleValue]);
        t += secondsPerSample;
    }
    return res;
}