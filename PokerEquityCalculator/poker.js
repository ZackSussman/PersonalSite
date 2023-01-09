function assert(condition) {
    if (!condition) {
        throw "Assertion failed";
    }
}

function deepEqual(object1, object2) {
	if (object1 === undefined && object2 === undefined) {
		return true;
	}
	else if (object1 === undefined) {
		return false;
	}
	else if (object2 === undefined) {
		return false;
	}
	const keys1 = Object.keys(object1);
	const keys2 = Object.keys(object2);
	if (keys1.length !== keys2.length) {
	  return false;
	}
	for (const key of keys1) {
	  const val1 = object1[key];
	  const val2 = object2[key];
	  const areObjects = isObject(val1) && isObject(val2);
	  if (
		areObjects && !deepEqual(val1, val2) ||
		!areObjects && val1 !== val2
	  ) {
		return false;
	  }
	}
	return true;
  }
  function isObject(object) {
	return object != null && typeof object === 'object';
  }

class Order {
	static Less = new Order("<");
	static Equal = new Order("=");
	static Greater = new Order(">");
	constructer(symbol) {
		this.symbol = symbol;
	}
}

function IntCompare(i1, i2) {
	if (i1 > i2) {
		return Order.Greater;
	}
	if (i1 < i2) {
		return Order.Less;
	}
	return Order.Equal
}

class Card {
	static TwoOfHearts = new Card("2h");
	static ThreeOfHearts = new Card("3h");
	static FourOfHearts = new Card("4h");
	static FiveOfHearts = new Card("5h");
	static SixOfHearts = new Card("6h");
	static SevenOfHearts = new Card("7h");
	static EightOfHearts = new Card("8h");
	static NineOfHearts = new Card("9h");
	static TenOfHearts = new Card("Th");
	static JackOfHearts = new Card("Jh");
	static QueenOfHearts = new Card("Qh");
	static KingOfHearts = new Card("Kh");
	static AceOfHearts = new Card("Ah");
	static TwoOfSpades = new Card("2s");
	static ThreeOfSpades = new Card("3s");
	static FourOfSpades = new Card("4s");
	static FiveOfSpades = new Card("5s");
	static SixOfSpades = new Card("6s");
	static SevenOfSpades = new Card("7s");
	static EightOfSpades = new Card("8s");
	static NineOfSpades = new Card("9s");
	static TenOfSpades = new Card("Ts");
	static JackOfSpades = new Card("Js");
	static QueenOfSpades = new Card("Qs");
	static KingOfSpades = new Card("Ks");
	static AceOfSpades = new Card("As");
	static TwoOfClubs = new Card("2c");
	static ThreeOfClubs = new Card("3c");
	static FourOfClubs = new Card("4c");
	static FiveOfClubs = new Card("5c");
	static SixOfClubs = new Card("6c");
	static SevenOfClubs = new Card("7c");
	static EightOfClubs = new Card("8c");
	static NineOfClubs = new Card("9c");
	static TenOfClubs = new Card("Tc");
	static JackOfClubs = new Card("Jc");
	static QueenOfClubs = new Card("Qc");
	static KingOfClubs = new Card("Kc");
	static AceOfClubs = new Card("Ac");
	static TwoOfDiamonds = new Card("2d");
	static ThreeOfDiamonds = new Card("3d");
	static FourOfDiamonds = new Card("4d");
	static FiveOfDiamonds = new Card("5d");
	static SixOfDiamonds = new Card("6d");
	static SevenOfDiamonds = new Card("7d");
	static EightOfDiamonds = new Card("8d");
	static NineOfDiamonds = new Card("9d");
	static TenOfDiamonds = new Card("Td");
	static JackOfDiamonds = new Card("Jd");
	static QueenOfDiamonds = new Card("Qd");
	static KingOfDiamonds = new Card("Kd");
	static AceOfDiamonds = new Card("Ad");

	constructor(name) {
		this.name = name;
		this.suitlessNotation = name[0];
		this.numericValue = name[0];
		if (this.numericValue == "T") {
			this.numericValue = "10";
		}
		else if (this.numericValue == "J") {
			this.numericValue = "11";
		}
		else if (this.numericValue == "Q") {
			this.numericValue = "12";
		}
		else if (this.numericValue == "K") {
			this.numericValue = "13";
		}
		else if (this.numericValue == "A") {
			this.numericValue = "14";
		}
		this.numericValue = parseInt(this.numericValue);
		this.suit = name[1];
	}
}
function cardValueCompare(card, other) {
	return IntCompare(card.numericValue, other.numericValue);
}

function getDeck() {
	var deck = [];
	Object.keys(Card).forEach(card => deck.push(eval("Card." + card)));
	return deck;
}

class HandType {
	static HighCard = new HandType(0);
	static Pair = new HandType(1);
	static TwoPair = new HandType(2);
	static ThreeOfAKind = new HandType(3);
	static Straight = new HandType(4);
	static Flush = new HandType(5);
	static FullHouse = new HandType(6);
	static FourOfAKind = new HandType(7);
	static StraightFlush = new HandType(8);
	constructor(level) {
		this.level = level;
	}
}
function handTypeCompare(handType, other) {
	return IntCompare(handType.level, other.level);
}

class Hand {
	constructor(card1, card2, card3, card4, card5) {
		this.card1 = card1;
		this.card2 = card2;
		this.card3 = card3;
		this.card4 = card4;
		this.card5 = card5;
		this.handType = analyzeHand(this);
	}
}

