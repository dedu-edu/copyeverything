import time
def age_calculator(year,month,day):
    current_year = time.localtime()[0]
    current_month = time.localtime()[1]
    current_day = time.localtime()[2]
    age_year = current_year - year
    age_month = current_month - month
    age_day = current_day - day
    if age_day < 0:
        age_day = 30 + age_day
    if age_month < 0:
        age_year -= 1
        age_month = 12 + age_month
    age_year, age_month, age_day = abs(age_year), abs(age_month), abs(age_day)
    print(f'You are {age_year} years and {age_month} months and {age_day} days old ')

year = int(input('Enter your birth year: '))
month = int(input('Enter your birth month: '))
day = int(input('Enter your birth day: '))

age_calculator(year,month,day)