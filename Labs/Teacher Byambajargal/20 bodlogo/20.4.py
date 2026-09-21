def find_primes(a,b):
    for i in range(a,b+1):
        divider = 0
        for k in range(2,i):
            if i % k == 0:
                divider += 1
        if divider == 0:
            print(i)


a, b = int(input("enter starting number: ")), int(input('enter ending number: '))
find_primes(a,b)