b = int(input("please enter the upper limit for the loop? "))
a = 0
while a<b:
    a = str(a)
    if a[0]==a[-1]:
        print(int(a))
        a = int(a)
        a += 1
    else:
        a = int(a)
        a += 1