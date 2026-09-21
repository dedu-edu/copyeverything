#include <iostream>
using namespace std;
int main()
//find triangles parameter
{
    int sec;
    cin >> sec;
    cout << sec/3600 << " " << sec/60%60 << " " << sec%60 << endl;
    return 0;
}