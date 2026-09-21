#herev 50 ass deesh bol pass, 60 -good, 80-excellent
grade = int(input("Please enter grade: "))
if grade > 80:
    print("Excellent grade")
elif 80 >= grade >= 60:
    print("Good grade")
elif 60 > grade >= 50:
    print("Pass")
else:
    print("bad grade")