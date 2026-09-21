#include <iostream>
using namespace std;
int main()
{
    int fn,fn1=1,fn2=1,fsum;
    cin>>fn;
    if (fn==1)
    {
        cout<<1;
    }
    else if (fn==2)
    {
        cout<<1;
    }
    else
    {
        while(fn>2)
        {
            fsum= fn1 + fn2;
            fn2 = fn1;
            fn1 = fsum;
            fn=fn-1;
        }
        cout<<fsum;
    }
}