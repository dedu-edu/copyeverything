class Process:
    name = ""
    __state = ""
    runtime = 0

    def __init__(self, name, state):
        self.name = name
        self.__state = state
        self.runtime = 0

    def execute(self):
        if self.get_state() == "ready":
            self.set_state("running")
            self.runtime += 1
            return f"[{self.name}] Running... (runtime={self.runtime})"

        elif self.get_state() == "running":
            self.runtime += 1
            if self.runtime >= 5:
                self.set_state("finished")
                return f"[{self.name}] Finished! (runtime={self.runtime})"
            return f"[{self.name}] Already running... (runtime={self.runtime})"

        elif self.get_state() == "finished":
            return f"[{self.name}] Already finished."

        else:
            return f"[{self.name}] Invalid state"

    def get_state(self):
        return self.__state.lower()

    def set_state(self, state):
        self.__state = state


class UserProcess(Process):
    def __init__(self, name, state):
        Process.__init__(self, name, state)


class SystemProcess(Process):
    def __init__(self, name, state):
        Process.__init__(self, name, state)


proc1 = UserProcess("user1", "running")
proc2 = UserProcess("user2", "running")
proc3 = UserProcess("user3", "ready")
proc4 = UserProcess("user4", "finished")
proc5 = SystemProcess("system1", "ready")
processes = [proc1, proc2, proc3, proc4, proc5]
for i in processes:
    print(i.execute())

print("\nQueue")
queue = [UserProcess("A", "ready"), SystemProcess("B", "ready"), UserProcess("C", "ready")]

while queue:
    proc = queue[0]
    print(proc.execute())
    if proc.get_state() == "finished":
        queue.pop(0)
    else:
        queue.append(queue.pop(0))  # move to back