

/// <reference path="../../../../node_modules/monaco-editor/monaco.d.ts" />
import MotorMusicParserListener from "../../../../antlr/generated/MotorMusicParserListener";

import {EmptyProgramContext, NonEmptyProgramContext, SyllableContext, TimeTaggedEmptyContext, TimeTaggedSyllableContext, EmptyContext, DirectionSpecContext} from "../../../../antlr/generated/MotorMusicParser";
import { durationToSamples } from "../audio/Audio";
 import {DELAY_BEFORE_PLAYBACK_START} from "../../runtime-business/RuntimeConstants";
import {audio, audioStream, audioToAudioStream, silence, seconds, sampleMap} from "../audio/Audio";
import {makeSin} from "../audio/generators/Sin";
import {applyAdsr} from "../audio/transformers/Envelope";

import {BraceAccumData} from "./Animations";

import { map_unit_range_to_major_scale_freq } from "../music_theory/Scales";

export class AudioGeneratorListener extends MotorMusicParserListener {

    syllableLength : seconds;


    //this is where we will write the final audio to
    audioStream : audioStream;


    //we build this up as we process the code and at the end we convert it to the stream
    audio : audio;

    //bracketsAccumData and parensAccumData are passed in from the animation parsing, they
    //store valuable info that allow ur to compute amplitudes for our signals
    //bracketsAccumData : Map<ConcatContext, BraceAccumData>
    parensAccumData : Map<DirectionSpecContext, BraceAccumData>

    //store the set of current braces that are in scope
    currentParensInScope : DirectionSpecContext[]


    currentSyllableIndex : number //store the (global) index of the current syllable

    constructor(syllableLength : number, 
                parensAccumData : Map<DirectionSpecContext, BraceAccumData>) {
        super();
        this.syllableLength = syllableLength / 1000; //syllableLength on input is in milliseconds 
        this.parensAccumData = parensAccumData;
        this.currentParensInScope = [];
        console.log("length is " +durationToSamples(DELAY_BEFORE_PLAYBACK_START / 1000) );
        this.audio = new Array(durationToSamples(DELAY_BEFORE_PLAYBACK_START / 1000)).fill([0, 0]); //this is to fix the initial click of starting the audio context and then throwing sound out, it just forces the audio to start peacefully for about .1 seconds first
        this.currentSyllableIndex = 0;
    }


    private computeTensionLowerBound() {
        return Math.pow(0.5, this.currentParensInScope.length);
    }


    
    //this algorithm is particularly tricky to get right...we essentially have two types of 
    //linear 'triangle' curves each with a particular displacement from the center line. 
    //case 1: 
    //   {a b c | d e f}
    //    linearly ramps from a to d from 1 to MIN_TENSION and 
    //    d to an invisible syllable after f from MIN_TENSION to 1
    //case 2:
    //   (a b c | d e f)
    //    linearly ramps a to d from MIN_TENSION to 1 and
    //    d to an invisible syllable after f from 1 to MIN_TENSION
    private getCurrentSyllableTension() {
        const MIN_TENSION = 0.5
        let tension = 1;
        for (let directionSpecCtx of this.currentParensInScope) {
            let parenInfo = this.parensAccumData.get(directionSpecCtx);
            //need to determine for this particular level of motion, whether we are currently headed towards or away from, 
            //and where we are within that chunk             
            //parenInfo.sectionStartIndices is the sorted array of start indices of each section for this brace. Thus, 
            //the last one which is less than or equal to our start index is the first one we belong to. Note we may
            //not always obtain equality due to nesting of direction specs
            let currentSectionIndex = parenInfo.sectionStartIndices.findLastIndex(n => n <= this.currentSyllableIndex);
            let currentSectionFirstSyllableIndex = parenInfo.sectionStartIndices[currentSectionIndex];
            //pretty sure we can show that currentSectionIndex is never the last one due to how the tacked on one will never be the current syllable as the brace would be out of scope at that point
            let firstIndexAfterThisChunk = parenInfo.sectionStartIndices[currentSectionIndex + 1];
            let areWeGoingTowards = (parenInfo.startsWithTowards) == (currentSectionIndex % 2 == 0);
            let percentThroughChunk = (this.currentSyllableIndex - currentSectionFirstSyllableIndex) / (firstIndexAfterThisChunk - currentSectionFirstSyllableIndex);
            if (areWeGoingTowards) {          
                tension *= percentThroughChunk + MIN_TENSION * (1 - percentThroughChunk);
            }
            else {
                tension *= (1 - percentThroughChunk) + MIN_TENSION * percentThroughChunk;
            }
        }
        return tension
    }
    

