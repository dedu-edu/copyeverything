num = input("enter your number: ")
size = len(num)
num = int(num)
reverse = []
for i in range(size):
    reverse.append(str(num % 10))
    num = num // 10
out = "".join(reverse)
print(out)