function analyzeHand(hand) {
	let card1 = hand.card1;
	let card2 = hand.card2;
	let card3 = hand.card3;
	let card4 = hand.card4;
	let card5 = hand.card5;
	function checkStraight() {
		if (card5.numericValue == 14) {
			return (card1.numericValue === 10 && card2.numericValue === 11 && card3.numericValue === 12 && card4.numericValue === 13) ||
				   (card1.numericValue === 2 && card2.numericValue === 3 && card3.numericValue === 4 && card4.numericValue === 5);
		}
		return (card2.numericValue - card1.numericValue) === 1 &&
			   (card3.numericValue - card2.numericValue) === 1 &&
			   (card4.numericValue - card3.numericValue) === 1 &&
			   (card5.numericValue - card4.numericValue) === 1;
	}
	let straight = checkStraight();
	function checkFlush() {
		return card1.suit === card2.suit && card1.suit === card3.suit && card1.suit === card4.suit && card1.suit === card5.suit;
	}
	let flush = checkFlush();
	if (straight && !flush) {
		return HandType.Straight;
	}
	else if (flush && !straight) {
		return HandType.Flush;
	}
	else if (flush && straight) {
		return HandType.StraightFlush;
	}
	var numIncreases = 0;
	var duppedValues = new Set();
	if (card2.numericValue > card1.numericValue) {
		numIncreases += 1;
	}
	else {
		duppedValues.add(card2.numericValue);
	}
	if (card3.numericValue > card2.numericValue) {
		numIncreases += 1;
	}
	else {
		duppedValues.add(card3.numericValue);
	}
	if (card4.numericValue > card3.numericValue) {
		numIncreases += 1;
	}
	else {
		duppedValues.add(card4.numericValue);
	}
	if (card5.numericValue > card4.numericValue) {
		numIncreases += 1;
	}
	else {
		duppedValues.add(card5.numericValue);
	}
	if (numIncreases === 1) {
		if (duppedValues.size === 1) {
			return HandType.FourOfAKind;
		}
		assert(duppedValues.size === 2);
		return HandType.FullHouse;
	}
	else if (numIncreases === 4) {
		return HandType.HighCard;
	}
	else if (numIncreases === 3) {
		return HandType.Pair;
	}
	else {
		if (duppedValues.size === 1) {
			return HandType.ThreeOfAKind;
		}
		assert(duppedValues.size === 2);
		return HandType.TwoPair;
	}
}

