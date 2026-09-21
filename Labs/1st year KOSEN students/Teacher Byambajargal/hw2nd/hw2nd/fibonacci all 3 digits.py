a = 0
b = 1
ab = b
i = 0
c = len(str(ab))
while c < 4:
	i += 1
	a, b = b, ab
	ab = a + b
	c = len(str(ab))
	if c == 3:
		print(ab)