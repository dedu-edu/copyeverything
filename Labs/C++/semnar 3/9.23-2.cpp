#include <iostream>
using namespace std;
int main() {
    int sec,minu;
    cout<<"enter the seconds: ";
    cin>>sec;
    minu=sec/60;
    sec=sec%60;
    cout<<"minute is: "<<minu<<" second is: "<<sec;
    return 0;
}