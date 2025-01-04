

/// <reference path="../../../node_modules/monaco-editor/monaco.d.ts" />
import MotorMusicParserListener from "../../../antlr/generated/MotorMusicParserListener";

import {EmptyProgramContext, NonEmptyProgramContext, SyllableContext, TimeTaggedEmptyContext, TimeTaggedSyllableContext, EmptyContext} from "../../../antlr/generated/MotorMusicParser";


import {audio, audioStream, audioToAudioStream, silence, SAMPLE_RATE, numSamplesToDuration, seconds} from "../audio/Audio";
import {makeSin} from "../audio/generators/Sin";
import {applyAdsr} from "../audio/transformers/Envelope";


export class AudioGeneratorListener extends MotorMusicParserListener {

    syllableLength : seconds;


    //this is where we will write the final audio to
    audioStream : audioStream;


    //we build this up as we process the code and at the end we convert it to the stream
    audio : audio;


    constructor(syllableLength : number) {
        super();
        this.syllableLength = syllableLength / 1000; //syllableLength on input is in milliseconds 
        this.audio = [];
    }

    //use this, which is O(|a|) for linear audio generation
    addToAudio(a : audio) {
        for (let sample of a) {
            this.audio.push(sample);
        }
    }
    

    //construct the audio for a syllable and add to our built up audio
    enterSyllable =  (_ : SyllableContext) => {
        let sinWave : audio = makeSin(440, this.syllableLength);
        let enveloped : audio = applyAdsr(sinWave, 
            this.syllableLength / 10,
            this.syllableLength / 10,
            0.5,
            this.syllableLength / 3
        )
        this.addToAudio(
           enveloped
        );
    };

    enterTimeTaggedSyllable = (ctx : TimeTaggedSyllableContext) => {
        let syllableLengthMultiplier = Number(ctx.NUMBER().getText());
        this.addToAudio(
            applyAdsr
                (
                    makeSin(440, syllableLengthMultiplier * this.syllableLength),
                    syllableLengthMultiplier * this.syllableLength / 10,
                    syllableLengthMultiplier * this.syllableLength / 10,
                    0.5,
                    syllableLengthMultiplier * this.syllableLength / 3
                )
        );
    }

    enterEmpty = (_ : EmptyContext) => {
        this.addToAudio(
            silence(this.syllableLength)
        )
    }

    enterTimeTaggedEmpty = (ctx: TimeTaggedEmptyContext) => {
        let noSoundLength = Number(ctx.NUMBER().getText());
        this.addToAudio(
            silence(this.syllableLength * noSoundLength)
        )
    }


    //when finished, convert our built up audio to the audio stream
    exitNonEmptyProgram =  (_ : NonEmptyProgramContext) => {
        this.audioStream = audioToAudioStream(this.audio);
    }
    exitEmptyProgram =  (_ : EmptyProgramContext) => {
        this.audioStream = [];
    }


}