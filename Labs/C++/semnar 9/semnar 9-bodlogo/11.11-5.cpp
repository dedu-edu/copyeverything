#include <iostream>
#include <string>
using namespace std;
string name(string surname, string nm) {
    return surname + " " + nm;
}
int main() {
    string surname,nm;
    cout<<"enter your surname: ";
    cin>>surname;
    cout<<"enter your name: ";
    cin>>nm;
    cout<<name(surname,nm);
    return 0;
}