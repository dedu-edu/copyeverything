#getting the inputs
age = int(input("Enter your age: "))
weekday = input("Enter your weekday: ")
is_holiday = input("Is today a holiday? ")
ticket_price = 0

#checking the age, to categorise into the right age bracket

if age < 6:
    ticket_price = "Free"
elif 12>=age>=6:
    ticket_price = 600
elif 18>=age>=13:
    ticket_price = 900
elif 64>=age>=19:
    ticket_price = 1200
elif age>=65:
    ticket_price = 800

#checking the holiday

if is_holiday.lower() == "yes":
    ticket_price = ticket_price / 2
elif is_holiday.lower() == "no":
    ticket_price = ticket_price
else:
    print("invalid input")

#checking the weekday

if weekday.lower() == "wednesday":
    ticket_price = ticket_price - (ticket_price * 0.20)
elif weekday.lower() == "saturday" and 64>=age>=19 or weekday.lower() == "sunday" and 64>=age>=19:
    ticket_price = ticket_price + 1500
else:
    ticket_price = ticket_price

#printing the output

print(f'Your movie ticket price is {ticket_price}₮')





