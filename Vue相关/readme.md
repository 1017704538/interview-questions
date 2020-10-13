# 1. v-bind 和 v-model的区别
1. v-bind用来绑定数据、属性以及表达式，缩写为 ':'
2. v-model使用在表单中，实现双向数据绑定，在表单元素外使用不起作用

# 2. Vue中的三要素是什么

## 2.1 响应式
```
    // 如何让实现响应式的呢？
    let obj = {};
    let name = 'zhangsan';
    Object.defineProperties(obj, name, {get : function() {
      console.log('name' , name)
    }, set : function() {
        console.log('name' , name)
    }})


    // 1. 关键是理解Object.defineProperty
    // 2. 将data的属性代理到vm上面的
    let mv = {};
        let data = {
            price: 100,
            name: '张三'
        };
        for (let key in data) {
            (function (key) {
                Object.defineProperty(mv, key, {
                    get: function () {
                        console.log('get val');
                        return data[key];
                    },
                    set: function (val) {
                        console.log('set val');
                        data[key] = val;
                    }
                })
            })(key);
        }
```
## 2.2 Vue中如何解析模板

### 2.2.1 模板是什么
```
    <div id="app">
        <div>
            <input v-model="title">
            <button v-on:click="add">submit</button>
        </div>
        <ul>
            <li v-for="item in list"></li>
        </ul>
    </div>

 // 1(*****). 模板实际上就是一个字符串………………(vue中的模板的本质)
 // 2. 模板有逻辑，如v-if, v-for
 // 3. 与html格式很像，但是有很大的区别
 // 4. 最终还是要转换为html来显示
 // 5(*****). 模板最终必须转换成JS代码，因为：
 //   （1）有逻辑(v-if v-for)：必须用JS才能实现（图灵完备）
 //    (2) 转换成HTML来渲染页面，必须用JS才能实现
 //    (3) 因此，模板最终要转换成为一个JS函数（render函数）
```

## 2.3 render函数
### 2.3.1 with的用法
```
var obj = {
    name: '张三',
    age: 20,
    getAddress(){
        alert('上海');
    }
}

// 不使用with
function fn() {
  alert(obj.name);
  alert(obj.age);
  obj.getAddress();
}

// 使用with(代码不易维护！！！)
function fn1() {
  with(obj){
      alert(name);
      alert(age);
      getAddress();
  }
}

fn();
fn1();
```
### 2.3.2 render函数的实现机制
```
<div id='app'>
    <p></p>
</div>

// 使用with限制这个作用域里面的this
with(this) {
    return _c(                          // this._c
        'div',
        {
            attrs: {"id" : "app"}       // id=app
        },
        [
            _c('p', [_v(_s(price))])    // this._c('p', [_v(_s(price))])
        ]
    )
}


// 实现一个自己的render函数
var vm = new Vue({
        el: '#app',
        data: {
            price: 100
        }
    });

    function render() {
        with (vm) {
            return _c(
                'div',
                {
                    attrs: {'id': 'app'}
                },
                [
                    _c('p', [_v(_s(price))])
                ]
            );
        }
    }

    function render() {
        return vm._c(
            'div',
            {
                attrs: {'id': 'app'}
            },
            [
                // vm._v 转换为一个文本节点
                // vm._s 转换为一个字符串
                // vm._c 转换为一个DOM节点
                vm._c('p', [vm._v(vm._s(price))])
            ]

        );
    }
```

### render函数与vdom
```
<div id="app">
        <div>
            <input type="text" v-model="title">
            <button @click="add">submit</button>
        </div>
        <div>
            <ul>
                <li v-for="item in list"></li>
            </ul>
        </div>
    </div>
```

```
with (this) {
    // this 就是vm
    return _c(
        'div',
        {attrs: {"id": "app"}},
        [
            _c('div',
                [
                    _c('input', {
                        directives: [{
                            name: "model",
                            rawName: "v-model",
                            value: (title),
                            expression: "title"
                        }],
                        attrs: {"type": "text"},
                        domProps: {"value": (title)},
                        on: {
                            "input": function ($event) {
                                if ($event.target.composing) return;
                                title = $event.target.value
                            }
                        }
                    }),
                    _v(" "),
                    _c('button',
                        {
                            on: {
                                "click": add
                            }
                        },
                        [_v("submit")]
                    )
                ]
            ),
            _v(" "),
            _c('div',
                [
                    _c(
                        'ul',
                        // 这里返回的是一个数组（li标签组成的数组）
                        _l((list), function (item) {
                            return _c('li', [_v(_s(item))])
                        }), 0
                    )
                ]
            )
        ]
    )
}

// view --->  data ---> 使用input的事件绑定 ---> 更新页面数据到data
// data --->  view ---> defineProperty --->  同步数据到页面
```

