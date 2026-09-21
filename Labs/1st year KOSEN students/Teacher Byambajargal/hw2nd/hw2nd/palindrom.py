a = input("please enter your number? ")
b = len(a)
i = 0
d = -1
e = 0
while i < b:
    if a[i] == a[d]:
        i += 1
        d -= 1
        e += 1
    else:
        print("not palindrom")
        break
    if e == b:
        print("palindorm")