    //use this, which is O(|a|) for linear audio generation
    addToAudio(a : audio) {
        for (let sample of a) {
            this.audio.push(sample);
        }
    }

    enterDirectionSpec = (ctx: DirectionSpecContext) => {
        this.currentParensInScope.push(ctx);
    }

    exitDirectionSpec = (_: DirectionSpecContext) => {
        this.currentParensInScope.pop();
    }
    

    //construct the audio for a syllable and add to our built up audio
    enterSyllable =  (_ : SyllableContext) => {
        let tension = this.getCurrentSyllableTension();
        let tensionLowerBound = this.computeTensionLowerBound();
        let tensionRampedFromZeroToOne = 1; //this is the value if tensionLowerBound == 1
        if (tensionLowerBound < 1)
            tensionRampedFromZeroToOne = tension/(1 - tensionLowerBound) - (tensionLowerBound/(1 - tensionLowerBound));
        let sinWave : audio = makeSin(map_unit_range_to_major_scale_freq(tensionRampedFromZeroToOne), this.syllableLength);
        let attackTime = this.syllableLength / 10;
        let decay =  (this.syllableLength - attackTime) * Math.pow(tensionRampedFromZeroToOne, 0.5);
        if (decay < attackTime) {
            decay = attackTime;
        }
        let enveloped : audio = applyAdsr(sinWave, 
            attackTime,
            decay,
            0,
            0,
            .5 + 2*(1 - tensionRampedFromZeroToOne) //exponent
        )
        this.addToAudio(
           enveloped.map((sample) => sampleMap(sample, (sample) => sample * Math.sqrt(tension)))
        );
    };

    exitSyllable = (_: SyllableContext) => {
        this.currentSyllableIndex += 1;
    }
    exitTimeTaggedSyllable = (_ : TimeTaggedSyllableContext) => {
        this.currentSyllableIndex += 1;
    }
    exitEmpty = ( _ : EmptyContext) => {
        this.currentSyllableIndex += 1;
    }
    exitTimeTaggedEmpty = (_: TimeTaggedEmptyContext) => {
        this.currentSyllableIndex += 1;
    }

    enterTimeTaggedSyllable = (ctx : TimeTaggedSyllableContext) => {
        let tension = this.getCurrentSyllableTension();
        let syllableLengthMultiplier = Number(ctx.NUMBER().getText());
        let attackTime = this.syllableLength * syllableLengthMultiplier / 10;
        let thisSyllableLength = this.syllableLength * syllableLengthMultiplier;
        let tensionLowerBound = this.computeTensionLowerBound();
        let tensionRampedFromZeroToOne = 1;
        if (tensionLowerBound < 1)
            tensionRampedFromZeroToOne = tension/(1 - tensionLowerBound) - (tensionLowerBound/(1 - tensionLowerBound));
    
        let decay  = (thisSyllableLength - attackTime) * Math.pow(tensionRampedFromZeroToOne, 0.5);
        if (decay < attackTime) {
            decay = attackTime;
        }
        this.addToAudio(
            applyAdsr
                (
                    makeSin(map_unit_range_to_major_scale_freq(tensionRampedFromZeroToOne), thisSyllableLength),
                    attackTime,
                    decay,
                    0,
                    0,
                    .5 + 2*(1 - tensionRampedFromZeroToOne) //exponent
                ).map((sample) => sampleMap(sample, (sample) => sample * Math.sqrt(tension)))
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