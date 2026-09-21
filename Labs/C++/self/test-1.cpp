#include <iostream>
using namespace std;
int main() {
    int a,b,c,n,check,i,j;
    cout<<"Enter your toot";
    cin>>n;
    cout<<"enter your apartments davhar: ";
    cin>>b;
    cout<<"enter your apartments orts: ";
    cin>>a;
    cout<<"enter your apartments haalga: ";
    cin>>c;
    check = c * b;
    cout<<"check is "<<check<<"\n";
    i = c;
    j = b;
    if (n<1 or n>a*check) {
      return 1;
    }
    else if (n<=check) {
        b=n/c;
        c=n%c;
        if (c==0 and b==0){
          c=i;
          b=j;
        }
        else if (c==0){
          c=i;
        }
        else if (b==0){
          b=j;
        }

        cout<<a<< "1 deh orts,"<< b << " deh davhar,"<< c << " deh haalga";
    }
    else if (n>check) {
        a= n/check;
        a= a+1;
        n= n%check;
        b=n/c;
        c=n%c;
        if (c==0 and b==0){
            c=i;
            b=j;
          }
        else if (c==0){
            c=i;
        }
        else if (b==0){
            b=j;
        }

        cout<<a <<" deh orts,"<< b << " deh davhar,"<< c << " deh haalga";
        return 0;
    }
}