### 2.3.4 vm._c是什么，render函数返回了什么
1. vdom: 使用js模拟Dom结构
2. snabbdom: h函数和patch函数 Vue中的v_c：就是相当于snabbdom函数的h函数 patch函数：
```
 vm._update(vnode) {
     const prevNode = vm._vnode;
     vm._vnode = vnode;
     if (!prevNode) {
         // 首次渲染的时候
         vm.$el = vm.__patch__(vm.$el, vnode);
     }
     else{
         vm.$el = vm.__patch__(prevNode, vnode);
     }
 }

 // 开始更新vue组件（修改data的属性的时候，Object.defineProperty）
 function updateComponent() {
   vm._update(vm._render());
 }
```
> 总结
* vue模板: 字符串 有逻辑嵌入JS变量......
* 模板必须转化为JS代码(有逻辑的，渲染html，js变量)
* render函数是怎么样的
* render函数的执行结果是返回的vnode
* updateComponent

# 3. Vue的整个实现流程源码解读(总结)
## 3.1 解析模板成render函数
```
<template></template> ------>>>>> render函数
```

* with函数的使用
* 模板中的所有信息都被render函数所包含
* 模板中用到的data中的属性，都变成了JS变量
* 模板中的v-model v-for v-on 都变成了JS逻辑
* render 函数返回vnode

## 3.2 响应式开始监听数据
* Object.defineProperty
* 将data的属性代理到vm上

## 3.3 首次渲染， 显示页面， 绑定依赖
* 初次渲染， 执行updateCompontent，执行vm._render()
* 执行render函数, 会访问到vm.list 和 vm.title属性
* 会被响应式的get方法监听到(Object.defineProperty)
```
  Object.defineProperty(mv, key, {
      get: function() {
        return data[key];
      }
  })
```
* 执行updateCompontent 会执行vdom的patch方法
* patch 将vnode 渲染成DOM，首次渲染完成

## 3.4 为何要监听get，直接监听set不行吗？
>
* data中有很多属性，有些会被用到，有的可能不会用到/
* 被用到的会走get，不被用到的不会走get
* 未走到get中的属性，set的时候也无需关心
* **避免不必要的重复渲染(关键点)**
>

```
    vm._update(vnode) {
        const prevNode = vm._vnode;
        vm._vnode = vnode;
        if (!prevNode) {
            // 首次渲染的时候
            vm.$el = vm.__patch__(vm.$el, vnode);
        }
        else{
            vm.$el = vm.__patch__(prevNode, vnode);
        }
    }

    // 开始更新vue组件（修改data的属性的时候，Object.defineProperty）
    function updateComponent() {
      vm._update(vm._render());
    }
```

## 3.5 data属性变化，触发render函数
```
    Object.defineProperty(mv, key, {
        set: function(newVal) {
          data[key] = newVal;
          // 开始执行
          updateComponnet()
        }
    })
```
>
* 修改属性，被响应式的set监听到
* set中执行updateComponent
* updateComponent重新执行vm._render()
* 生成的vnode和preVnode，通过patch进行对比
* 渲染到html中去
>

# 4. 使用jquery和使用框架的区别
1. 数据和视图的分离(代码解耦) —— 开房封闭原则
2. 数据驱动视图，只关系数据变化，DOM操作被封装

# 5. 如何理解MVVM
1. MVC
2. MVVM
3. ViewModel

# 6. Vue中如何实现响应式
1. 响应式
2. 模板引擎
3. 渲染(首次渲染，之后的渲染)

>
* Object.defineProperty
* data的属性代理到vm上面（with）
>

# 7. Vue中是如何解析模板的
1. 模板的本质是字符串(有逻辑)
2. 模板必须要转化为JS代码
3. render函数的实现(返回的是一个vnode)
4. updateComponent(patch函数)

# 8. Vue的整体实现流程
1. 解析模板成为render的函数
2. 响应式开始监听数据
3. 首次渲染，显示页面，且绑定依赖
4. data属性数据发生变化，重新触发render函数

