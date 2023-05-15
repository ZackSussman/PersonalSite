/*DIMENSIONS
Dimensions specify the high level ways we wish to understand and communicate music at certain moments in time.
The computer makes choices when converting the dimensions to audio
*/


/*
specifies an aspect of how a moment in time feels
each dimension has a unique constructor, defining what type of value that dimension can take on
each Dimension must also implement the methods canDimensionAplyToNonLeafLabels and canDimensionApplyToLeafLabels by
either returning true or false. 
Dimensions are used by being specified at certain labels, but not all dimensions make sense to be specified at all types of labels. 
*/
class Dimension {
	constructor() {
		if (this.constructor == Dimension) {
			throw new Error("Dimension is an abstract class and can't be instantiated");
		}
	}

	canApplyToNonLeafLabels() {
		throw new Error("canDimensionApplyToNonLeafLabels must be implemented");
	}

	canApplyToLeafLabels() {
		throw new Error("canDimensionApplyToLeafLabels must be implemented");
	}
}



//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//First we introduce the dimensions which at a high level live in the background and influence
//what types of sounds are used to implement pitched and non-pitched musical content, as well
//as some of the pitches of such content
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------
const PitchValue = {
	C: Symbol("A"),
	Db: Symbol("Db"),
	D: Symbol("D"),
	Eb: Symbol("Eb"),
	E: Symbol("E"),
	F: Symbol("F"),
	Gb: Symbol("Gb"),
	G: Symbol("G"),
	Ab: Symbol("Ab"),
	A: Symbol("A"),
	Bb: Symbol("Bb"),
	B: Symbol("B")
}
//now we begin specifying the actual dimensions!! (note that they are NOT in order of importance)
//1: TonalCenter
/*
	This is a slightly different concept for everyone due to ability to feel pitches. For me I think an accurate enough representation
	is a number from 0-11, wheras some people would need a range of frequency values of width 3-40 hz (if they can hear pitches more accurately).
	It would be the frequency that describes the tonic. The tonal center is the pitch that harmonies and melodies are felt with respect to. 
*/
//we don't need a type definition here because we represent a TonalCenter with a Pitch
class TonalCenter extends Dimension {
	//tonalCenter is a value from PitchValue
	constructor(tonalCenter) {
		this.tonalCenter = tonalCenter
	}

	//usually a tonal center is the same throughout sections of pieces so this will be super common
	canApplyToNonLeafLabels() {
		return true;
	}

	//Maybe some musician out there can perceive a key change for an instant in time but I don't think this is a very useful notion.
	//I claim that the point of a tonal center is to use it over a longer course of time so we don't want to give a value for this over just a leaf. 
	canApplyToLeafLabels() {
		return false;
	}
}


//2: Scale
/*
	This describes the set of pitches that harmony is felt to with respect to the fixed tonic (most commonly major, minor, etc.)
*/
const ScaleValue = {
	Major: Symbol("Major"),
	Minor: Symbol("Minor"),
	Dorian: Symbol("Dorian"),
	Mixolydian: Symbol("Mixolydian"),
	Lydian: Symbol("Lydian"),
	Phrygian: Symbol("Phrygian"),
	Locrian: Symbol("Locrian")
}

class Scale extends Dimension {
	//scalevalue is a value from ScaleValue
	constructor(scaleValue) {
		this.scaleValue = scaleValue
	}

	//the musical argument for all of these is the same as for the TonalCenter dimension
	canApplyToNonLeafLabels() {
		return true;
	}

	canApplyToLeafLabels() {
		return false;
	}
}



const Interval = {
	m2: Symbol("m1"), //half step
	M2: Symbol("Two"), //whole step
	m3: Symbol("m3"), //minor third
	M3: Symbol("M3"), //major third
	P4: Symbol("P4"), //perfect fourth
	Tritone: Symbol("Tritone"), //tritone
	P5: Symbol("P5"), //perfect fifth
	m6: Symbol("m6"), //minor sixth
	M6: Symbol("M6"), //major sixth
	m7: Symbol("m7"), //minor seventh
	M7: Symbol("M7"), //major seventh
	Octave: Symbol("Octave"), //octave
}

const Amount = {
	Low: Symbol("low"),
	Medium: Symbol("medium"),
	High: Symbol("high")
}

const Direction = {
	Towards: Symbol("towards"),
	Away: Symbol("away")
}

//3: Harmony
/*
	This ultimately boils down to the set of pitches that are perceived with respect to the scale and tonic above, along with a root note. 
	However, there are 2^12 such sets. To represent it as a set would definitely not capture our perception properly. 
	There are specific qualities to harmony that we care about more than others. For every set of notes, there are notes
	we can change and swap out that would create pretty much the same feeling. So then what are the distinguishing features?
	With harmony it is often not about what the notes are, but where the notes are going, among other qualities: see below
*/
class Harmony extends Dimension {
	//root: An interval relative to the tonic indicating the lowest note in the 'chord'. This is what the 'bass' would be 'playing'. 
	//dissonance: an Amount which describes how dissonant the chord is (Amount.low results in a consonant chord)
	//qDensity: an Amount which describes how many notes are in the chord (quantity density) (this is often described by musicians as 'color')
	//sDensity: an Amount which describes how spaced out the notes in the chord are (spacing density) 
	//direction: a Direction specify whether the motion of this chord is moving towards or away from 
	constructor(root, dissonance, qDensity, sDensity, direction) {
		this.root = root;
		this.dissonance = dissonance;
		this.qDensity = qDensity;
		this.sDensity = sDensity;
		this.direction = direction;
	}

