#include <iostream>
#include <cmath>
using namespace std;
int main() {
    double a,b,c,s,p;
    cout<<"enter the sides of the triangle: ";
    cin>>a>>b>>c;
    if(a+b>=c and a+c>=b and b+c>=a) {
        p = (a+b+c)/2;
        s = p*(p-a)*(p-b)*(p-c);
        s = sqrt(s);
        if (a==b and a==c and c==b) {
            cout<<"adal talt \n";
        }
        else if (a==b or a==c
            or b==c) {
            cout<<"adil hajuut \n";
        }
        else if (c==sqrt(a*a+b*b) or a==sqrt(b*b+c*c) or b==sqrt(c*c+a*a)) {
            cout<<"right triangle \n";
        }
        else {
            cout<<"eldev talt \n";
        }
    }
    cout << "talbai: " << s;
    return 0;
}
