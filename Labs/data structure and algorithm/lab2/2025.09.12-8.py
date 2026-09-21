n = int(input("enter the size of the array: "))
number = []
prime_number = []
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
    prime = True
    for k in range(2, num):
        if num % k == 0:
            prime = False
            break
    if prime:
        prime_number.append(num)
print(prime_number)

