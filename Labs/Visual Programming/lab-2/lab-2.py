import tkinter as tk
root = tk.Tk()
screen_width = 600
screen_height = 500
root.title("Calculator")
root.geometry(f'{str(screen_width)}x{str(screen_height)}')
history_list = []
chosen_op = []
result = []
#attributes = [width, height]
op_btn_attr = [8,3]
def plus_op():
    try:
        choose_operation("+")
        num1 = float(num1_entry.get().strip())
        num2 = float(num2_entry.get().strip())
        result.clear()
        result.append(str(num1 + num2))
        plus_button.config(state=tk.DISABLED, relief=tk.SUNKEN)
    except ValueError:
        warning_label.config(text="Error: Please enter a number", font=("Arial", 20, "bold"), fg='red')

def minus_op():
    try:
        choose_operation("-")
        num1 = float(num1_entry.get().strip())
        num2 = float(num2_entry.get().strip())
        result.clear()
        result.append(str(num1 - num2))
        minus_button.config(state=tk.DISABLED, relief=tk.SUNKEN)
    except ValueError:
        warning_label.config(text="Error: Please enter a number", font=("Arial", 20, "bold"), fg='red')

def multi_op():
    try:
        choose_operation("*")
        num1 = float(num1_entry.get().strip())
        num2 = float(num2_entry.get().strip())
        result.clear()
        result.append(str(num1 * num2))
        multi_button.config(state=tk.DISABLED, relief=tk.SUNKEN)
    except ValueError:
        warning_label.config(text="Error: Please enter a number", font=("Arial", 20, "bold"), fg='red')

def divide_op():
    try:
        choose_operation("/")
        num1 = float(num1_entry.get().strip())
        num2 = float(num2_entry.get().strip())
        if num2 == 0:
            warning_label.config(text = 'Cannot divide by Zero!!!', font=("Arial", 20, "bold"), fg='red')
        else:
            result.clear()
            result.append(str(round((num1 / num2),5)))
            divide_button.config(state=tk.DISABLED, relief=tk.SUNKEN)
    except ValueError:
        warning_label.config(text="Error: Please enter a number", font=("Arial", 20, "bold"), fg='red')

