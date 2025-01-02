

/// <reference path="../../../node_modules/monaco-editor/monaco.d.ts" />
import MotorMusicParserListener from "../../../antlr/generated/MotorMusicParserListener";


type audio = [number, number][];

//if there are ever issues double check these are also being used by the browser
const BUFFER_SIZE = 128; 
const SAMPLE_RATE = 48000;

//allows the js to stream our computed audio by chunking it into sizes of BUFFER_SIZE
export type audioStream = [number, number][][];


function audioToAudioStream(audio : audio) : audioStream {
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


export class AudioGeneratorListener extends MotorMusicParserListener {

    syllableLength : number;


    //this is where we will write the final audio to
    audioStream : audioStream;

    constructor(syllableLength : number) {
        super();
        this.syllableLength = syllableLength;
        let audio = [];
        let length = 10; //in seconds for now just testing this
        for (let i = 0; i < length * SAMPLE_RATE; i += 1) {
            audio.push([Math.random(), Math.random()]);
        }
        this.audioStream = audioToAudioStream(audio);
    }


}