function handCompare(hand, other) {
	function defaultCompareEqualHandTypes(self) {
		let five = cardValueCompare(self.card5, other.card5);
		if (five !== Order.Equal) {
			return five;
		}
		let four = cardValueCompare(self.card4, other.card4);
		if (four !== Order.Equal) {
			return four;
		}
		let three = cardValueCompare(self.card3, other.card3);
		if (three !== Order.Equal) {
			return three;
		}
		let two = cardValueCompare(self.card2, other.card2);
		if (two !== Order.Equal) {
			return two;
		}
		return cardValueCompare(self.card1, other.card1);
	}
	function compareStraight(self) {
		if (self.card1.numericValue == 2 && self.card5.numericValue == 14) {
			if (other.card1.numericValue == 2 && other.card5.numericValue == 14) {
				return Order.Equal;
			}
			return Order.Less;
		}
		if (other.card1.numericValue == 2 && other.card5.numericValue == 14) {
			return Order.Greater;
		}
		return cardValueCompare(self.card5, other.card5);
	}
	function compareFourOfAKind(self) {
		function findDuplicated(c1, c2) {
			if (c1.numericValue === c2.numericValue) {
				return c1;
			}
			return c2;
		}
		function findNonDuplicated(c1, c3, c5) {
			if (c1.numericValue === c3.numericValue) {
				return c5;
			}
			return c1;
		}
		let duplicatedUs = findDuplicated(self.card1, self.card2);
		let duplicatedThem = findDuplicated(other.card1, other.card2);
		let two = cardValueCompare(duplicatedUs, duplicatedThem);
		if (two !== Order.Equal) {
			return two;
		}
		return cardValueCompare(findNonDuplicated(self.card1, self.card3, self.card5), findNonDuplicated(other.card1, other.card3, other.card5));
	}
	function compareFullHouse(self) {
		function findThree(c1, c3) {
			if (c1.numericValue === c3.numericValue) {
				return c1;
			}
			return c3;
		}
		function findTwo(c1, c3, c5) {
			if (c1.numericValue === c3.numericValue) {
				return c5;
			}
			return c1;
		}
		let usThree = findThree(self.card1, self.card3);
		let themThree = findThree(other.card1, other.card3);
		let two = cardValueCompare(usThree, themThree);
		if (two !== Order.Equal) {
			return two;
		}
		return cardValueCompare(findTwo(self.card1, self.card3, self.card5), findTwo(other.card1, other.card3, other.card5));
	}
	function compareThreeOfAKind(self) {
		function findThree(c1, c2, c3) {
			if (c1.numericValue === c2.numericValue) {
				return c1;
			}
			else if (c2.numericValue === c3.numericValue) {
				return c2;
			}
			return c3;
		}
		function findFirstKicker(c1, c2, c3, c4, c5) {
			if (c1.numericValue === c2.numericValue || c2.numericValue === c3.numericValue) {
				return c5;
			}
			else if (c3.numericValue === c4.numericValue) {
				return c2;
			}
			assert(false);
		}
		function findSecondKicker(c1, c2, c4) {
			if (c1.numericValue === c2.numericValue) {
				return c4;
			}
			return c1;
		}
		let usThree = findThree(self.card1, self.card2, self.card3);
		let themThree = findThree(other.card1, other.card2, other.card3);
		let three = cardValueCompare(usThree, themThree);
		if (three !== Order.Equal) {
			return three;
		}
		let usKicker1 = findFirstKicker(self.card1, self.card2, self.card3, self.card4, self.card5);
		let themKicker1 = findFirstKicker(other.card1, other.card2, other.card3, other.card4, other.card5);
		let two = cardValueCompare(usKicker1, themKicker1);
		if (two !== Order.Equal) {
			return two;
		}
		return cardValueCompare(findSecondKicker(self.card1, self.card2, self.card4), findSecondKicker(other.card1, other.card2, other.card4));
	}
	function compareTwoPair(self) {
		function findHigherPair(hand) {
			return hand.card4;
		}
		function findLowerPair(hand) {
			return hand.card2;
		}
		function findKicker(c1, c2, c3, c4, c5) {
			if (c4.numericValue !== c5.numericValue) {
				return c5;
			}
			if (c1.numericValue === c2.numericValue) {
				return c3;
			}
			return c1;
		}
		let ourFirstPair = findHigherPair(self);
		let theirFirstPair = findHigherPair(other);
		let three = cardValueCompare(ourFirstPair, theirFirstPair);
		if (three !== Order.Equal) {
			return three;
		}
		let ourNextPair = findLowerPair(self);
		let theirNextPair = findLowerPair(other);
		let two = cardValueCompare(ourNextPair, theirNextPair);
		if (two !== Order.Equal) {
			return two;
		}
		let ourKicker = findKicker(self.card1, self.card2, self.card3, self.card4, self.card5);
		let theirKicker = findKicker(other.card1, other.card2, other.card3, other.card4, other.card5);
		return cardValueCompare(ourKicker, theirKicker);
	}

	function comparePairs(self) {
		function findPair(c1, c2, c3, c4) {
			if (c1.numericValue === c2.numericValue) {
				return c1;
			}
			else if (c2.numericValue == c3.numericValue) {
				return c2;
			}
			else if (c3.numericValue === c4.numericValue) {
				return c3;
			}
			return c4;
		}
		function findKicker1(c3, c4, c5) {
			if (c4.numericValue === c5.numericValue) {
				return c3;
			}
			return c5;
		}
		function findKicker2(c1, c2, c3, c4, c5) {
			if (c4.numericValue === c5.numericValue || c3.numericValue === c4.numericValue) {
				return c2;
			}
			else if (c1.numericValue === c2.numericValue || c2.numericValue === c3.numericValue) {
				return c4;
			}
			assert(false);
		}
		function findKicker3(c1, c2, c3) {
			if (c1.numericValue === c2.numericValue) {
				return c3;
			}
			return c1;
		}
		let ourPair = findPair(self.card1, self.card2, self.card3, self.card4, self.card5);
		let theirPair = findPair(other.card1, other.card2, other.card3, other.card4, other.card5);
		let pair = cardValueCompare(ourPair, theirPair);
		if (pair !== Order.Equal) {
			return pair;
		}
		let ourKicker1 = findKicker1(self.card3, self.card4, self.card5);
		let theirKicker1 = findKicker1(other.card3, other.card4, other.card5);
		let kicker1 = cardValueCompare(ourKicker1, theirKicker1);
		if (kicker1 !== Order.Equal) {
			return kicker1;
		}
		let ourKicker2 = findKicker2(self.card1, self.card2, self.card3, self.card4, self.card5);
		let theirKicker2 = findKicker2(other.card1, other.card2, other.card3, other.card4, other.card5);
		let kicker2 = cardValueCompare(ourKicker2, theirKicker2);
		if (kicker2 !== Order.Equal) {
			return kicker2;
		}
		let ourKicker3 = findKicker3(self.card1, self.card2, self.card3);
		let theirKicker3 = findKicker3(other.card1, other.card2, other.card3);
		return cardValueCompare(ourKicker3, theirKicker3);
	}

	switch (handTypeCompare(hand.handType, other.handType)) {
		case Order.Less: 
			return Order.Less;
		case Order.Greater:
			return Order.Greater;
		case Order.Equal:
			switch (hand.handType) {
				case HandType.Pair:
					return comparePairs(hand);
				case HandType.TwoPair:
					return compareTwoPair(hand);
				case HandType.ThreeOfAKind:
					return compareThreeOfAKind(hand);
				case HandType.FullHouse:
					return compareFullHouse(hand);
				case HandType.FourOfAKind:
					return compareFourOfAKind(hand);
				case HandType.Straight:
					return compareStraight(hand);
				case HandType.StraightFlush:
					return compareStraight(hand);
				default:
					return defaultCompareEqualHandTypes(hand);
			}
	}
}

function cardListToHand(L) {
	function compare(c1, c2) {
		switch (cardValueCompare(c1, c2)) {
			case Order.Greater:
				return 1;
			case Order.Less:
				return -1;
			case Order.Equal:
				return 0;
		}
	}
	L = L.sort(compare);
	return new Hand(L[0], L[1], L[2], L[3], L[4]);
}

function handMax(h1, h2) {
	switch (handCompare(h1, h2)) {
		case Order.Greater:
			return h1;
		case Order.Less:
			return h2;
		case Order.Equal:
			return h1;
	}
}

function iterateSubListsWithSize(L, k_) {
	var lookupTable = {};
	function iterateSizeKFromStartingIndexN(n, k) {
		if (k == 0) {
			lookupTable[[n, k]] = [[]];
			return [[]];
		}
		if (L.length - n === k) {
			lookupTable[[n, k]] = [L.slice(n)];
			return lookupTable[[n, k]];
		}
		var withFirst; var withoutFirst;
		if ([n + 1, k] in lookupTable) {
			withoutFirst = lookupTable[[n+1, k]];
		}
		else {
			withoutFirst = iterateSizeKFromStartingIndexN(n + 1, k);
		}
		if ([n + 1, k - 1] in lookupTable) {
			withFirst = lookupTable[[n+1, k - 1]];
		}
		else {
			withFirst = iterateSizeKFromStartingIndexN(n + 1, k - 1);
		}
		lookupTable[[n, k]] = withoutFirst.concat(withFirst.map(inner => [L[n]].concat(inner)));
		return lookupTable[[n, k]];
	}
	return iterateSizeKFromStartingIndexN(0, k_);
}

class PocketHand {
	constructor(card1, card2) {
		this.card1 = card1;
		this.card2 = card2;
	}
}

