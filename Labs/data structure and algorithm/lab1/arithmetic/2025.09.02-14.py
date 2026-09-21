base_loan = int(input("enter the base loan: "))
interest_rate = int(input("enter the interest rate: "))
months = int(input("enter the number of months: "))
all_loan = base_loan + (base_loan/100 * interest_rate)*months
month_by_month_payment = all_loan / months
print(f'all loan: {all_loan}, monthly payment: {month_by_month_payment}')