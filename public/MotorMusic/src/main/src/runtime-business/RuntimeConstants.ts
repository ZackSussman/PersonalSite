export const DELAY_BEFORE_PLAYBACK_START = 100 //in miliseconds, this is used to let the audio thread have some peace before we start throwing sound back
export const CORRECTION_FACTOR = 50; //even with the logic in place above, there is some drift between animation and audio thread. This corrects for it 
export const PLAYBACK_SAMPLE_RATE = 48000;
