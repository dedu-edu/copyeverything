tup1 = (1, 2, 3, 4, 5, 6, 7, 8, 9)
odd = 0
even = 0
i = 0
length = len(tup1)
while i < length:
    if tup1[i] % 2 == 1:
        odd += 1
    else:
        even += 1
    i += 1
print(f'odd is {odd}, even is {even}')