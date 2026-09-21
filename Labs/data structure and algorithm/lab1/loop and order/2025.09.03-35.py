b = int(input("enter the power: "))
a = int(input("enter the base: "))
output = 1
for i in range(b+1):
    if i == 0:
        continue
    else:
        output = output * a
print(output)