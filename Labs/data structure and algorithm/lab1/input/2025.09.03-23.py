age = int(input("Enter your age: "))
profession = input("Enter your profession: ").lower()
ticket_price = int(input("Enter your ticket price: "))
if age < 12:
    ticket_price = ticket_price * 0.5
    print(ticket_price)
else:
    if profession == "оюутан":
        ticket_price = ticket_price * 0.75
        print(ticket_price)
