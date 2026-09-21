def fibonacci(k):
    a, b = 0, 1
    print(0)
    for i in range(k-1):
        a, b = b, a+b
        print(a)
fibonacci(int(input("fibonacci number: ")))