	//yes! Harmony is used over longer periods of time commonly
	canApplyToNonLeafLabels() {
		return true;
	}

	//yes! Harmony is used at short moments of time all over the place
	canApplyToLeafLabels() {
		return true;
	}
}

//represents how close you feel to the source of your perception 
//often corresponds to dry/wet on reverb 
class Distance extends Dimension {
	//startAmount and endAmount are Amounts where Low corresponds to low distance and High is high distance
	//start is the Distance at the beginning of the label this is applied to and endAmount is the 
	//distance at the end of the label that this is applied to (they can be the same)
	//otherwise there will be a smooth transition from startAmount to endAmount
	constructor(startAmount, endAmount) {
		this.startAmount = startAmount;
		this.endAmount = endAmount;
	}

	canApplyToNonLeafLabels() {
		return true;
	}

	canApplyToLeafLabels() {
		return true;
	}
}


//how full is the overall sound? This roughly corresponds to 
//1) how much of the frequency spectrum is being used
//2) how dry is the overall sound? If it's too dry it won't sound that full
class Fullness extends Dimension {
	constructor(startAmount, endAmount) {
		this.startAmount = startAmount;
		this.endAmount = endAmount;
	}

	canApplyToNonLeafLabels() {
		return true;
	}

	canApplyToLeafLabels() {
		return true;
	}
}


//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//Next we introduce the dimensions which correspond to more concrete musical ideas 
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------


//TODO: add pulsating ones that slow down and/or speed up over the duration

//different ways in which we can perceive the changing of some aspect of a sound between two contrasting qualities over a duration
const PresenceStoryValue = {
	Pluck: Symbol("pluck"), //something happens quickly and just as quickly as it happened, fades to nothing. 
	Press: Symbol("press"), //something happens and then grows steadily, eventually leaving quickly but smoothly
	Fall: Symbol("fall"), //quick onset and a smooth decay 
	Suck: Symbol("suck"), //start from nothing and grow to full by the end
	PulsateSlap: Symbol("pulsate slap"), //quickly repeat an X many times in the span of the duration 
	PulsatePress: Symbol("pulsate press"),
	PulsateFall: Symbol("pulsate fall"),
	PulsateSuck: Symbol("pulsate suck"),
	//---lag variants of the rest push them to happen a bit after the start of the mental onset
	LagSlap: Symbol("lag slap"),
	LagPress: Symbol("lag press"),
	LagFall: Symbol("lag fall"), 
	//LagSuck excluded because it's actually hard to perceptually differenciate it from normal Suck: this is because in both of them we reach full capacity by the end of the duration. 
	//----compound story values that make sense
	SlapPress: Symbol("slap"), //a slap and press within the same duration
	SlapFall: Symbol("slap fall"), //a slap and fall within the same duration
	SlapSuck: Symbol("slap suck"), //a slap and suck within the same duration
	SlapLagSlap: Symbol("slap lag slap"), //yeah this one should really be used quite rarely 
	SlapLagPress: Symbol("slap lag press"), //much more common! A slap followed by a delayed press (this is normally how we perceive sidechaining!)
	SlapLagFall: Symbol("slap lag fall"), //another fun one! A slap followed by a delayed fall
}

/*
	This is the dimension that controls if there is a sound making this pitch during the duration it is applied to
*/
class Voice extends Dimension {
	constructor(pitchValue, presenceValue) {
		this.pitchValue = pitchValue;
		this.presenceValue = presenceValue;
	}

	canApplyToNonLeafLabels() {
		return true;
	}

	canApplyToLeafLabels() {
		return true;
	}
}



//corresponds to the feeling that a kick drum elicits
//note: we are getting into the sound level here a bit because we do have a perception of sound directly when kicks play due to the nature of small temporality that they punch with 
class Kick extends Dimension {
	//boominess is an Amount corresponding to about how much low end the kick takes up and for how long after it kicks 
	//clickyness is an Amount corresponding to roughly to how much of the high end click the kick has 
	constructor(boominess, clickyness) {
		this.boominess = boominess;
		this.clickyness = clickyness;
	}

	//maybe you want the feeling of the kick to correspond to a grouping of some smaller things
	canApplyToNonLeafLabel() {
		return true;
	}

	//absolutely
	canApplyToLeafLabels() {
		return true;
	}
}

//similar to kick but for a snare
class Snare extends Dimension {
	/*
		tonality: an Amount where Low corresponds to a noisy snare with not much pitch, 
					 Medium corresponds to some pitch, and High gives a very pitched snare (the pitch is taken from the Scale and Tonic dimensions)
		height: where the snare lives in pitch, is an Amount where Low corresponds to a low pitched snare, 
					Medium and High correspond to medium and high pitched snares respectively
		tail: also an Amount where Low corresponds to a clean hit with not much after, Medium gives a fair tail, and High gives a longer tail 
		preClick: an Amount corresponding in the normal way to how much perceptual emphasis there may be on a sound that would transition into the smare from beforehand
	*/
	constructor(tonality, height, tail, preClick) {
		this.tonality = tonality;
		this.height = height;
		this.tail = tail;
		this.preClick = preClick;
	}

	canApplyToNonLeafLabel() {
		return true;
	}

	canApplyToLeafLabel() {
		return true;
	}
}










