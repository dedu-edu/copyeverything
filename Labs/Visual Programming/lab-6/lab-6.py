import tkinter as tk
import sqlite3
from tkinter import ttk, messagebox

root = tk.Tk()
root.title("Student Management UI")
root.geometry("650x500")
root.resizable(False, False)
root.columnconfigure(0, weight=5)
root.columnconfigure(1, weight=4)
#Const values
DB_PATH = "students.db"

#Variables
changes = []
last_sql_id = ""
basis_datas = []

#tk Variables
search_name = tk.StringVar()

#Functions
def read_data():
    global last_sql_id, basis_datas
    con = sqlite3.connect(DB_PATH)
    cursor = con.cursor()
    cursor.execute("SELECT * FROM students")
    table = cursor.fetchall()
    if not table:
        messagebox.showwarning("Table doesnt exist", "table is not created or path is wrong")
        return
    for row in range(len(table)):
        treeview.insert("", "end", values=(table[row][0], row+1, table[row][1], table[row][2]))
        basis_datas.append([table[row][0], row+1, table[row][1], table[row][2]])
    last_sql_id = table[-1][0]
    con.close()

def add_data():
    global last_sql_id
    name = get_name_entry()
    course = get_course_entry()
    if not name or not course:
        return
    total_row = len(treeview.get_children())
    treeview.insert("", "end", values=(last_sql_id+1, total_row+1, name, course))
    changes.append(["insert", (last_sql_id+1, name, course)])
    basis_datas.append([last_sql_id+1, total_row+1, name, course])
    last_sql_id += 1
    name_entry.delete(0, tk.END)
    course_entry.delete(0, tk.END)

def delete_data(): 
    result = get_selected()
    if not result:
        messagebox.showwarning("Empty selection", "Cannot delete while none selected")
        return
    selected_id, selected_row = result

    is_delete = messagebox.askyesno("Deletion of row", "Do u really want to delete this row?")
    if is_delete:
        treeview.delete(selected_id)
        basis_datas.pop(basis_datas.index(selected_row))
        changes.append(["delete", (selected_row[0],)])
        reorder_data()
        return
    
def edit_data():
    global changes
    result = get_selected()
    if not result:
        messagebox.showwarning("Empty selection", "Cannot edit while none selected")
        return
    selected_id, selected_row = result

    new_name = get_name_entry()
    new_course = get_course_entry()

    index = basis_datas.index(selected_row)
    basis_datas.pop(index)
    basis_datas.insert(index, [selected_row[0], selected_row[1], new_name, new_course])

    treeview.set(selected_id, "Name", new_name)
    treeview.set(selected_id, "Course", new_course)

    changes.append(["update", (new_name, new_course, selected_row[0])])

def save_data():
    global changes
    con = sqlite3.connect(DB_PATH)
    cursor = con.cursor()
    for change in changes:
        if change[0] == "insert":
            cursor.execute("""INSERT INTO students (ID, Name, Course) VALUES (?, ?, ?)""", change[1])    
        elif change[0] == "delete":
            cursor.execute("""DELETE FROM students WHERE ID = ?""", change[1])
        elif change[0] == "update":
            cursor.execute("""UPDATE students SET Name = ?, Course = ? WHERE ID = ?""", change[1])
    con.commit()
    con.close()
    changes = []

def get_name_entry():
    name = name_entry.get().strip()
    if not name:
        messagebox.showwarning("Name field invalid", "Please enter a valid name")
        return False
    return name

def get_course_entry():
    try:
        course = int(course_entry.get().strip())
    except ValueError:
        messagebox.showwarning("Course field invalid", "Please enter a valid course")
        return False
    if not course or course > 5 or course < 1:
        messagebox.showwarning("Course field invalid", "Please enter a valid course")
        return False
    return course

def get_selected():
    selected_id = treeview.selection()
    if not selected_id:
        return
    selected_row = treeview.item(selected_id[0])["values"]
    return [selected_id, selected_row]

def reorder_data():
    new_rows = treeview.get_children()
    new_row_len = len(new_rows)
    for i in range(new_row_len):
        treeview.set(new_rows[i], "ID", i+1)

def on_select(event):
    result = get_selected()
    if not result:
        return
    selected_id, selected_row = result
    name_entry.delete(0, tk.END)
    name_entry.insert(0, selected_row[2])
    course_entry.delete(0, tk.END)
    course_entry.insert(0, selected_row[3])

