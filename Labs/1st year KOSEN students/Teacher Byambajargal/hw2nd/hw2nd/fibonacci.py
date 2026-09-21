n = int(input("please enter your range: "))
a = 0
b = 1
ab = b
i = 0
while i <= n:
	print(ab)
	i += 1
	a, b = b, ab
	ab = a + b