# 9. Vue的数据劫持以及操作数组
1. 给data添加新属性的时候vm.$set(vm.info, 'newKey', 'newValue')
2. data上面的属性值是数组的时候，需要用数组的方法操作数组，而不能通过index或者length属性去操作数组，因为监听不到属性操作的动作

# 10. 对MVVM和MVC的理解
1. mvc其实是model view Controller，所有的逻辑在Controller，难以维护。用户输入 => 控制器 => 数据改变，如果数据变了需要获取dom，
操作属性，再渲染到视图上。
2. mvvm其实是model view viewModel 数据变化驱动视图。数据变了，不需要你去获得dom然后改变dom的内容。这边数据变了，vm负责监听，
视图那边自动发生变化。最明显的不需要document.querySelector之类的操作了

# 11. vm的实质是什么
>
vm负责让数据变了，视图能自动发生变化。这么神奇魔术背后的原理是Object.defineProperty。其实就是属性的读取和设置操作都进行了监听，
当有这样的操作的时候，进行某种动作。来一个demo。
>

```
    // 对obj上面的属性进行读取和设置监听
    let obj = {
        name:'huahua',
        age:18
    }
    function observer(obj){
        if(typeof obj === 'object'){
            for (const key in obj) {
                defineReactive(obj,key,obj[key])
            }
        }
    }
    // get的return的值才是最终你读取到的值。所以设的值是为读取准备的。
    // set传的参数是设置的值，注意这里不要有obj.name = newVal 这样又触发set监听，会死循环的。
    function defineReactive(obj,key,value){
        Object.defineProperty(obj,key,{
            get:function(){
                console.log('你在读取')
                // happy的话这边可以value++，这样你发现读取的值始终比设置的大一个，因为return就是读取到的值
                return value
            },
            set:function(newVal){
                console.log('数据更新了')
                value = newVal
            }

        })
    }
    observer(obj)
    obj.age = 2
    console.log(obj.age)
```

# 12. defineReactive的实现(响应式手写实现)?
>
在浏览器执行的时候，控制台随手也可以obj.name = '张三' 类似的操作，可以发现都监听到了。但如果更深一步，
obj.name={firstname:'hua',lastname:'piaoliang'};obj.name.lastname='o'就不能监听到属性修改了。
因为并没有将新的赋值对象监听其属性。所以函数需要改进。
>

需要在defineReactive的第一行加上observer(value)。设置值的时候如果是对象的话，也需要将这个对象数据劫持。同理，set那边也需要加这行。

## 12.1 基础实现
```
function defineReactive(obj,key,value){
    // 注意这里！！！！！！！
     observer(value)
     Object.defineProperty(obj,key,{
         get:function(){
             return value
         },
         set:function(newVal){
             // 注意这里！！！！！！！
             observer(newVal)
             console.log('数据更新了')
             value = newVal
         }

     })
 }
```
## 12.2 数组方法的劫持
如果obj.name = [1, 2, 3]; obj.push(4) 发现又没有通知了，这是因为Object.defineProperty不支持监听数组变化。所以需要重写数组上面得方法。
```
// 把数组上大部分方法重写了，这里不一一列举。但是如果你 [1,2].length--，这是捕捉不到的
let arr = ['push', 'slice', 'split']
arr.forEach(method => {
    let oldPush = Array.property[method]
    Array.property[method] = function (value) {
        console.log('数据更新')
        oldPush.call(this, value)
    }
})
```

## 12.3 Vue双向绑定的原理是什么(常考)
>
vue.js 是采用**数据劫持**结合**发布者-订阅者**的方式，通过Object.defineProperty()来劫持各个属性的setter，getter，
在数据变动时发布消息给订阅者，触发相应的监听回调。
>

1. 第一步：需要observe的数据对象进行递归遍历，包括子属性对象的属性，都加上 setter 和 getter 这样的话，给这个对象的某个值赋值的时候，
就会触发setter，那么就能监听到数据变化
2. 第二步：compile 解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，
一旦数据有变化，收到通知，更新视图
3. 第三步：Watcher 订阅者 是 Observe 和 Compile 之间通信的桥梁，主要做的事情是：
* 在自身实例化时往属性订阅器里添加自己
* 自身必须有一个update()方法
* 待属性变动 dep.notice()通知时，能调用自身的 update() 方法，并触发 Compile 中绑定的回调，则功成身退。
4. 第四步：MVVM作为数据绑定的入口，整合Observe Compile 和 Watcher 三者，通过Observe来监听自己model数据的变化，
通过Compile来解析编译模板指令，最终利用Watcher搭起Observe和Compile之间的通信桥梁，达到 数据变化 -> 视图更新
视图交互变化(input) -> 数据model变更的双向绑定效果

