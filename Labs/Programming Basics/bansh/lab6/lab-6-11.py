a = int(input("Enter a: "))
b = int(input("Enter b: "))
for i in range(a, b+1):
    reversed_i = int("".join(reversed(str(i))))
    if i < reversed_i:
        print(i)