#input from user
payment = int(input("Enter payment: "))
tip = int(input("Enter tip percentage: "))
bill = payment + (payment * tip / 100)
print(f"your total bill is {bill}")