def quotient_divide_op():
    try:
        choose_operation("//")
        num1 = float(num1_entry.get().strip())
        num2 = float(num2_entry.get().strip())
        if num2 == 0:
            warning_label.config(text = 'Cannot divide by Zero!!!', font=("Arial", 20, "bold"), fg='red')
        else:
            result.clear()
            result.append(str(num1 // num2))
            quotient_divide_button.config(state=tk.DISABLED, relief=tk.SUNKEN)
    except ValueError:
        warning_label.config(text="Error: Please enter a number", font=("Arial", 20, "bold"), fg='red')

def remainder_divide_op():
    try:
        choose_operation("%")
        num1 = float(num1_entry.get().strip())
        num2 = float(num2_entry.get().strip())
        if num2 == 0:
            warning_label.config(text = 'Cannot divide by Zero!!!', font=("Arial", 20, "bold"), fg='red')
        else:
            result.clear()
            result.append(str(num1 % num2))
            remainder_button.config(state=tk.DISABLED, relief=tk.SUNKEN)
    except ValueError:
        warning_label.config(text="Error: Please enter a number", font=("Arial", 20, "bold"), fg='red')

def power_op():
    try:
        choose_operation("^")
        num1 = float(num1_entry.get().strip())
        num2 = float(num2_entry.get().strip())
        result.clear()
        result.append(str(num1 ** num2))
        power_button.config(state=tk.DISABLED, relief=tk.SUNKEN)
    except ValueError:
        warning_label.config(text="Error: Please enter a number", font=("Arial", 20, "bold"), fg='red')

def add_to_history(result, num1, num2, operation):
    if len(history_list) == 3:
        history_list.pop()
        history_list.insert(0,f'{num1} {operation} {num2} = {result[0]}')
    else:
        history_list.insert(0,f'{num1} {operation} {num2} = {result[0]}')
    history_label.config(text="")
    warning_label.config(text="")

def history():
    h_list = "\n".join(history_list)
    history_label.config(text=h_list)
    history_label.pack()

def clear_nums():
    num1_entry.delete(0, tk.END)
    num2_entry.delete(0, tk.END)
    warning_label.config(text="")
    result_label.config(text="")
    history_label.config(text="")

def close_calculator(event):
    root.destroy()

def choose_operation(operation):
    if chosen_op:
        prev_op = chosen_op[0]
        change_operation()
        chosen_op.pop()
        chosen_op.append(operation)
    else:
        chosen_op.append(operation)

def calculate(event):
    num1 = num1_entry.get().strip()
    num2 = num2_entry.get().strip()
    result_label.config(text=result[0])
    result_label.pack(padx=5, side=tk.RIGHT)
    add_to_history(result, num1, num2, chosen_op[0])
    change_operation()

def change_operation():
    if chosen_op[0] == "+":
        plus_button.config(state=tk.NORMAL, relief=tk.RAISED)
    elif chosen_op[0] == "-":
        minus_button.config(state=tk.NORMAL, relief=tk.RAISED)
    elif chosen_op[0] == "*":
        multi_button.config(state=tk.NORMAL, relief=tk.RAISED)
    elif chosen_op[0] == "/":
        divide_button.config(state=tk.NORMAL, relief=tk.RAISED)
    elif chosen_op[0] == "//":
        quotient_divide_button.config(state=tk.NORMAL, relief=tk.RAISED)
    elif chosen_op[0] == "%":
        remainder_button.config(state=tk.NORMAL, relief=tk.RAISED)
    elif chosen_op[0] == "^":
        power_button.config(state=tk.NORMAL, relief=tk.RAISED)

root.bind("<Escape>", close_calculator)
root.bind("<Return>", calculate)

title_label = tk.Label(root, text="Calculator", font=("Arial", 20, "bold"), fg="darkblue", borderwidth=3, relief="solid", width=80, height=2)
title_label.pack()

num1_frame = tk.Frame(root)
num1_frame.pack(pady=10)

num2_frame = tk.Frame(root)
num2_frame.pack(pady=10)

num1_label = tk.Label(num1_frame, text="First Num:", font=("Arial", 20, "bold"))
num1_label.pack(padx=5, side=tk.LEFT)

num1_entry = tk.Entry(num1_frame, width=30)
num1_entry.pack(padx=5, side=tk.RIGHT)

num2_label = tk.Label(num2_frame, text="Second Num:", font=("Arial", 20, "bold"))
num2_label.pack(padx=5, side=tk.LEFT)

num2_entry = tk.Entry(num2_frame, width=30)
num2_entry.pack(padx=5, side=tk.RIGHT)

result_frame = tk.Frame(root)
result_frame.pack(pady=10)

operation_button_frame = tk.Frame(root)
operation_button_frame.pack(pady=15)

action_button_frame = tk.Frame(root)
action_button_frame.pack(pady=15)

result_text_label = tk.Label(result_frame, text="Result:", font=("Arial", 20, "bold"))
result_text_label.pack(padx=5, side=tk.LEFT)

result_label = tk.Label(result_frame, text="", font=("Arial", 20, "bold"))

plus_button = tk.Button(operation_button_frame, width=op_btn_attr[0], height=op_btn_attr[1], text="+", command=plus_op)
plus_button.pack(padx=5, side=tk.LEFT)

minus_button = tk.Button(operation_button_frame, width=op_btn_attr[0], height=op_btn_attr[1], text="-", command=minus_op)
minus_button.pack(padx=5, side=tk.LEFT)

multi_button = tk.Button(operation_button_frame, width=op_btn_attr[0], height=op_btn_attr[1], text="*", command=multi_op)
multi_button.pack(padx=5, side=tk.LEFT)

divide_button = tk.Button(operation_button_frame, width=op_btn_attr[0], height=op_btn_attr[1], text="/", command=divide_op)
divide_button.pack(padx=5, side=tk.LEFT)

quotient_divide_button = tk.Button(operation_button_frame, width=op_btn_attr[0], height=op_btn_attr[1], text="//", command=quotient_divide_op)
quotient_divide_button.pack(padx=5, side=tk.LEFT)

remainder_button = tk.Button(operation_button_frame, width=op_btn_attr[0], height=op_btn_attr[1], text="%", command=remainder_divide_op)
remainder_button.pack(padx=5, side=tk.LEFT)

power_button = tk.Button(operation_button_frame, width=op_btn_attr[0], height=op_btn_attr[1], text="^", command=power_op)
power_button.pack(padx=5, side=tk.LEFT)

clear_button = tk.Button(action_button_frame, width=8, height=3, text="C", command=clear_nums)
clear_button.pack(padx=5, side=tk.LEFT)

warning_label = tk.Label(root, text='')
warning_label.pack(pady=5)

history_label = tk.Label(root, text='', fg="black", bg="white")

history_button = tk.Button(action_button_frame, width=10, text="History", command=history)
history_button.pack(padx=5, side=tk.LEFT)

root.mainloop()