# 13. Vue如何监听数组数据变化
## 13.1 vm.$set方法
因为是一开始就数据劫持了。所以后来如果新绑定属性，是没有数据劫持的。如果需要调用 vm.$set(vm.info,'newKey','newValue')，vm是vue的实例。

## 13.2 使用数组的方法
当属性值是数组，数组变化的时候，跟踪不到变化。因为数组虽然是对象，但是Object.defineProperty不支持数组，所以vue改写了数组的所有方法，当调用数组方法的时候，就调动变动事件。但是不能通过属性或者索引控制数组，比如length，index。
>
总结： data上，绑定所有属性避免后期加新属性。如果是数组，只能通过数组方法修改数组。如下例子，控制台vm.arr--发现视图并不会变化，vm.arr.push(4)就能变化
>

```
    <div id="app"></div>
        <script src="node_modules/vue/dist/vue.js"></script>
        <script>
        let vm = new Vue({
            el:'#app',
            // template加上之后会替换掉#app这个标签
            // template:'<h1>en</h1>',
            data:{msg:'msg',arr:[1,2,3]}
        })
        vm.msg = 'msg'
        </script>
```

# 14. Vue的缺点和优点
## 14.1 优点
1. 低耦合。视图(View)可独立于Model变化和修改，一个ViewModel 可以绑定到不同的**View**上，当View变化的时候 Model 可以不变，
当 Model 变化的时候 View 也可以不变
2. 可重用性。可以把一些视图逻辑放在一个ViewModel中，让很多 view 重用这段视图逻辑
3. 独立开发。开发人员可以专注于业务逻辑和数据开发(ViewModel)，设计人员可以专注于页面设计，使用Expression Blend可以很容易设计
页面并生成xml代码
4. 可测试。界面本来是比较难于测试的，而现在测试可以针对ViewModel来写。

## 14.2 缺点(常考)
1. 网站SEO问题
2. 浏览器兼容问题
3. 海量数据节点的渲染问题

# 15. 对Vue生命周期的理解
>
总共分为八个阶段，创建前/后，载入前/后，销毁前/后
>

1. 创建前/后：在**beforeCreate**阶段，vue实例的挂载元素 el 还没有，**created**  阶段
2. 载入前/后：在**beforeMount**阶段，vue实例的 $el 和 data 都初始化了，但还是挂载之前虚拟的DOM节点，
data.message 还未替换。在**mounted**阶段，vue实例挂载完成，data.message 成功渲染。
3. 更新前/后：当data变化时，会触发**beforeUpdate** 和 **updated** 方法。
4. 销毁前/后：在执行**destroy**方法后，对data 的改变不会再触发周期函数，说明此时 vue实例 已经解除了事件监听以及和dom的绑定，但是dom结构依然存在

# 16. Vue组件之间的传值
## 16.1 父组件与子组件之间的传值
```
//父组件通过标签上面定义传值
<template>
    <Main :obj="data"></Main>
</template>
<script>
    //引入子组件
    import Main form "./main"

    exprot default{
        name:"parent",
        data(){
            return {
                data:"我要向子组件传递数据"
            }
        },
        //初始化组件
        components:{
            Main
        }
    }
</script>


//子组件通过props方法接受数据
<template>
    <div></div>
</template>
<script>
    exprot default{
        name:"son",
        //接受父组件传值
        props:["data"]
    }
</script>
```

## 16.2 子组件向父组件传递数据
```
//子组件通过$emit方法传递参数
<template>
   <div v-on:click="events"></div>
</template>
<script>
    //引入子组件
    import Main form "./main"

    exprot default{
        methods:{
            events:function(){

            }
        }
    }
</script>


//

<template>
    <div></div>
</template>
<script>
    exprot default{
        name:"son",
        //接受父组件传值
        props:["data"]
    }
</script>
```

# 17. Vue路由相关问题

## 17.1 active-class 是哪个组件的属性
vue-router 模块的 router-link 组件