class UnknownPocketHand {
	static AceKingSuited = new UnknownPocketHand("AKs");
	static AceQueenSuited = new UnknownPocketHand("AQs");
	static AceJackSuited = new UnknownPocketHand("AJs");
	static AceTenSuited = new UnknownPocketHand("ATs");
	static AceNineSuited = new UnknownPocketHand("A9s");
	static AceEightSuited = new UnknownPocketHand("A8s");
	static AceSevenSuited = new UnknownPocketHand("A7s");
	static AceSixSuited = new UnknownPocketHand("A6s");
	static AceFiveSuited = new UnknownPocketHand("A5s");
	static AceFourSuited = new UnknownPocketHand("A4s");
	static AceThreeSuited = new UnknownPocketHand("A3s");
	static AceTwoSuited = new UnknownPocketHand("A2s");
	static KingQueenSuited = new UnknownPocketHand("KQs");
	static KingJackSuited = new UnknownPocketHand("KJs");
	static KingTenSuited = new UnknownPocketHand("KTs");
	static KingNineSuited = new UnknownPocketHand("K9s");
	static KingEightSuited = new UnknownPocketHand("K8s");
	static KingSevenSuited = new UnknownPocketHand("K7s");
	static KingSixSuited = new UnknownPocketHand("K6s");
	static KingFiveSuited = new UnknownPocketHand("K5s");
	static KingFourSuited = new UnknownPocketHand("K4s");
	static KingThreeSuited = new UnknownPocketHand("K3s");
	static KingTwoSuited = new UnknownPocketHand("K2s");
	static QueenJackSuited = new UnknownPocketHand("QJs");
	static QueenTenSuited = new UnknownPocketHand("QTs");
	static QueenNineSuited = new UnknownPocketHand("Q9s");
	static QueenEightSuited = new UnknownPocketHand("Q8s");
	static QueenSevenSuited = new UnknownPocketHand("Q7s");
	static QueenSixSuited = new UnknownPocketHand("Q6s");
	static QueenFiveSuited = new UnknownPocketHand("Q5s");
	static QueenFourSuited = new UnknownPocketHand("Q4s");
	static QueenThreeSuited = new UnknownPocketHand("Q3s");
	static QueenTwoSuited = new UnknownPocketHand("Q2s");
	static JackTenSuited = new UnknownPocketHand("JTs");
	static JackNineSuited = new UnknownPocketHand("J9s");
	static JackEightSuited = new UnknownPocketHand("J8s");
	static JackSevenSuited = new UnknownPocketHand("J7s");
	static JackSixSuited = new UnknownPocketHand("J6s");
	static JackFiveSuited = new UnknownPocketHand("J5s");
	static JackFourSuited = new UnknownPocketHand("J4s");
	static JackThreeSuited = new UnknownPocketHand("J3s");
	static JackTwoSuited = new UnknownPocketHand("J2s");
	static TenNineSuited = new UnknownPocketHand("T9s");
	static TenEightSuited = new UnknownPocketHand("T8s");
	static TenSevenSuited = new UnknownPocketHand("T7s");
	static TenSixSuited = new UnknownPocketHand("T6s");
	static TenFiveSuited = new UnknownPocketHand("T5s");
	static TenFourSuited = new UnknownPocketHand("T4s");
	static TenThreeSuited = new UnknownPocketHand("T3s");
	static TenTwoSuited = new UnknownPocketHand("T2s");
	static NineEightSuited = new UnknownPocketHand("98s");
	static NineSevenSuited = new UnknownPocketHand("97s");
	static NineSixSuited = new UnknownPocketHand("96s");
	static NineFiveSuited = new UnknownPocketHand("95s");
	static NineFourSuited = new UnknownPocketHand("94s");
	static NineThreeSuited = new UnknownPocketHand("93s");
	static NineTwoSuited = new UnknownPocketHand("92s");
	static EightSevenSuited = new UnknownPocketHand("87s");
	static EightSixSuited = new UnknownPocketHand("86s");
	static EightFiveSuited = new UnknownPocketHand("85s");
	static EightFourSuited = new UnknownPocketHand("84s");
	static EightThreeSuited = new UnknownPocketHand("83s");
	static EightTwoSuited = new UnknownPocketHand("82s");
	static SevenSixSuited = new UnknownPocketHand("76s");
	static SevenFiveSuited = new UnknownPocketHand("75s");
	static SevenFourSuited = new UnknownPocketHand("74s");
	static SevenThreeSuited = new UnknownPocketHand("73s");
	static SevenTwoSuited = new UnknownPocketHand("72s");
	static SixFiveSuited = new UnknownPocketHand("65s");
	static SixFourSuited = new UnknownPocketHand("64s");
	static SixThreeSuited = new UnknownPocketHand("63s");
	static SixTwoSuited = new UnknownPocketHand("62s");
	static FiveFourSuited = new UnknownPocketHand("54s");
	static FiveThreeSuited = new UnknownPocketHand("53s");
	static FiveTwoSuited = new UnknownPocketHand("52s");
	static FourThreeSuited = new UnknownPocketHand("43s");
	static FourTwoSuited = new UnknownPocketHand("42s");
	static ThreeTwoSuited = new UnknownPocketHand("32s");
	static AceAceUnsuited = new UnknownPocketHand("AAo");
	static AceKingUnsuited = new UnknownPocketHand("AKo");
	static AceQueenUnsuited = new UnknownPocketHand("AQo");
	static AceJackUnsuited = new UnknownPocketHand("AJo");
	static AceTenUnsuited = new UnknownPocketHand("ATo");
	static AceNineUnsuited = new UnknownPocketHand("A9o");
	static AceEightUnsuited = new UnknownPocketHand("A8o");
	static AceSevenUnsuited = new UnknownPocketHand("A7o");
	static AceSixUnsuited = new UnknownPocketHand("A6o");
	static AceFiveUnsuited = new UnknownPocketHand("A5o");
	static AceFourUnsuited = new UnknownPocketHand("A4o");
	static AceThreeUnsuited = new UnknownPocketHand("A3o");
	static AceTwoUnsuited = new UnknownPocketHand("A2o");
	static KingKingUnsuited = new UnknownPocketHand("KKo");
	static KingQueenUnsuited = new UnknownPocketHand("KQo");
	static KingJackUnsuited = new UnknownPocketHand("KJo");
	static KingTenUnsuited = new UnknownPocketHand("KTo");
	static KingNineUnsuited = new UnknownPocketHand("K9o");
	static KingEightUnsuited = new UnknownPocketHand("K8o");
	static KingSevenUnsuited = new UnknownPocketHand("K7o");
	static KingSixUnsuited = new UnknownPocketHand("K6o");
	static KingFiveUnsuited = new UnknownPocketHand("K5o");
	static KingFourUnsuited = new UnknownPocketHand("K4o");
	static KingThreeUnsuited = new UnknownPocketHand("K3o");
	static KingTwoUnsuited = new UnknownPocketHand("K2o");
	static QueenQueenUnsuited = new UnknownPocketHand("QQo");
	static QueenJackUnsuited = new UnknownPocketHand("QJo");
	static QueenTenUnsuited = new UnknownPocketHand("QTo");
	static QueenNineUnsuited = new UnknownPocketHand("Q9o");
	static QueenEightUnsuited = new UnknownPocketHand("Q8o");
	static QueenSevenUnsuited = new UnknownPocketHand("Q7o");
	static QueenSixUnsuited = new UnknownPocketHand("Q6o");
	static QueenFiveUnsuited = new UnknownPocketHand("Q5o");
	static QueenFourUnsuited = new UnknownPocketHand("Q4o");
	static QueenThreeUnsuited = new UnknownPocketHand("Q3o");
	static QueenTwoUnsuited = new UnknownPocketHand("Q2o");
	static JackJackUnsuited = new UnknownPocketHand("JJo");
	static JackTenUnsuited = new UnknownPocketHand("JTo");
	static JackNineUnsuited = new UnknownPocketHand("J9o");
	static JackEightUnsuited = new UnknownPocketHand("J8o");
	static JackSevenUnsuited = new UnknownPocketHand("J7o");
	static JackSixUnsuited = new UnknownPocketHand("J6o");
	static JackFiveUnsuited = new UnknownPocketHand("J5o");
	static JackFourUnsuited = new UnknownPocketHand("J4o");
	static JackThreeUnsuited = new UnknownPocketHand("J3o");
	static JackTwoUnsuited = new UnknownPocketHand("J2o");
	static TenTenUnsuited = new UnknownPocketHand("TTo");
	static TenNineUnsuited = new UnknownPocketHand("T9o");
	static TenEightUnsuited = new UnknownPocketHand("T8o");
	static TenSevenUnsuited = new UnknownPocketHand("T7o");
	static TenSixUnsuited = new UnknownPocketHand("T6o");
	static TenFiveUnsuited = new UnknownPocketHand("T5o");
	static TenFourUnsuited = new UnknownPocketHand("T4o");
	static TenThreeUnsuited = new UnknownPocketHand("T3o");
	static TenTwoUnsuited = new UnknownPocketHand("T2o");
	static NineNineUnsuited = new UnknownPocketHand("99o");
	static NineEightUnsuited = new UnknownPocketHand("98o");
	static NineSevenUnsuited = new UnknownPocketHand("97o");
	static NineSixUnsuited = new UnknownPocketHand("96o");
	static NineFiveUnsuited = new UnknownPocketHand("95o");
	static NineFourUnsuited = new UnknownPocketHand("94o");
	static NineThreeUnsuited = new UnknownPocketHand("93o");
	static NineTwoUnsuited = new UnknownPocketHand("92o");
	static EightEightUnsuited = new UnknownPocketHand("88o");
	static EightSevenUnsuited = new UnknownPocketHand("87o");
	static EightSixUnsuited = new UnknownPocketHand("86o");
	static EightFiveUnsuited = new UnknownPocketHand("85o");
	static EightFourUnsuited = new UnknownPocketHand("84o");
	static EightThreeUnsuited = new UnknownPocketHand("83o");
	static EightTwoUnsuited = new UnknownPocketHand("82o");
	static SevenSevenUnsuited = new UnknownPocketHand("77o");
	static SevenSixUnsuited = new UnknownPocketHand("76o");
	static SevenFiveUnsuited = new UnknownPocketHand("75o");
	static SevenFourUnsuited = new UnknownPocketHand("74o");
	static SevenThreeUnsuited = new UnknownPocketHand("73o");
	static SevenTwoUnsuited = new UnknownPocketHand("72o");
	static SixSixUnsuited = new UnknownPocketHand("66o");
	static SixFiveUnsuited = new UnknownPocketHand("65o");
	static SixFourUnsuited = new UnknownPocketHand("64o");
	static SixThreeUnsuited = new UnknownPocketHand("63o");
	static SixTwoUnsuited = new UnknownPocketHand("62o");
	static FiveFiveUnsuited = new UnknownPocketHand("55o");
	static FiveFourUnsuited = new UnknownPocketHand("54o");
	static FiveThreeUnsuited = new UnknownPocketHand("53o");
	static FiveTwoUnsuited = new UnknownPocketHand("52o");
	static FourFourUnsuited = new UnknownPocketHand("44o");
	static FourThreeUnsuited = new UnknownPocketHand("43o");
	static FourTwoUnsuited = new UnknownPocketHand("42o");
	static ThreeThreeUnsuited = new UnknownPocketHand("33o");
	static ThreeTwoUnsuited = new UnknownPocketHand("32o");
	static TwoTwoUnsuited = new UnknownPocketHand("22o");
	constructor(name) {
		this.name = name
		this.suitType = name[2]
	}
}

