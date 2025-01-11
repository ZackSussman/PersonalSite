class AudioGenerator extends AudioWorkletProcessor {
    sampleArraysIndex;
    sampleArrays;
    constructor(options) {
        super();
        this.sampleArraysIndex = 0;
        this.sampleArrays = [...options.processorOptions.sampleArrays];
    }   
    process(inputs, outputs, parameters) {
        //console.log("processing at " + currentTime);
        if (this.sampleArraysIndex >= this.sampleArrays.length) {
            for (let output of outputs) {
                for (let i = 0; i < output[0].length; i++) {
                    output[0][i] = 0;
                    output[1][i] = 0;
                }
            }
            return true;
        }
        let sampleArray = this.sampleArrays[this.sampleArraysIndex];
        for (let output of outputs) {
            for (let i = 0; i < output[0].length; i++) {
                output[0][i] = sampleArray[i][0];
                output[1][i] = sampleArray[i][1];
            }
        }
        this.sampleArraysIndex += 1;
        return true;
    }
}

registerProcessor("AudioGenerator", AudioGenerator);