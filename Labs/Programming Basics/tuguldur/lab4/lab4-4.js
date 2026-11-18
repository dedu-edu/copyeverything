const prompt = require('prompt-sync')()
var arr = [], count = 0, prev_count = 0, most_repeated
var size_of_array = prompt("Массив-ийн хэмжээг оруулна уу: ")
for (var i = 0; i < size_of_array; i++){
    var number = prompt("Тоо оруулна уу: ")
    arr.push(number)
}
for (var i = 0; i < size_of_array; i++){
    var count = 0
    for (var j = i; j < size_of_array; j++){
        if (arr[i] == arr[j]){
            count++
        }
    }
    if (count > prev_count) {
        prev_count = count
        most_repeated = arr[i]
    }
}
console.log(`Хамгийн их давтагдсан тоо: ${most_repeated}`)