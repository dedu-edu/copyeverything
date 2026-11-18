const prompt = require('prompt-sync')()
var isPrime = true
var givenNum = prompt("Дурын тоо оруулна уу: ")
for (var divider = 2; divider<=givenNum-1; divider++ ){
    if (givenNum % divider == 0){
        isPrime = false
        break
    }
}
if (isPrime){
    console.log("Анхны тоо")
} else {
    console.log("Нийлмэл тоо")
}