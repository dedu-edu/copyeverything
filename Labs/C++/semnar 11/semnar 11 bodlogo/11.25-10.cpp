#include <iostream>
using namespace std;
int main()
{
    int n,given_number;
    cout<<"Enter the size ofthe array: ";
    cin>>n;
    int a[n];
    cout<<"Enter the array elements: ";
    for(int i=0;i<n;i++)
    {
        cin>>a[i];
    }
    cout<<"Enter the number to be searched: ";
    cin>>given_number;
    int j = 0;

    while (j<n)
    {
        if(a[j]==given_number)
        {
            cout<<"The number is in the array at : "<<j+1<< "th place";
            break;
        }
        else
        {
            j += 1;
        }
    }
}