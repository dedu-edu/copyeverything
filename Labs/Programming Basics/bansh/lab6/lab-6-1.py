a = int(input("enter a: "))
is_prime = True
for i in range(2, a):
    if a % i == 0:
        is_prime = False
        break
if is_prime:
    print(f"{a} is prime")
else:
    print(f"{a} is not prime")