function getAllCorrespondingRealHands(unknownPocketHand) {
	let suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
	let ranks = {"2":"Two", "3":"Three", "4":"Four", "5":"Five", "6":"Six", "7":"Seven", "8":"Eight", "9":"Nine", "T":"Ten", "J":"Jack", "Q":"Queen", "K":"King", "A":"Ace"};
	function valSuitsToPocketHand(val1, suit1, val2, suit2) {
		return eval("new PocketHand(Card." + ranks[val1] + "Of" + suit1 + ", " + "Card." + ranks[val2] + "Of" + suit2 + ")");
	}
	let val1 = unknownPocketHand.name[0];
	let val2 = unknownPocketHand.name[1];
	if (val1 === val2) {
		let suitPossibilities = iterateSubListsWithSize(suits, 2);
		return suitPossibilities.map(suits => valSuitsToPocketHand(val1, suits[0], val2, suits[1]));
	}
	else if (unknownPocketHand.suitType == "o"){
		var suitPossibilities = [];
		for (var i = 0; i < suits.length; i++) {
			for (var j = 0; j < suits.length; j++) {
				if (i !== j) {
					suitPossibilities.push([suits[i], suits[j]]);
				}
			}
		}
		return suitPossibilities.map(suits => valSuitsToPocketHand(val1, suits[0], val2, suits[1]));
	}
	else if (unknownPocketHand.suitType == "s") {
		var suitPossibilities = [["Spades", "Spades"], ["Hearts", "Hearts"],["Diamonds", "Diamonds"], ["Clubs", "Clubs"]];
		return suitPossibilities.map(suits => valSuitsToPocketHand(val1, suits[0], val2, suits[1]));
	}
	assert(false);
}



