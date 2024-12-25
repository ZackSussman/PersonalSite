class NoiseGenerator extends AudioWorkletProcessor {
    constructor() {
        super();
        console.log("initialized our little noise generator");
    }   

    static get parameterDescriptors() {
        return [{
            name: 'gain',
            defaultValue: 0.5,
            minValue: 0.0,
            maxValue: 1
        }]
    }

    process(inputs, outputs, parameters) {
        let gain = parameters.gain[0];
        for (let output of outputs) {
            for (let i = 0; i < output[0].length; i++) {
                //stereo white noise 
                output[0][i] = (2.0 * Math.random() - 1) * gain;//left
                output[1][i] = (2.0 * Math.random() - 1) * gain; //right
            }
        }
        return true;
    }
}

registerProcessor("NoiseGenerator", NoiseGenerator);