def on_close():
    global changes
    if not changes:
        root.destroy()
        return
    is_save = messagebox.askyesno("Unsaved Changes", "Would u like to save the unusaved changes?")
    if is_save:
        save_data()
    root.destroy()

def search_by_name(*args):
    search_text = search_name.get()
    treeview_items = treeview.get_children()
    result = []
    if not search_text:
        show_result(basis_datas)
        return
    for item_id in treeview_items:
        values = treeview.item(item_id)["values"]
        name = values[2]
        if search_text in name:
            result.append(values)
    show_result(result)

def clear_treeview():
    row_ids = treeview.get_children()
    for i in range(len(row_ids)):
        treeview.delete(row_ids[i])

def show_result(result):
    clear_treeview()
    for i in range(len(result)):
        treeview.insert("", "end", values=(result[i][0], i+1, result[i][2], result[i][3]))

#Header section
header_label = tk.Label(root, text="Student Management UI", font=("Arial", 19), bg="blue", anchor="w")
header_label.grid(row=0, column=0, padx=10, pady=10, sticky="nsew", columnspan=2)

#Name frame/widgets
name_frame = tk.Frame(root)
name_frame.grid(row=1, column=0, columnspan=2, sticky="nsew")
name_frame.columnconfigure(0, weight=2)
name_frame.columnconfigure(1, weight=3)

name_label = tk.Label(name_frame, text="Name: ", font=("Arial", 14), anchor="center")
name_label.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")

name_entry = tk.Entry(name_frame)
name_entry.grid(row=0, column=1, padx=10, pady=10, sticky="nsew")

#Course frame/widgets
course_frame = tk.Frame(root)
course_frame.grid(row=2, column=0, columnspan=2, sticky="nsew")
course_frame.columnconfigure(0, weight=2)
course_frame.columnconfigure(1, weight=3)

course_label = tk.Label(course_frame, text="Course: ", font=("Arial", 14), anchor="center")
course_label.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")

course_entry = tk.Entry(course_frame)
course_entry.grid(row=0, column=1, padx=10, pady=10, sticky="nsew")

#Treeview and Scrollbar section
tree_frame = tk.Frame(root)
tree_frame.grid(row=3, column=0, padx=10, pady=10, sticky="nsew")
tree_frame.columnconfigure(0, weight=1)

treeview = ttk.Treeview(tree_frame, columns=("SQL ID", "ID", "Name", "Course"), displaycolumns=("ID", "Name", "Course"), show="headings")
scrollbar = ttk.Scrollbar(tree_frame, orient="vertical", command=treeview.yview)

treeview.heading("ID", text="ID")
treeview.heading("Name", text="Name")
treeview.heading("Course", text="Course")

treeview.column("ID", width=50, anchor="center")
treeview.column("Name", width=120, anchor="center")
treeview.column("Course", width=120, anchor="center")

read_data()

treeview.configure(yscrollcommand=scrollbar.set)
treeview.bind("<<TreeviewSelect>>", on_select)

treeview.grid(row=0, column=0, sticky="e")
scrollbar.grid(row=0, column=1) 

#Search frame/widget
search_frame = tk.Frame(root)
search_frame.grid(row=3, column=1, sticky="nsew")

search_label = tk.Label(search_frame, text="Search: ")
search_label.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")

search_entry = tk.Entry(search_frame, textvariable=search_name)
search_entry.grid(row=1, column=0, padx=10, pady=10, sticky="nsew")

search_name.trace_add("write", search_by_name)

#Buttons
buttons_frame = tk.Frame(root)
buttons_frame.grid(row=4, column=0, columnspan=2, padx=10, pady=10, sticky="nsew")
buttons_frame.columnconfigure((0,1,2,3), weight=1)

add_button = tk.Button(buttons_frame, text="Add", bg="blue", command=add_data)
add_button.grid(row=0, column=0, padx=10)

delete_button = tk.Button(buttons_frame, text="Delete", bg="blue", command=delete_data)
delete_button.grid(row=0, column=1, padx=10)

save_button = tk.Button(buttons_frame, text="Save", bg="blue", command=save_data)
save_button.grid(row=0, column=2, padx=10)

edit_button = tk.Button(buttons_frame, text="Edit", bg="blue", command=edit_data)
edit_button.grid(row=0, column=3, padx=10)

root.protocol("WM_DELETE_WINDOW", on_close)
root.mainloop() 
