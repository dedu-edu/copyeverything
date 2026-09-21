#include <iostream>
using namespace std;
int main()
//find triangles parameter
{
    int hours, minutes, seconds;
    cin >>hours >>  minutes >> seconds;
    cout << hours * 3600 + minutes*60 + seconds << endl;
    return 0;
}