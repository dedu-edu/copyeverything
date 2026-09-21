n = int(input("please enter your range: "))
k = int(input("please enter your divider: "))
a = 0
b = 1
ab = b
i = 0
if k > 0:
    while i <= n:
        i += 1
        a, b = b, ab
        ab = a + b
        if ab%k==0:
            print(ab)
            break
        else:
            ()
else:
    print("negative num!!")


