#include <iostream>
using namespace std;
int main() {
    int second,hour,minute;
    cout<<"enter the second: ";
    cin>>second;
    hour = second/3600;
    minute = (second%3600)/60;
    second = second%60;
    cout<<hour<<":"<<minute<<":"<<second;
    return 0;
}
