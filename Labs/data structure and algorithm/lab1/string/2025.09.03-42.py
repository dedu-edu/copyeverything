counts = {"alphabets": 0, "digits": 0, "spaces": 0, "special_characters": 0}
# Example usage
input_string = input("enter your string: ")
for char in input_string:
    if char.isalpha():
        counts["alphabets"] += 1
    elif char.isdigit():
        counts["digits"] += 1
    elif char.isspace():
        counts["spaces"] += 1
    else:
        counts["special_characters"] += 1
result = counts
print(result)
