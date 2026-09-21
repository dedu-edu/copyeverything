#include <iostream>
#include <string>
using namespace std;
class IT
{
    public:
    string name;
    string gender;
    int phone_number;
};
int main()
{
    IT studentObj;
    studentObj.name = "william";
    studentObj.gender = "male";
    studentObj.phone_number = 94430014;
    cout << studentObj.name << endl;
    cout << studentObj.gender << endl;
    cout << studentObj.phone_number << endl;
    return 0;
}