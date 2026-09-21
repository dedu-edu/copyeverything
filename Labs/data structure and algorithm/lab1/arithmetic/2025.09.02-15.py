from datetime import date
current_date = date.today()
current_month = current_date.month
current_year = current_date.year
year = int(input("enter your birth year: "))
month = int(input("enter your birth month: "))
if month > current_month:
    birth_month = 12 - (month - current_month)
    birth_year = current_year - year - 1
else:
    birth_month = current_month - month
    birth_year = current_year - year
print(f'You are {birth_year} years {birth_month} months old.')