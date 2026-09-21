age = int(input("Enter your age: "))
if age >=19:
    print("Fare is 500")
elif 18>=age>=13:
    print("Fare is 300")
elif 12>=age>=6:
    print("Fare is 250")
elif age<6:
    print("Fare is 0")