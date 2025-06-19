
let major_scale_scan = [0, 2, 4, 5, 7, 9, 11, 12];

//map the unit range that is used for tension values to the frequency value of a note from the major scale
export function map_unit_range_to_major_scale_freq(tension : number) {
    let note = undefined
    //round for normal notes but not at the final transition
    if (tension < 6/7) 
        note = Math.round(tension * 7);
    else
        note = Math.floor(tension * 7);
    return 440 * Math.pow(2, major_scale_scan[note]/12);
}