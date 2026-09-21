sum = 0
for i in range(56,101,7):
    while i != 0:
        sum = sum + (i % 10)
        i = i // 10
print(sum)