class Range {
	constructor(unknownPocketHands) {
		this.unknownPocketHands = unknownPocketHands;
	}
}
function iterateRange(range) {
	var pocketHands = [];
	for (var i = 0; i < range.unknownPocketHands.length; i++) {
		let unknownHand = range.unknownPocketHands[i];
		pocketHands = pocketHands.concat(getAllCorrespondingRealHands(unknownHand));
	}
	return pocketHands.map(h => [h.card1, h.card2]);
}

class Flop {
	constructor(card1, card2, card3) {
		this.card1 = card1;
		this.card2 = card2;
		this.card3 = card3;
	}
}
	
class Spot {
	constructor(myPocketHand, opponentRange, flop, turn) {
		this.myPocketHand = myPocketHand;
		this.opponentRange = opponentRange;
		this.flop = flop;
		this.turn = turn;
	}	
}

function notLoseWith(spot, opcard1, opcard2, table1, table2, table3, table4, table5) {
	let opponentsHandsFrom = [opcard1, opcard2, table1, table2, table3, table4, table5];
	let myHandsFrom = [spot.myPocketHand.card1, spot.myPocketHand.card2, table1, table2, table3, table4, table5];
	let opponentBestHand = iterateSubListsWithSize(opponentsHandsFrom, 5).map(cardListToHand).reduce(handMax);
	let myBestHand = iterateSubListsWithSize(myHandsFrom, 5).map(cardListToHand).reduce(handMax);
	switch (handCompare(myBestHand, opponentBestHand)) {
		case Order.Greater:
			return true;
		case Order.Equal:
			return true;
		case Order.Less:
			return false;
	}
	assert(false);
}

function isOnBoard(spot, card) {
	if (spot.flop !== undefined) {
		if (deepEqual(spot.flop.card1, card)) {
			return true;
		}
		if (deepEqual(spot.flop.card2, card)) {
			return true;
		} 
		if (deepEqual(spot.flop.card3, card)) {
			return true;
		}
		if (deepEqual(spot.turn,  card)) {
			return true;
		}
	}
	return false;
}

function notInMyHand(spot, card) {
	return !deepEqual(card, spot.myPocketHand.card1) && !deepEqual(card, spot.myPocketHand.card2);
}

function getTablePossibilities(spot, ph) {
	let deck = getDeck();
	deck = deck.filter(card => !deepEqual(card,  spot.myPocketHand.card1) && !deepEqual(card,  spot.myPocketHand.card2) && !deepEqual(card,  ph.card1) && !deepEqual(card, ph.card2));	
	if (spot.flop === undefined) {
		return iterateSubListsWithSize(deck, 5);
	}
	else if (spot.turn === undefined) {
		deck = deck.filter(card => !deepEqual(card, spot.flop.card1) && !deepEqual(card, spot.flop.card2) && !deepEqual(card,  spot.flop.card3));
		return iterateSubListsWithSize(deck, 2).map(L => L.concat([spot.flop.card1, spot.flop.card2, spot.flop.card3]));
	}
	else {
		let table = [spot.flop.card1, spot.flop.card2, spot.flop.card3, spot.turn];
		deck = deck.filter(card => !deepEqual(card,  spot.flop.card1) && !deepEqual(card, spot.flop.card2) && !deepEqual(card,  spot.flop.card3) && !deepEqual(card,  spot.turn));
		return deck.map(c => table.concat([c]));
	}
}

function getEquity(spot) {
	var prob = 0;
	var opponentPossibilities = iterateRange(spot.opponentRange);
	opponentPossibilities = opponentPossibilities.filter(L => !isOnBoard(spot, L[0]) && !isOnBoard(spot, L[1]) && notInMyHand(spot, L[0]) && notInMyHand(spot, L[1]));
	var tablePossibilities;
	var totalNumHands = 0;
	for (var j = 0; j < opponentPossibilities.length; j++) {
		let [card1, card2] = opponentPossibilities[j];
		tablePossibilities = getTablePossibilities(spot, new PocketHand(card1, card2));
		var intermediateEquity = 0;
		for (var i = 0; i < tablePossibilities.length; i++) {
			let [table1, table2, table3, table4, table5] = tablePossibilities[i];
			if (notLoseWith(spot, card1, card2, table1, table2, table3, table4, table5)) {
				prob += 1;
				intermediateEquity += 1;
			}
			totalNumHands += 1;
			if (i % 100 == 0) {
				postMessage([false, (tablePossibilities.length*j + i)/(tablePossibilities.length*opponentPossibilities.length)]);
			}
		}
		console.log("against " + card1.name + card2.name + " we have " + (intermediateEquity/tablePossibilities.length).toString() + "\n");
	}
	return prob/totalNumHands;
}



