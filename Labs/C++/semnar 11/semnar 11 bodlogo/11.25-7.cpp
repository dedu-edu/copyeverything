#include <iostream>
using namespace std;
int main()
{
    int n,factodd=1,facteven=1;
    cin>>n;
    if(n%2==1)
    {
        for (int i = 1; i <= n; i=i+2)
        {
            factodd = factodd * i;
        }
        cout<<factodd<<endl;
    }
    else
    {
        for (int i = 2; i <= n; i=i+2)
        {
            facteven = facteven * i;
        }
        cout<<facteven<<endl;
    }
}