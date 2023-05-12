
//GLOBALS--------------------------------
var labelField = {} //global dictionary to map label names to label objects
var UNIT_PULSE_DURATION = .25; //in seconds
//-----------------------------------------


function setUnitPulse(time) {
	UNIT_PULSE_DURATION = time;
}

class Label {
	//name: a string identifier used to identify this label
	//containment: an array of labels which are the labels perceived linearly during the perception of this label
	//			   (an empty list means this label is perceived on its own (and is a leaf))
	//duration: the amount of time in seconds that the chunk of audio eliciting the perception of this label durates
	constructor(name, containment, duration) {
		this.name = name;
		this.containment = containment;
		this.duration = duration;
	}

	getDuration() {
		return this.duration;
	}

	getContainment() {
		return this.containment;
	}

	
}

//make and/or return a label which corresponds to n unit pulses
function nUnit(n) {
	//take a number and give a string that hopefully no user would use as a label name for that number
	function encodeNUnit(n) {
		return "!!__@" + n.toString() + "!@__!";
	}
	let labelName = encodeNUnit(n);
	if (labelName in labelField) {
		return labelName;
	}
	labelField[labelName] = new Label(labelName, [], n * UNIT_PULSE_DURATION);
}

//name: a string identifier used to identify this label
//durationLabel: the name of a label who's duration should be the duration of this label
function addSimpleLabel(name, durationLabel) {
	if (name in labelField) {
		print("error in addSimpleLabel: label " + name + " already exists!");
		return;
	}
	labelField[name] = new Label(name, [], labelField[durationLabel].getDuration());
}

//name: a string identifier used to identify this label
//containment: an array of label names to be contained within this label
//all labels in containment must already exist, the resulting label is felt by
//the concatenation of the perception of the labels in containment
function addGroupingLabel(name, containment) {
	if (name in labelField) {
		print("error in addGroupingLabel: label " + name + " already exists!");
	}
	var duration = 0;
	for (contained in containment) {
		if (!(contained in labelField)) {
			print("error in addGroupingLabel: label " + contained + " does not yet exist");
			return;
		}
		duration += labelField[contained].getDuration()
	}
	labelField[name] = new Label(name, containment, duration)
}


//name: a string identifier used to identify this label
//subs: an array of strings of labels that must not yet exist
//durationLabel: a string identifier identifying the name of the label who's duration will be the duration of this one
//make a label with containment subs where each sub is equally spaced in perceptual time with total duration according to durationLabel
function addMultiLabel(name, subs, durationLabel) {
	if (subs.length < 2) {
		print("error in addMultiLabel: not enough sub labels were given");
		return;
	}
	if (!(durationLabel in labelField)) {
		print("error in addMultiLabel: duration label " + durationLabel + " does not exist!");
		return;
	}
	let totalDuration = labelField[durationLabel].getDuration();
	let subDuration = totalDuration / length(subs);
	for (subName in subs) {
		labelField[subName] = new Label(subName, [], subDuration);
	}
	labelField[name] = new Label(name, subs, totalDuration);
}

//name: a string identifier used to identify this label
//containmentLabels: a list of label names that must all exist
//adds a label who's duration is the sum of the durations of the labels in containmentLabels,
// without creating a grouping label out of it (label name is only one swing of the combined duration)
function addSimpleLabelWithConcatDuration(name, containmentLabels) {
	if (containmentLabels.length < 2) {
		print("error in addSimpleLabelWithConcatDuration: not enough labels");
		return;
	}
	var duration = 0;
	for (label in containmentLabels) {
		if (!(label in labelField)) {
			print("error in addSimdleLabelWithConcatDuration: label " + label + " does not exist!");
			return;
		}
		duration += labelField[label].getDuration();
	}
	labelField[name] = new Label(name, [], duration);
}


//return an array of the time sorted leaves of the label tree rooted at label name
function getLabelLeaves(name) {
	if (!(name in labelField)) {
		print("error in getLabelLeaves: label " + name + " does not exist!");r
		return;
	}
	let containment = labelField[name].getContainment();
	if (containment.length == 0) {
		return [name];
	}
	return containment.map(getLabelLeaves).flat();
}

