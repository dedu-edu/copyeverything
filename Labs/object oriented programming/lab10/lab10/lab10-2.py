class Bot:
    name = ""
    __history = {}
    def __init__(self, name):
        self.name = name

    def add_history(self, message, answer):
        self.__history[message] = answer

    @property
    def history(self):
        return self.__history

    def response(self,message):
        pass

class SupportBot(Bot):
    def __init__(self, name):
        super().__init__(name)

    def response(self,message):
        if message in self.history:
            return f"finding solution to your problem: {self.history[message]} "
        else:
            answer = input("""i cannot find the answer to that question. 
                  please enter the answer for better services next time
                  :
                  """)
            self.add_history(message, answer)
            return "saved successfully"

class SalesBot(Bot):
    def __init__(self, name):
        super().__init__(name)

    def response(self,message):
        if message in self.history:
            return f"i advice you this product: {self.history[message]} "
        else:
            answer = input("""i cannot find the answer to that question. 
                  please enter the answer for better services next time
                  :
                  """)
            self.add_history(message, answer)
            return "saved successfully"

class TutorBot(Bot):
    def __init__(self, name):
        super().__init__(name)

    def response(self,message):
        if message in self.history:
            return f"lets explain it: {self.history[message]} "
        else:
            answer = input("""i cannot find the answer to that question. 
                  please enter the answer for better services next time
                  :
                  """)
            self.add_history(message, answer)
            return "saved successfully"

def check_status():
    status = int(input("""do u want to continue? 
    -------------------------
    1 for yes, 2 for no
    -------------------------
    input:
    """))
    if status == 1:
        status = True
        return status
    elif status == 2:
        status = False
        return status
    else:
        print("invalid status")
        check_status()

bot1 = SupportBot("Grok")
bot2 = SalesBot("Claude")
bot3 = TutorBot("Gemini")

bots = [bot1, bot2, bot3]
status = True
while status:
    bot_type = int(input("""
    choose your bot type
    ---------------------------------------
    1 for support, 2 for sales, 3 for tutor
    ---------------------------------------
    input:
    """))

    if 1<=bot_type<=3:
        print(bots[bot_type - 1].response(input("prompt: ").lower()))
        status = check_status()
    else:
        print("invalid bot type")
print("thx u for using our chatbot!!!")