H = int(input("Enter height: "))
if H >= 4500:
    P = H - 10
    print(P)
elif H < 3000:
    P = H + 10
    print(P)
else:
    P = H
    print(P)