function unitTest() {
	console.log("testing basic hand classification...\n");
	let hand00 = new Hand(Card.TwoOfClubs, Card.ThreeOfDiamonds, Card.TenOfSpades, Card.QueenOfHearts, Card.AceOfClubs);
	let hand0 = new Hand(Card.TwoOfClubs, Card.ThreeOfDiamonds, Card.JackOfSpades, Card.QueenOfHearts, Card.AceOfClubs);
	assert(hand0.handType === HandType.HighCard);
	let hand1 = new Hand(Card.TwoOfHearts, Card.ThreeOfHearts, Card.JackOfDiamonds, Card.QueenOfSpades, Card.AceOfSpades);
	assert(hand1.handType === HandType.HighCard);
	let hand2 = new Hand(Card.ThreeOfHearts, Card.FourOfHearts, Card.FiveOfDiamonds, Card.SixOfClubs, Card.AceOfHearts);
	assert(hand2.handType === HandType.HighCard);

	let hand3 = new Hand(Card.SixOfClubs, Card.SixOfHearts, Card.EightOfDiamonds, Card.JackOfDiamonds, Card.AceOfDiamonds);
	let hand3lt1 = new Hand(Card.FourOfClubs, Card.FourOfDiamonds, Card.NineOfSpades, Card.KingOfClubs, Card.AceOfHearts);
	let hand3lt2 = new Hand(Card.SixOfHearts, Card.SixOfDiamonds, Card.NineOfDiamonds, Card.QueenOfDiamonds, Card.KingOfDiamonds);
	let hand3lt3 = new Hand(Card.SixOfHearts, Card.SixOfDiamonds, Card.NineOfDiamonds, Card.TenOfDiamonds, Card.AceOfSpades);
	let hand3lt4 = new Hand(Card.SixOfHearts, Card.SixOfDiamonds, Card.SevenOfDiamonds, Card.JackOfClubs, Card.AceOfSpades);
	let hand3eq = new Hand(Card.SixOfSpades, Card.SixOfDiamonds, Card.EightOfHearts, Card.JackOfClubs, Card.AceOfHearts);
	assert(hand3.handType === HandType.Pair);
	assert(hand3lt1.handType === HandType.Pair);
	assert(hand3lt2.handType === HandType.Pair);
	assert(hand3lt3.handType === HandType.Pair);
	assert(hand3lt4.handType === HandType.Pair);
	
	let hand4 = new Hand(Card.TwoOfClubs,  Card.TwoOfHearts, Card.ThreeOfDiamonds, Card.SevenOfSpades, Card.SevenOfClubs);
	let hand4gt1 = new Hand(Card.TwoOfClubs, Card.TwoOfHearts, Card.FiveOfDiamonds, Card.KingOfHearts, Card.KingOfClubs);
	let hand4gt2 = new Hand(Card.ThreeOfClubs, Card.ThreeOfHearts, Card.FourOfHearts, Card.SevenOfHearts, Card.SevenOfDiamonds);
	let hand4gt2gt = new Hand(Card.ThreeOfSpades, Card.ThreeOfDiamonds, Card.FiveOfClubs, Card.SevenOfSpades, Card.SevenOfHearts);
	let hand4eq = new Hand(Card.TwoOfDiamonds, Card.TwoOfSpades, Card.ThreeOfHearts, Card.SevenOfDiamonds, Card.SevenOfHearts);
	assert(hand4.handType === HandType.TwoPair);
	assert(hand4gt1.handType === HandType.TwoPair);
	assert(hand4gt2.handType === HandType.TwoPair);
	
	let hand5 = new Hand(Card.SevenOfSpades, Card.SevenOfClubs, Card.SevenOfDiamonds, Card.EightOfHearts, Card.NineOfClubs);
	let hand6 = new Hand(Card.ThreeOfClubs, Card.FiveOfSpades, Card.FiveOfHearts, Card.FiveOfDiamonds, Card.NineOfDiamonds);
	let hand7 = new Hand(Card.TenOfSpades, Card.JackOfClubs, Card.KingOfHearts, Card.KingOfDiamonds, Card.KingOfSpades);
	let hand7lt1 = new Hand(Card.NineOfSpades, Card.TenOfSpades, Card.KingOfSpades, Card.KingOfDiamonds, Card.KingOfClubs);
	let hand7lt2 = new Hand(Card.EightOfSpades, Card.JackOfSpades, Card.KingOfSpades, Card.KingOfClubs, Card.KingOfDiamonds);
	let hand7eq = new Hand(Card.TenOfHearts, Card.JackOfDiamonds, Card.KingOfClubs, Card.KingOfHearts, Card.KingOfSpades);
	assert(hand5.handType === HandType.ThreeOfAKind);
	assert(hand6.handType === HandType.ThreeOfAKind);
	assert(hand7.handType === HandType.ThreeOfAKind);

	let hand8 = new Hand(Card.TwoOfClubs, Card.ThreeOfHearts, Card.FourOfDiamonds, Card.FiveOfHearts, Card.AceOfSpades);
	let hand9 = new Hand(Card.TwoOfClubs, Card.ThreeOfHearts, Card.FourOfDiamonds, Card.FiveOfHearts, Card.SixOfSpades);
	let hand10 = new Hand(Card.TenOfSpades, Card.JackOfClubs, Card.QueenOfHearts, Card.KingOfHearts, Card.AceOfHearts);
	let hand11 = new Hand(Card.EightOfClubs, Card.NineOfClubs, Card.TenOfDiamonds, Card.JackOfDiamonds, Card.QueenOfHearts);
	assert(hand8.handType === HandType.Straight);
	assert(hand9.handType === HandType.Straight);
	assert(hand10.handType === HandType.Straight);
	assert(hand11.handType === HandType.Straight);

	let hand12 = new Hand(Card.ThreeOfHearts, Card.FiveOfHearts, Card.SixOfHearts, Card.QueenOfHearts, Card.AceOfHearts);
	let hand13 = new Hand(Card.TwoOfSpades, Card.FourOfSpades, Card.SevenOfSpades, Card.TenOfSpades, Card.JackOfSpades);
	let hand14 = new Hand(Card.EightOfDiamonds, Card.NineOfDiamonds, Card.TenOfDiamonds, Card.KingOfDiamonds, Card.AceOfDiamonds);
	let hand15 = new Hand(Card.TwoOfClubs, Card.FourOfClubs, Card.SevenOfClubs, Card.TenOfClubs, Card.QueenOfClubs);
	assert(hand12.handType === HandType.Flush);
	assert(hand13.handType === HandType.Flush);
	assert(hand14.handType === HandType.Flush);
	assert(hand15.handType === HandType.Flush);

	let hand16 = new Hand(Card.ThreeOfSpades, Card.ThreeOfClubs, Card.ThreeOfDiamonds, Card.EightOfClubs, Card.EightOfHearts);
	let hand17 = new Hand(Card.TenOfSpades, Card.TenOfClubs, Card.QueenOfHearts, Card.QueenOfDiamonds, Card.QueenOfClubs);
	let hand17andahalf = new Hand(Card.JackOfSpades, Card.JackOfClubs, Card.QueenOfSpades, Card.QueenOfClubs, Card.QueenOfDiamonds);
	assert(hand16.handType === HandType.FullHouse);
	assert(hand17.handType === HandType.FullHouse);
	assert(hand17andahalf.handType === HandType.FullHouse);

	let hand18 = new Hand(Card.TenOfClubs, Card.TenOfSpades, Card.TenOfHearts, Card.TenOfDiamonds, Card.KingOfSpades);
	let hand19 = new Hand(Card.SevenOfHearts, Card.NineOfDiamonds, Card.NineOfSpades, Card.NineOfHearts, Card.NineOfClubs);
	let hand20 = new Hand(Card.QueenOfClubs, Card.AceOfSpades, Card.AceOfDiamonds, Card.AceOfClubs, Card.AceOfHearts);
	let hand21 = new Hand(Card.TenOfClubs, Card.TenOfSpades, Card.TenOfHearts, Card.TenOfDiamonds, Card.AceOfSpades);
	let hand22 = new Hand(Card.TenOfSpades, Card.TenOfClubs, Card.TenOfHearts, Card.TenOfDiamonds, Card.AceOfHearts);
	assert(hand18.handType === HandType.FourOfAKind);
	assert(hand19.handType === HandType.FourOfAKind);
	assert(hand20.handType === HandType.FourOfAKind);
	assert(hand21.handType === HandType.FourOfAKind);
	assert(hand22.handType === HandType.FourOfAKind);

	let hand23 = new Hand(Card.EightOfSpades, Card.NineOfSpades, Card.TenOfSpades, Card.JackOfSpades, Card.QueenOfSpades);
	assert(hand23.handType === HandType.StraightFlush);
	console.log("passed basic hand classification");

	console.log("testing hand comparison...\n");
	function assertlt(h1, h2) {
		assert(handCompare(h1, h2) === Order.Less);
		assert(handCompare(h2, h1) === Order.Greater);
	}
	function asserteq(h1, h2) {
		assert(handCompare(h2, h1) === Order.Equal);
		assert(handCompare(h1, h2) === Order.Equal);
	}

	assertlt(hand18, hand20);
	assertlt(hand18, hand21);
	asserteq(hand21, hand22);

	assertlt(hand2, hand1);
	asserteq(hand1, hand0);
	assertlt(hand00, hand0);
	
	assertlt(hand8, hand9);
	assertlt(hand9, hand10);
	assertlt(hand8, hand10);
	assertlt(hand11, hand10);
	assertlt(hand8, hand11);

	assertlt(hand16, hand17);
	assertlt(hand17, hand17andahalf);

	assertlt(hand6, hand5);
	assertlt(hand7lt1, hand7);
	assertlt(hand7lt2, hand7);
	asserteq(hand7eq, hand7);
	
	assertlt(hand4, hand4gt1);
	assertlt(hand3, hand4gt2);
	assertlt(hand4gt2, hand4gt2gt);
	asserteq(hand4eq, hand4);

	assertlt(hand3lt1, hand3);
	assertlt(hand3lt2, hand3);
	assertlt(hand3lt3, hand3);
	assertlt(hand3lt4, hand3);
	asserteq(hand3, hand3eq);

	
	let spot = new Spot(new PocketHand(Card.AceOfDiamonds, Card.KingOfSpades), new Range([UnknownPocketHand.TenTenUnsuited, UnknownPocketHand.JackJackUnsuited, UnknownPocketHand.QueenQueenUnsuited, UnknownPocketHand.KingKingUnsuited, UnknownPocketHand.AceAceUnsuited, UnknownPocketHand.AceKingSuited, UnknownPocketHand.AceKingUnsuited, UnknownPocketHand.AceQueenSuited, UnknownPocketHand.AceQueenUnsuited]), new Flop(Card.JackOfDiamonds, Card.TenOfHearts, Card.FiveOfSpades), undefined);
	console.log(getEquity(spot).toString()); //should be around .4625
	console.log("all tests passed :)");
}





onmessage = function(e) {
	postMessage([true, getEquity(e.data)]);
}