# sample program : exe3-1_SampleProgram_tbf.py
# This program is not perfect. Please improve the code
temperature = int(input("What is the temperature in Celsius? "))
if temperature > 25:
    if temperature > 35:
     print("Өө, та зам дээр өндөг хуурч болно!")
    else:
        print("Гадаа халуун байна")
elif temperature < 10:
    print("Гадаа хүйтэн байна")
else:
    print("Гадаа сайхан байна")
print("Done")