## 17.2 嵌套路由怎么定义
>
在实际项目中我们会碰到多层嵌套的组件组合而成，但是我们如何实现嵌套路由呢？因此我们需要在 VueRouter 的参数中使用 children 配置，这样就可以很好的实现路由嵌套。 index.html，只有一个路由出口
>

```
<div id="app">
    <!-- router-view 路由出口, 路由匹配到的组件将渲染在这里 -->
    <router-view></router-view>
</div>
```

main.js,路由的重定向，在页面一加载的时候，就会将home组件显示出来，因为重定向指向了home组件，redirect的指向与path的必须一致。
children里是子路由，当然子路由里还可以继续嵌套子路由
```
import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

//引入两个组件

import home from "./home.vue"
import game from "./game.vue"
//定义路由
const routes = [
    { path: "/", redirect: "/home" },//重定向,指向了home组件
    {
        path: "/home", component: home,
        children: [
            { path: "/home/game", component: game }
        ]
    }
]
//创建路由实例
const router = new VueRouter({routes})

new Vue({
    el: '#app',
    data: {
    },
    methods: {
    },
    router
})
```
 ## 17.3 路由之间的跳转
 * 声明式(标签跳转) <router-link :to = "index">
 * 编程式(js跳转) router.push('index')

 ## 17.4 路由的懒加载
 >
 webpack中提供了 require.ensure() 来实现按需加载。引入路由的方式由import改为const定义的方式引入
 > 

 ## 17.5 vue-router 有哪几种导航钩子
 1. 全局导航钩子
 2. 组件内导航钩子
 3. 单独路由独享组件

 # 18. Vuex 相关问题

 ## 18.1 vuex是什么 怎么使用 哪种场景使用
 >
 vue 框架中的状态管理。在main.js 引入 store，注入。新建一个目录store，export 。场景有：单页应用中，组件之间的状态。音乐播放、登录状态、加入购物车
 >

 ```
 // 新建 store.js
import vue from 'vue'
import vuex form 'vuex'
vue.use(vuex)
export default new vuex.store({
    //...code
})

//main.js
import store from './store'
...
 ```

 ## 18.2 vuex 有哪几种属性
 有 5 种，分别是 state、getter、mutation、action、module

 ## 18.3 vuex 的 store 特性是什么
 * vuex 就是一个仓库，仓库里放了很多对象。其中 state 就是数据源存放地，对应于一般 vue 对象里面的 data
 * state 里面 存放的数据是 响应式的，vue 组件 从 store 读取数据，若 store 中的数据发生改变，依赖这些数据的组件也会发生更新
 * 它通过 mapState 把全局的 state 和 getter 映射到当前组件的 computed 计算属性

 ## 18.4 vuex 的 getter 特性是什么
* getter 可以对 state 进行计算操作，它就是 store 的计算属性
* 虽然在组件内也可以做计算属性，但是 getters 可以在多给件之间复用
* 如果一个状态只在一个组件内使用，是可以不用 getters

## 18.5 vuex 的 mutation 特性是什么
* action 类似于 muation, 不同在于：action 提交的是 mutation,而不是直接变更状态
* action 可以包含任意异步操作

## 18.6  vue 中 ajax 请求代码应该写在组件的 methods 中还是 vuex 的 action 中
如果请求来的数据不是要被其他组件公用，仅仅在请求的组件内使用，就不需要放入 vuex 的 state 里
如果被其他地方复用，请将请求放入 action 里，方便复用，并包装成 promise 返回

## 18.7 不用 vuex 会带来什么问题

* 可维护性会下降，你要修改数据，你得维护 3 个地方
* 可读性下降，因为一个组件里的数据，你根本就看不出来是从哪里来的
* 增加耦合，大量的上传派发，会让耦合性大大的增加，本来 Vue 用 Component 就是为了减少耦合，现在这么用，和组件化的初衷相背

## 18.8 vuex 原理
vuex 仅仅是作为 vue 的一个插件而存在，不像 Redux,MobX 等库可以应用于所有框架，vuex 只能使用在 vue 上，很大的程度是因为其高度依赖于 vue 的 computed 依赖检测系统以及其插件系统，
vuex 整体思想诞生于 flux,可其的实现方式完完全全的使用了 vue 自身的响应式设计，依赖监听、依赖收集都属于 vue 对对象 Property set get 方法的代理劫持。最后一句话结束 vuex 工作原理，vuex 中的 store 本质就是没有 template 的隐藏着的 vue 组件。

## 18.9 扩展问题