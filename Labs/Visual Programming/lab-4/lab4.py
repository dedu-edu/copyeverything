import tkinter as tk
from tkinter import ttk, messagebox

root = tk.Tk()
root.title("Python Quiz")
root.geometry("680x600")
root.resizable(False, False)
root.columnconfigure(0, weight=1)
root.rowconfigure(1, weight=1)

#global variables
curr_question_index = 0
points = 0
opt_btn_list = []

#consts
MAX_OPTIONS = 4

#The questions list. Contains the questions in a seperate dicts.
# question dict = {
#   question => str
#   options => list["str"], max is MAX_OPTIONS
#   answer => str or int
#}
questions = [
    {
        "question": "Who created Python?",
        "options": ["Linus Torvalds", "Guido van Rossum", "James Gosling", "Bjarne Stroustrup"],
        "answer": "Guido van Rossum"
    },
    {
        "question": "What is the file extension of a Python source file?",
        "options": [".pt", ".python", ".py", ".pyt"],
        "answer": ".py"
    },
    {
        "question": "Which brackets create a list?",
        "options": ["( )", "{ }", "< >", "[ ]"],
        "answer": "[ ]"
    },
    {
        "question": "Which keyword defines a function?",
        "options": ["def", "function", "func", "define"],
        "answer": "def"
    },
    {
        "question": "Which of these is a Boolean value?",
        "options": ["'yes'", "1.0", "True", "None"],
        "answer": "True"
    },
    {
        "question": "What does len() do?",
        "options": ["Sorts a list", "Counts the items in a sequence", "Converts to a string", "Finds the biggest value"],
        "answer": "Counts the items in a sequence"
    },
    {
        "question": "What is a for statement used for?",
        "options": ["Defining a function", "Checking a condition", "Looping", "Opening a file"],
        "answer": "Looping"
    },
    {
        "question": "How do you create an empty dictionary?",
        "options": ["[ ]", "{ }", "( )", "empty()"],
        "answer": "{ }"
    },
    {
        "question": "What is Tkinter used for?",
        "options": ["Web servers", "Databases", "Math calculations", "Building GUIs"],
        "answer": "Building GUIs"
    },
    {
        "question": "Which call starts the Tkinter event loop?",
        "options": ["start()", "run()", "mainloop()", "pack()"],
        "answer": "mainloop()"
    }
]
#check question's eligibility
def validate_questions():
    questions_length = len(questions)
    for i in range(questions_length):
        question = questions[i]["question"].strip()
        options = questions[i]["options"]
        answer = questions[i]["answer"].strip()
        if question == "":
            messagebox.showwarning("Question not given", f"Question {i+1}: Question is empty")
            return True
        if len(options) > MAX_OPTIONS:
            messagebox.showwarning("Too many options", f"Question {i+1}: Added too many options, max is {MAX_OPTIONS}")
            return True
        for j in range(len(options)):
            if options[j].strip() == "":
                messagebox.showwarning("Option not given", f"Question {i+1}: {j+1}th option is empty")
                return True
            if options.count(options[j]) > 1:
                messagebox.showwarning("Duplicated options", f'Question {i+1}: Duplicated options')
                return True
        if answer == "" or answer not in options:
            messagebox.showwarning("Right answer not given", f"Question {i+1}: Right answer is empty")
            return True
    return False

#functions
def reset_game():
    global points, curr_question_index
    points = 0
    curr_question_index = 0
    point_label.config(text=f"{points} points", font=("Arial", 18))
    question_number_label.config(text=f'{str(curr_question_index+1)} out of {len(questions)} questions')
    update_question()

def change_frame():
    reset_game()
    quiz_frame.tkraise()

def change_question():
    global curr_question_index

    result = check_answer()
    if result is None:
        return
    
    elif curr_question_index + 1 > len(questions)-1:
        progress_bar.config(value=len(questions))
        show_results()
        return
    
    curr_question_index += 1
    update_question()

def check_answer():
    global points
    right_answer = questions[curr_question_index]["answer"]

    if selected.get() == right_answer:
        points += 1
    elif selected.get() == "":
        messagebox.showwarning("Warning", "Please pick an answer")
        return None
    
    point_label.config(text=f'{points} points')
    return True

