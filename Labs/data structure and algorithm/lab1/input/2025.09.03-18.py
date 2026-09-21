grade = int(input("enter your grade in number: "))
if grade > 90:
    print("you are a student")
elif 80<grade<=90:
    print("you are b student")
elif 70<grade<=80:
    print("you are c student")
elif 60<grade<=70:
    print("you are d student")
else:
    print("you are F student")