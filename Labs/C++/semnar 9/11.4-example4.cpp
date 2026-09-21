#include <iostream>
#include <string>
using namespace std;
void country(string cnt = "Sweden") {
    cout << cnt << endl;
}
int main() {
    string a;
    getline(cin, a);
    country(a);
    country();
    return 0;
}