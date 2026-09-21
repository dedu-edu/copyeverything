num = input("enter your number: ")
size = len(num)
num = int(num)
sum = 0
for i in range(size):
    sum += num % 10
    num = num // 10
print(sum)