    // 对obj上面的属性进行读取和设置监听
    let obj = {
        name: 'huahua',
        age: 18
    }

    function observer(obj) {
        if (typeof obj === 'object') {
            for (const key in obj) {
                defineReactive(obj, key, obj[key])
            }
        }
    }
    // get的return的值才是最终你读取到的值。所以设的值是为读取准备的。
    // set传的参数是设置的值，注意这里不要有obj.name = newVal 这样又触发set监听，会死循环的。
    function defineReactive(obj, key, value) {
        Object.defineProperty(obj, key, {
            get: function () {
                console.log('你在读取')
                // happy的话这边可以value++，这样你发现读取的值始终比设置的大一个，因为return就是读取到的值
                return value
            },
            set: function (newVal) {
                console.log('数据更新了')
                value = newVal
            }

        })
    }
    observer(obj)
    obj.age = 2
    console.log(obj.age)