def update_question():
    progress = curr_question_index
    progress_bar.config(value=progress)

    if curr_question_index == len(questions) - 1:
        next_button.config(text="Finish")
    else:
        next_button.config(text="Next>>")

    selected.set(value="")
    question.set(value=questions[curr_question_index]["question"])
    question_number_label.config(text=f'{str(curr_question_index+1)} out of {len(questions)} questions ')

    for i in range(len(questions[curr_question_index]["options"])):
        option = questions[curr_question_index]["options"][i]
        opt_btn_list[i].config(text=option, value=option)


def show_results():
    result_frame.tkraise()
    max_points = len(questions)
    percentage = round(points * 100 / max_points)
    if percentage >= 90:
        result_text.set(value="Excellent!")
    elif percentage >= 70:
        result_text.set(value="Good!")
    elif percentage >= 50:
        result_text.set(value="Fair Enough!")
    else:
        result_text.set(value="Suggest to play again!")
    result_point_label.config(text=f"{points}/{max_points} {percentage}%")

def quit_game():
    root.destroy()

#check questions
error = validate_questions()
if error:
    root.destroy()
    raise SystemExit(1)

#variables
question = tk.StringVar(value=questions[curr_question_index]["question"])
selected = tk.StringVar()
result_text = tk.StringVar(value="Congrats")
#The header
ttk.Label(root, text="Python quiz", font=("Arial", 16, "bold"), anchor="w", background="#0c008d").grid(row=0, column=0, sticky="nsew")

#Windows
result_frame = tk.Frame(root, bg="blue")
result_frame.grid(row=1, column=0, sticky="nsew")

quiz_frame = tk.Frame(root, bg="lightblue")
quiz_frame.grid(row=1, column=0, sticky="nsew")

menu_frame = tk.Frame(root, bg="blue")
menu_frame.grid(row=1, column=0, sticky="nsew")

#Menu widgets/frames
ttk.Label(menu_frame, text="Python quiz challenge").pack(pady=10, anchor="center")

menu_button_frame = tk.Frame(menu_frame, bg="blue")
menu_button_frame.pack(pady=10, anchor="center")

start_button = tk.Button(menu_button_frame, text="Start", command=change_frame)
start_button.grid(row=1, column=0, padx=5)

quit_button = tk.Button(menu_button_frame, text="Quit", command=quit_game)
quit_button.grid(row=1, column=1, padx=5)

#Quiz widgets/frames
progress_bar = ttk.Progressbar(quiz_frame, value=0, maximum=len(questions))
progress_bar.pack(padx=10, pady=10, fill="x")

quiz_header_frame = tk.Frame(quiz_frame, bg="lightblue")
quiz_header_frame.pack(padx=10, pady=10)

point_label = tk.Label(quiz_header_frame, text=f"{points} points", font=("Arial", 18), fg="white", bg="lightblue")
point_label.grid(row=0, column=0, padx=10, pady=10)

question_number_label = tk.Label(quiz_header_frame, text=f'{str(curr_question_index+1)} out of {len(questions)} questions ', font=("Arial", 18), fg="white", bg="lightblue")
question_number_label.grid(row=0, column=1, padx=10, pady=10)

ttk.Label(quiz_frame, textvariable=question).pack(padx=10, pady=10, anchor="w")

for i in range(len(questions[curr_question_index]["options"])):
    option = questions[curr_question_index]["options"][i]
    btn = ttk.Radiobutton(quiz_frame, text=option, value=option, variable=selected)
    btn.pack(padx=10, pady=10, anchor="w")
    opt_btn_list.append(btn)

quiz_button_frame = tk.Frame(quiz_frame, bg="lightblue")
quiz_button_frame.pack(padx=10, pady=10, anchor="center")

next_button = tk.Button(quiz_button_frame, text="Next>>", command=change_question)
next_button.grid(row=0, column=0, padx=10, pady=10)

#Result widgets/frames
result_word_label = tk.Label(result_frame, textvariable=result_text)
result_word_label.pack(padx=10, pady=10)

result_point_label = tk.Label(result_frame, text=f"{points} out of {len(questions)} points!!!")
result_point_label.pack(padx=10, pady=10)

result_button_frame = tk.Frame(result_frame, bg="blue")
result_button_frame.pack(padx=10, pady=10)

play_again_button = tk.Button(result_button_frame, text="Play Again", command=change_frame)
play_again_button.grid(row=0, column=0, padx=10, pady=10)

result_quit_button = tk.Button(result_button_frame, text="Quit", command=quit_game)
result_quit_button.grid(row=0, column=1, padx=10, pady=10)
root.mainloop()