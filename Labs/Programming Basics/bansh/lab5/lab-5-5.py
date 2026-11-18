allowed_student_code_List = ["V.BA23C001", "V.BA23C002", "V.BA24C003", "V.BA24C004", "V.BA25C005", "V.BA26C006"]
is_running = True
while is_running:
    student_code = input("Enter your student code: ")
    if student_code not in allowed_student_code_List:
        print("Invalid student code")
    else:
        print("Welcome!")
        student_year = 26 - int(student_code[4:6])
        option = True
        while option:
            have_made_selection = input("Do you have made selection? (y/n): ").lower()
            if have_made_selection == "y":
                have_made_selection = True
                option = False
            elif have_made_selection == "n":
                have_made_selection = input("Would you like to make selection? (y/n): ").lower()
                if have_made_selection == "y":
                    option = False
                    have_made_selection = True
                    print("Successfully made selection!")
                elif have_made_selection == "n":
                    option = False
                    print("Understood, returning to main page!")
                    have_made_selection = False
            else:
                print("Invalid input")
        if have_made_selection:
            credits = int(input("Enter your credits: "))
            if student_year > 2:
                total_payment = credits * 16000
                print(f'Total payment: {total_payment}')
            else:
                total_payment = credits * 15000
                print(f'Total payment: {total_payment}')
        is_payed = input("Did you made the payment? (y/n): ").lower()
        if is_payed == "y":
            is_payed = True
        elif is_payed == "n":
            is_payed = False
        if is_payed:
            print("Thank you!")
        elif not is_payed:
            print("Bye")

        is_continue = input("Do you want to continue? (y/n): ").lower()
        if is_continue == "y":
            continue
        else:
            is_running = False
            print("Thank you for using the code")
