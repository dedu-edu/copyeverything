k = abs(int(input("Enter K: ")))
rList = []
a = 0
b = 1
index = 2
is_found = False
if k == 0:
    print("Cannot divide by zero")
elif k == 1:
    print(index-1)
while not is_found:
    temp = a
    a = b
    b = b + temp
    index += 1
    if b % k == 0:
        break
print(index)

