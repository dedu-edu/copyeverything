#include <iostream>
using namespace std;
int main()
{
    int a;
    cin >> a;
    for (int i = 1; i <= a; i++)
    {
        if (i==a)
        {
            cout<<i<<endl;
            break;
        }
        cout<<i<<" ";
    }
    return 0;
}