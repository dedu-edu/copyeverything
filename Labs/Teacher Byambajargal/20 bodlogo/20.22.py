def mersenne_prime(n):
    temp = 0
    out_num = pow(2,n)-1
    for i in range(2,out_num):
        if out_num % i == 0:
            temp += 1
    if temp == 0:
        print("yes")
    elif temp > 0:
        print("no")
mersenne_prime(int(input("enter the number: ")))