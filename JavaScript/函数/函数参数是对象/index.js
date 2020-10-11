function test(person) {
    person.age = 21
    person = {
        name: '李四',
        age: 30
    }

    return person
}

const p1 = {
    name: '张三',
    age: 25
}

const p2 = test(p1)

console.log(p1) //{ name: '张三', age: 21 }
console.log(p2) //{ name: 'yuki', age: 30 }