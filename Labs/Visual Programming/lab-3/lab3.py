import tkinter as tk
from tkinter import ttk
root = tk.Tk()
root.title("Student Registration")
root.geometry("640x720")
name = tk.StringVar(root)

ttk.Label(root, text="Enter name").pack(pady=8)

entry = ttk.Entry(root, textvariable=name)
entry.pack(padx=20)

result = ttk.Label(root, text="")
result.pack(pady=8)

bio = tk.Text(root, width=40, height=5, wrap="word")
bio.pack(padx=12, pady=8)
bio.insert("1.0", "Enter about yourself")

status = tk.StringVar(root,value="Ready")
ttk.Label(root, textvariable=status).pack()

def read_text():
    content = bio.get("1.0", "end-1c")
    status.set(f'Total {len(content)} chars')
    print(content)

def clear_text():
    bio.delete("1.0", "end")
    status.set("Cleaning")

def greet():
    student = name.get().strip()
    if not student:
        result.config(text='Enter name')
        entry.focus_set()
        return
    result.config(text=f"Hello {student}")
ttk.Button(root, text="Read", command=read_text).pack(pady=4)
ttk.Button(root, text="Clean", command=clear_text).pack()
ttk.Button(root, text="Info", command=greet).pack(pady=8)
entry.focus_set()
root.mainloop()