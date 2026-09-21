class Model:
    __db_connection = {}

    def save(self, table, data):
        if table not in self.__db_connection:
            self.__db_connection[table] = [data]
        else:
            self.__db_connection[table].append(data)

    def delete(self, table, data):
        if table not in self.__db_connection:
            return "invalid table"
        else:
            self.__db_connection[table].remove(data)
            return "deleted"

    def get_db(self):
        return self.__db_connection
class User(Model):
    __password = ""

    def __init__(self, name, password):
        self.name = name
        self.__password = password

    def save(self, table, data):
        attempt = input("enter your password: ")
        if attempt != self.__password:
            return "invalid password"
        else:
            super().save(table, data)
            return "saved"

    def delete(self, table, data):
        attempt = input("enter your password: ")
        if attempt != self.__password:
            return "invalid password"
        else:
            super().delete(table, data)
            return "deleted"


class Post(Model):
    def __init__(self, title, author):
        self.title = title
        self.author = author


class Comment(Model):
    def __init__(self, text, post):
        self.text = text
        self.post = post

user = User("Alice", "1234")
post = Post("My first post", user)
comment = Comment("Nice post!", post)

user.save("users", "Alice")
post.save("posts", "My first post")
comment.save("comments", "Nice post!")

print(Model._db_connection)

user.delete("users", "Alice")
print(Model._db_connection)
