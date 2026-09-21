#include <iostream>
using namespace std;
int main() {
    int second, minute;
    cout<<"Please enter the time number: ";
    cin >> minute >> second;
    minute = minute * 60;
    second = second + minute;
    cout<<"the time is "<< second<< " seconds";
    return 0;
}