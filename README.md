换一种维度组织api
从功能模块组织

最常用的api

页面渲染
右键菜单
从headnav开始
left
page board
right
console board

新建 另存为 重命名 刷新 
打开 关闭 全部关闭 关闭其他
头切换 page切换
文件名过滤 捡入状态过滤
编辑 保存 复制 粘贴
捡入检出撤销
删除 查找 搜索
快捷键监听
ide状态保存和恢复
page同步状态

treeview  rttree
file dblclick openPage
click selected
create file
contextmenu

selectTree
openPage
rightmenu
active


：
1.声明state树，一般为
2.声明一组action对象，描述状态更新请求，action.type表执行动作，其他属性表请求数据；
2.编写一组reducer纯函数，入参old state和action，根据action.type执行状态变换逻辑，不直接修改old state，而是新建并返回new state；
3.关联reducers，合成一个hash map，即rootReducer；
4.调用createStore(rootReducer)返回store；
5.更新状态时，store.dispatch(action)；
6.获取状态时，store.getState()。
dispatch Redux会分发action和old state至所有reducer，每个reducer返回new state。

高级用法：
在dispatch前加入middleware，帮助action扩展获得更大灵活性
redux充分利用了纯函数特性和高阶函数扩展

纯函数特性
不修改任何外部状态
性质：
两次结果必定一致
状态可预测
这带来巨大灵活性
1.root reducer随root state拆分，子reducer进一步拆分合并自由组合，只要保持参数一致，可任意粒度复用，模块化组合；
2.reducers执行顺序无需一致，结果也一致，流程解耦；组合时木有顾虑
3.结果可缓存，因为不会有副作用，相同参数必定导致相同结果
4.测试，可预测，状态异常可控，状态一旦异常，不会传播造成不可预知的bug

闭包和高阶函数的用途
函数可接受函数参数，返回新函数
oo领域的类扩展、对象扩展、aop等无法相提并论
保持函数参数一致
redux中的应用主要有：
reducer enhancer 接受reducer，生成reducer
dispatch enhancer
接受action，生产action
store enhancer
接受createStore，生成createStore

对范式的改变
专注于数据结构
因为没有了类结构和对象结构
状态更新时，一步到位，而不是分层处理



