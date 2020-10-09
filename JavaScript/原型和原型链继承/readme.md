## 原型
1. JavaScript的所有对象中都包含了一个 _proto_ 的内部属性，这个属性所对应的就是该对象的原型
2. JavaScript的函数对象，除了原型 _proto_ 之外，还预置了 prototype 属性
3. 当函数对象作为构造函数创建实例时，该 prototype 属性值将被作为实例对象的原型 _proto_

## 原型链
1. 任何一个实例对象通过原型链可以找到它相应的原型对象，原型对象上面的实例和方法都是实例所共享的
2. 一个对象在查找一个方法或属性的时候，它会先到自己的对象上去找， 找不到时，它会沿着原型链向上查找

### 函数才有prototype 实例对象只有 _proto_  而函数有的 _proto_ 是因为函数是Function的实例对象

## instanceof原理
判断实例对象的proto属性与构造函数的prototype是不是用一个引用。如果不是，他会沿着对象的proto向上查找的，直到顶端Object。

## 判断对象是哪个类的直接实例
使用 对象.construcor 直接可判断

## 构造函数， new时发生了什么
```
    var obj = {}
    obj.__proto__ = Base.prototype;
    Base.call(obj);
```

## 类
```
// 普通写法
function Animal() {
  this.name = 'name'
}

// ES6
class Animal2 {
  constructor () {
    this.name = 'name';
  }
}
```

