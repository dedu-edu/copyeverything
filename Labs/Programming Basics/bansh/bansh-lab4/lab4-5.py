seconds = int(input("Enter seconds: "))
minutes = seconds // 60
seconds = seconds % 60
print(f"{minutes} minutes {seconds} seconds")