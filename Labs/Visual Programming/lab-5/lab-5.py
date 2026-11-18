import tkinter as tk
import re
from tkinter import messagebox

root = tk.Tk()
root.geometry('600x550')
root.title("Student System")
root.resizable(False, False)
root.columnconfigure(0, weight=1)
root.rowconfigure(1, weight=1)

curr_user = ""

DEMO_USER = 'student123'
DEMO_PASSWORD = 'It@12345'

def show_password():
    if not check_credentials():
        show_warning("Unfilled field", "Please fill in all the fields")
        is_password_hidden.set(False)
        return

    password_entry.config(show="" if is_password_hidden.get() else "*")

def check_credentials():
    password = get_password()
    username = get_username()
    if password == "" or username == "":
        return False

def authentication():
    

def get_password():
    return password_entry.get().strip()

def get_username():
    return username_entry.get().strip()

def show_warning(title, text):
    messagebox.showwarning(title, text)

def login():
    if not check_credentials():
        show_warning("Unfilled field", "Please fill in all the fields")
        return 

def change_frame(frame):


is_password_hidden = tk.BooleanVar()

header_label = tk.Label(root, text="Student System / Login", font=("Arial", 16), bg="navy", anchor="w")
header_label.grid(row=0, column=0, ipadx=10, ipady=10, sticky="nsew")

login_frame = tk.Frame(root, background="#c0d5df")
login_frame.grid(row=1, column=0, sticky="nsew")

username_label = tk.Label(login_frame, text="Username", font=("Arial", 16), fg="navy")
username_label.pack(padx=10, pady=10)

username_entry = tk.Entry(login_frame)
username_entry.pack(padx=10, pady=10)

password_label = tk.Label(login_frame, text="Password", font=("Arial", 16), fg="navy")
password_label.pack(padx=10, pady=10)

password_entry = tk.Entry(login_frame, show="*")
password_entry.pack(padx=10, pady=10)

show_password_checkbutton = tk.Checkbutton(login_frame, text='Show password', font=("Arial", 12), variable=is_password_hidden, command=show_password)
show_password_checkbutton.pack(padx=10, pady=10)

login_button = tk.Button(login_frame, text="Login", font=("Arial", 18), bg='#274dd8', command=login)
login_button.pack(padx=10, pady=10)

student_dashboard_frame = tk.Frame(root)

admin_dashboard_frame = tk.Frame(root)

root.mainloop()
