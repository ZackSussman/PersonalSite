
#code = ""
#for (suit, abrvSuit) in [("Hearts", "h"), ("Spades", "s"), ("Clubs", "c"), ("Diamonds", "d")]:
#	for (value, abrvValue) in [("Two", "2"), ("Three", "3"), ("Four", "4"), ("Five", "5"), ("Six", "6"), ("Seven", "7"), ("Eight", "8"), ("Nine", "9"), ("Ten", "T"), ("Jack", "J"), ("Queen", "Q"), ("King", "K"), ("Ace", "A")]:
#		code += f'static {value}Of{suit} = new Card("{abrvValue + abrvSuit}");\n'
#print(code)


code = ""
for (suit, abrvSuit) in [("Unsuited", "o"), ("Suited", "s")][::-1]:
	for (i1, (value1, abrvValue)) in enumerate([("Two", "2"), ("Three", "3"), ("Four", "4"), ("Five", "5"), ("Six", "6"), ("Seven", "7"), ("Eight", "8"), ("Nine", "9"), ("Ten", "T"), ("Jack", "J"), ("Queen", "Q"), ("King", "K"), ("Ace", "A")][::-1]):
		for (i2, (value2, abrvValue2)) in enumerate([("Two", "2"), ("Three", "3"), ("Four", "4"), ("Five", "5"), ("Six", "6"), ("Seven", "7"), ("Eight", "8"), ("Nine", "9"), ("Ten", "T"), ("Jack", "J"), ("Queen", "Q"), ("King", "K"), ("Ace", "A")][::-1]): 
			if i1 <= i2:
				code += f'static {value1}{value2}{suit} = new UnknownPocketHand("{abrvValue + abrvValue2 + abrvSuit}");\n'
print(code)