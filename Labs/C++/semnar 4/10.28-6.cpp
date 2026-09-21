#include <iostream>
#include <string>
using namespace std;
int main() {
    int n,m,count=0;
    cin >> n;
    int arr[n]{};
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    cin >> m;
    for (int i = 0; i < n; i++) {
        if (arr[i]==m) {
            cout << "yes";
            break;
        }
    }
    if (count == 0){
      cout << "no";
    }
    return 0;
}