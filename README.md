# canvas-scale
采用Canvas绘制的一个可配置的刻度(尺)组件。
主要常用于移动端数值、金额等的滑动选择，增强用户交互体验。
刻度组件 demo，效果图：


![效果图.gif](./public/demo2.gif)

## 链接
采用Canvas绘制一个可配置的刻度(尺)组件：[https://www.yuque.com/nowthen/longroad/dv2705](https://www.yuque.com/nowthen/longroad/dv2705);

github地址：[https://github.com/now1then/canvas-scale](https://github.com/now1then/canvas-scale)

演示地址：[https://rnlvwyx.cn:3333/#/demo](https://rnlvwyx.cn:3333/#/demo)

## 说明
本刻度组件支持的功能：

* 采用canvas绘制组件，解决移动端绘制模糊问题，
* 支持刻度尺基本参数配置传入，
* 监听滑动事件，滑动时实时输出刻度值，同时支持根据外部值动态设置刻度，
* 支持平滑/缓动滑动、实时绘制刻度，
* 兼容移动端/pc端滑动，

支持的传入的可配置项参数：

```javascript
// 默认配置
const default_conf = {
  // width: '',  // 不支持设置，取容器宽度
  height: 50, // 画布高度
  start: 1000, // 刻度开始值
  end: 10000, // 刻度结束值
  // def: 100, // 中心线停留位置 刻度值
  unit: 10, // 刻度间隔 'px'
  capacity: 100, // 刻度容量值
  background: '#fff', // 设置颜色则背景为对应颜色虚幻效果，不设置默认为全白。
  lineColor: '#087af7', // 中心线颜色
  openUnitChange: true, // 是否开启间隔刻度变更
  sign: '@nowThen', // 签名，传入空不显示签名
  fontColor: '#68ca68', // 刻度数值颜色， 刻度线颜色暂未提供设置
  fontSize: '16px SimSun, Songti SC', // 刻度数值 字体样式
};
```
比如，是否开启间隔刻度变更 配置：

![刻度移动.gif](/public/刻度移动.gif)

![非刻度移动.gif](/public/非刻度移动.gif)

## 使用
项目中引入npm包

```
npm install canvas-scale
```

scale模块对外暴露一个init()初始化方法：`scale.init()` 

- 第一个参数为可通过`document.querySelector()`获取到的HTML节点；
- 第二个参数为需要重置的配置项；
- 第三个参数传入刻度变更时的回调函数，可通过该回调函数获取最新刻度值；
- 返回一个实例对象，对外暴露一些操作方法。

```javascript
/**
 * scale 刻度函数
 * @param {String} el  html节点
 * @param {Object} options  配置信息
 * @param {Function} callBack 刻度变更回调函数
 * @returns { Object}
 */
// 绘制刻度尺
import newScale from 'canvas-scale';

const myScale = scale.init('#myScale', {height: 50, start: 10000, end: 2000}，callBack);
function callBack(value) {
  console.log(value);
}
```

###### 目前返回的实例对象暴露的方法有：

- `update(value)`：传入最新的刻度值，更新画布显示。`value:最新刻度值`
- `clear()`：清除当前画布。
- `resize(option)`：重置画布，可传入最新需要重置的配置信息。` option:刻度配置`

```javascript
myScale.update(1000); // 更新刻度值
myScale.clear();  // 清除画布
myScale.resize(); // 重置刻度画布
```

![demo](/public/demo.png)

### 具体使用介绍请参考：
采用Canvas绘制一个可配置的刻度(尺)组件：[https://www.yuque.com/nowthen/longroad/dv2705](https://www.yuque.com/nowthen/longroad/dv2705);

