//bodlogo 1

/* #include <iostream>
using namespace std;
int main() {
int x, y;
cout << "please enter x value: ";
cin >> x;
y = 3 * x - 5;
cout << "y = " << y;
return 0;
}
*/

//bodlogo 2

/* #include <iostream>
using namespace std;
int main() {
int x, y;
cout << "please enter x value: ";
cin >> x;
y = (x * x) * 4 - 3 * x + 5;
cout << "y = " << y;
return 0;
}
*/

//bodlogo 3

/* #include <iostream>
using namespace std;
int main() {
int a;
cout << "Enter a number: ";
cin >> a;
a = a % 10;
cout << "last digit is: " << a;
return 0;
}
*/

//bodgolo 4

/* #include <iostream>
using namespace std;
int main() {
int a;
cout << "Enter a number: ";
cin >> a;
a = a % 100;
a = a / 10;
cout << "second to last digit is: " << a;
return 0;
}
*/

//bodlogo 5

/* #include <iostream>
using namespace std;
int main() {
int a,b,c;
cout << "Enter a number: ";
cin >> a;
b = a / 10;
a = a % 10;
c = a * b;
cout << "the multiplication of the digits is: " << c;
return 0;
}
*/

//bodlogo 6

/* #include <iostream>
using namespace std;
int main() {
int a,b;
cout << "Enter a number: ";
cin >> a;
while (a>1) {
if (a%2==0) {
b = a /= 2;
}
else {
break;
}
}
if (b == 1) {
cout << "number is a power of two";
}
else {
cout << "number is not a power of two";
}
return 0;
}
*/

// bodlogo 7
#include <iostream>
using namespace std;
int main() {
    int a,b,c,d,e;
    cout << "Enter a number: ";
    cin >> a;
    b = a /100;
    c = (a / 10)%10;
    d = a % 10;
    e = d * 100 + c * 10 + b;
    cout << e;
    return 0;
}
