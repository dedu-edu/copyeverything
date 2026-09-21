#include <iostream>
#include <string>
#include <cmath>
using namespace std;
int main() {
    int a,c=0,b;
    cin>>a;
    while (a>9) {
        b=a;
        c=0;
        while(b>0) {
            c += b % 10;
            b /= 10;
        }
        a=c;
    }
    cout<<a<<endl;

}