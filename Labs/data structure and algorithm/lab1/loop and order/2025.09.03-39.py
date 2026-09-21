def prime(a):
    i = 2
    d = 0
    e = 2
    if a == 1 or a == 2:
        print("prime")
    else:
        while i < a:
            if a % i == 0:
                d += 1
                e += 1
                i += 1
            else:
                i += 1
        if d == 0:
            print("prime")
        else:
            print("non-prime")
            print(f'total of {e} dividers for {a}')
a = int(input("enter a number: "))
if a > 0:
    prime(a)
else:
    print("cant enter negative numbers")