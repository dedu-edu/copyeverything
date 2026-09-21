class Notification:
    receiver = ""

    def __init__(self, receiver):
        self.receiver = receiver

    def send(self,message):
        pass

class EmailNotification(Notification):
    __email_server = ""

    def __init__(self, receiver):
        super().__init__(receiver)

    def send(self,message):
        print(f"""Email sent to {self.receiver}
------------------------------
{message}""")

class SMSNotification(Notification):
    __api_key = ""

    def __init__(self, receiver):
        super().__init__(receiver)

    def send(self,message):
        print(f"""SMS sent to {self.receiver}
------------------------------
{message}""")

class PushNotification(Notification):

    def __init__(self, receiver):
        super().__init__(receiver)

    def send(self,message):
        print(f"""Push sent to {self.receiver}
------------------------------
{message}""")

notif1 = EmailNotification("Amarbold")
notif2 = SMSNotification("Amina")
notif3 = PushNotification("Erdem")
notif_list = [notif1, notif2, notif3]
for notif in notif_list:
    notif.send(f"Hello, {notif.receiver}")
