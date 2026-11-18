import tkinter as tk
import os
from tkinter import ttk, messagebox

root = tk.Tk()
root.title("Text editor")
root.geometry("800x500")
root.resizable(False, False)

#Menu options
menu_options = tk.Menu(root)

file_options = tk.Menu(menu_options, tearoff=0)
menu_options.add_cascade(label="File", menu=file_options)
file_options.add_command(label="New File", command=None)
file_options.add_command(label="Open", command=None)

root.config(menu=menu_options)

#Text edit section 
text = tk.Text(root)
text.pack(padx=10, pady=10, fill="both")

#Footer
footer_label = tk.Label(root, text="UTF-8 | 0 chars", anchor="w")
footer_label.pack(padx=10, pady=10, fill="x")

root.mainloop()
