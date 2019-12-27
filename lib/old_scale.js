// 默认配置
const default_conf = {
  // width: '',  // 不支持设置，取容器宽度
  height: 50, // 画布高度
  start: 1000, // 刻度开始值
  end: 10000, // 刻度结束值
  // def: 100, // 中心线停留位置 刻度值
  unit: 10, // 刻度间隔 'px'
  capacity: 100, // 刻度容量值
  background: '#fff', // 设置颜色则背景为对应颜色虚幻效果，不设置默认为透明色。
  midLineColor: '#087af7', // 中心线颜色
  scaleLineColor: '#999', // 刻度线颜色
  openUnitChange: true, // 是否开启间隔刻度变更
  sign: '@nowThen', // 签名，传入空不显示签名
  fontColor: '#68ca68', // 刻度数值颜色， 刻度线颜色暂未提供设置
  fontSize: '16px SimSun, Songti SC', // 刻度数值 字体样式
};
const dpr = window.devicePixelRatio; // 获取dpr

function Scale(container, options, callBack) {
  this._id = `scale-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  // canvas容器
  this._container = container;
  this._config = Object.assign(default_conf, options);
  this._callBack = callBack;

  this._canvas = document.createElement('canvas');
  this._ctx = this._canvas.getContext('2d');
  this._canvas._id = this._id;
  this._container.appendChild(this._canvas);

  this._canvas_bg = null;
  this._ctx_bg = null;

  this._point_x = 0; // 偏移量
  this._ifError = false;

  this.$_init();
}

Scale.prototype.constructor = Scale;

Scale.prototype.$_init = function (opt) {
  let {
    _config,
    _container,
    _canvas,
    _ctx
  } = this;
  this._ifError = false;
  if (opt) {
    _config = Object.assign(_config, opt);
  }
  _config.height = Number(_config.height);
  _config.start = Number(_config.start);
  _config.end = Number(_config.end);
  _config.unit = Number(_config.unit);
  _config.capacity = Number(_config.capacity);
  if (isNaN(_config.height)) {
    this._ifError = true;
    console.error('【scale】传入的「options:height」参数必须是有效数字');
  }
  if (isNaN(_config.start)) {
    this._ifError = true;
    console.error('【scale】传入的「options:start」参数必须是有效数字');
  }
  if (isNaN(_config.end)) {
    this._ifError = true;
    console.error('【scale】传入的「options:end」参数必须是有效数字');
  }
  if (isNaN(_config.unit)) {
    this._ifError = true;
    console.error('【scale】传入的「options:unit」参数必须是有效数字');
  }
  if (isNaN(_config.capacity)) {
    this._ifError = true;
    console.error('【scale】传入的「options:capacity」参数必须是有效数字');
  }
  if (_config.start > _config.end) {
    this._ifError = true;
    console.error('【scale】传入的「options:end」参数值不能小于「options:end」参数值');
  }

  // 设置中间线位置
  if (!_config.def) {
    _config.def = Math.floor(((_config.end - _config.start) / 2 + _config.start) / _config.capacity) * _config.capacity;
  } else if (_config.def < _config.start) {
    _config.def = _config.start - _config.capacity;
  } else if (_config.def > _config.end) {
    _config.def = _config.end + _config.capacity;
  }

  // 获取css的宽高
  const {
    width: cssWidth
  } = _container.getBoundingClientRect();

  // 设置容器宽高
  _config.width = Math.floor(cssWidth);
  _config.height = Math.floor(_config.height);
  // 根据dpr，设置canvas宽高
  _canvas.style.width = `${_config.width}px`;
  _canvas.style.height = `${_config.height}px`;
  _canvas.width = dpr * _config.width; // 确保canvas宽高为整数
  _canvas.height = dpr * _config.height;

  // 画布坐标根据 dpr 缩放 ，解决移动端模糊问题
  _ctx.scale(dpr, dpr);

  if (this._ifError) {
    _ctx.beginPath();
    _ctx.font = '12px Arial';
    _ctx.fillStyle = 'red';
    _ctx.textAlign = 'center';
    _ctx.fillText('传入参数有误，渲染异常...', _config.width / 2, _config.height / 2);
    _ctx.closePath();
    _ctx.fillStyle = 'transparent';
    return;
  }

  this.$_drawScale(); // 刻度尺
  this.$_drawSign(); // 设置签名及背景色
  this.$_drawMidLine(); // 中间线
  this.$_addEvent(); // 增加事件监听
}
// 绘制刻度尺
Scale.prototype.$_drawScale = function () {
  let { _config, _ctx } = this;
  // 创建新的刻度画布 作为底层图片
  const _canvas_bg = this._canvas_bg = document.createElement('canvas');
  const _ctx_bg = this._ctx_bg = _canvas_bg.getContext('2d');

  const mid = _config.end - _config.start + 1; // 取值范围

  const scale_len = Math.ceil(mid / _config.capacity); // 刻度条数
  const space = Math.floor(_config.width / 2); // 左右两边间隙，根据该值计算整数倍刻度值画线
  const beginNum = Math.ceil(_config.start / _config.capacity) * _config.capacity;
  const st = (Math.ceil(_config.start / _config.capacity) - _config.start / _config.capacity) * _config.unit;

  // 设置canvas_bg宽高
  _canvas_bg.width = (_config.unit * (scale_len - 1) + _config.width + st) * dpr;
  _canvas_bg.height = _config.height * dpr;
  _ctx_bg.scale(dpr, dpr);

  _ctx_bg.beginPath();
  _ctx_bg.fillStyle = _config.background || 'transparent'; // 背景色
  _ctx_bg.fillRect(0, 0, _canvas_bg.width, _config.height);
  _ctx_bg.closePath();
  // 底线
  _ctx_bg.beginPath();
  _ctx_bg.moveTo(0, _config.height);
  _ctx_bg.lineTo(_canvas_bg.width, _config.height);
  _ctx_bg.strokeStyle = _config.scaleLineColor || '#9E9E9E';
  _ctx_bg.lineWidth = 1;
  _ctx_bg.stroke();
  _ctx_bg.closePath();

  // 绘制刻度线
  for (let i = 0; i < scale_len; i++) {
    _ctx_bg.beginPath();
    _ctx_bg.strokeStyle = _config.scaleLineColor || '#9E9E9E';
    _ctx_bg.font = _config.fontSize;
    _ctx_bg.fillStyle = _config.fontColor;
    _ctx_bg.textAlign = 'center';
    _ctx_bg.shadowBlur = 0;

    const curPoint = i * _config.unit + space + st;
    // console.log(beginNum, st, curPoint);

    const curNum = i * _config.capacity + beginNum;
    if (curNum % (_config.capacity * 10) === 0) {
      _ctx_bg.moveTo(curPoint, (_config.height * 1) / 2);
      _ctx_bg.strokeStyle = _config.scaleLineColor || '#666';
      _ctx_bg.shadowColor = '#9e9e9e';
      _ctx_bg.shadowBlur = 1;
      _ctx_bg.fillText(
        curNum,
        curPoint,
        (_config.height * 1) / 3
      );
    } else if (curNum % (_config.capacity * 5) === 0) {
      _ctx_bg.moveTo(curPoint, (_config.height * 2) / 3);
      _ctx_bg.strokeStyle = _config.scaleLineColor || '#888';
      if (scale_len <= 10) {
        _ctx_bg.font = '12px Helvetica, Tahoma, Arial';
        _ctx_bg.fillText(
          curNum,
          curPoint,
          (_config.height * 1) / 2
        );
      }
    } else {
      _ctx_bg.moveTo(curPoint, (_config.height * 4) / 5);
      if (i === 0 || i === scale_len - 1) {
        _ctx_bg.font = '12px Helvetica, Tahoma, Arial';
        _ctx_bg.fillText(
          curNum,
          curPoint,
          (_config.height * 2) / 3
        );
      }
    }

    _ctx_bg.lineTo(curPoint, _config.height);
    _ctx_bg.stroke();
    _ctx_bg.closePath();
  }

  this._point_x = (_config.def - _config.start) / _config.capacity * _config.unit; // 初始化开始位置
  const imageData = _ctx_bg.getImageData(this._point_x * dpr, 0, _config.width * dpr, _config.height * dpr)
  _ctx.putImageData(imageData, 0, 0);
}

// 绘制中心线
Scale.prototype.$_drawMidLine = function () {
  const {
    _config,
    _ctx
  } = this;

  const mid_x = Math.floor(_config.width / 2);
  _ctx.beginPath();
  _ctx.fillStyle = _config.midLineColor || '#087af7';
  _ctx.fillRect(mid_x - 1, 0, 2, _config.height);
  _ctx.stroke();
  _ctx.moveTo(mid_x, 8);
  _ctx.lineTo(mid_x - 5, 2);
  _ctx.lineTo(mid_x - 5, 0);
  _ctx.lineTo(mid_x + 5, 0);
  _ctx.lineTo(mid_x + 5, 2);
  _ctx.fill();
  _ctx.moveTo(mid_x, _config.height - 8);
  _ctx.lineTo(mid_x - 5, _config.height - 2);
  _ctx.lineTo(mid_x - 5, _config.height);
  _ctx.lineTo(mid_x + 5, _config.height);
  _ctx.lineTo(mid_x + 5, _config.height - 2);
  _ctx.fill();
  _ctx.closePath();
}

// 设置签名及背景
Scale.prototype.$_drawSign = function () {
  const {
    _ctx,
    _config
  } = this;
  // 背景
  if (_config.background) {
    _ctx.beginPath();
    const gradient1 = _ctx.createLinearGradient(0, 0, _config.width, 0);
    gradient1.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    gradient1.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
    gradient1.addColorStop(0.55, 'rgba(255, 255, 255, 0)');
    gradient1.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
    _ctx.fillStyle = gradient1;
    _ctx.fillRect(0, 0, _config.width, _config.height);
    _ctx.closePath();
  }

  // 签名
  if (_config.sign) {
    _ctx.beginPath();
    _ctx.font = '10px Arial';
    const gradient = _ctx.createLinearGradient(_config.width, 0, _config.width - 50, 0);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 128, 0, 0.3)');
    _ctx.fillStyle = gradient;
    _ctx.textAlign = 'right';
    _ctx.fillText(_config.sign, _config.width - 10, 10);
    _ctx.closePath();
    _ctx.fillStyle = 'transparent';
  }
}

// 事件交互
Scale.prototype.$_addEvent = function () {
  const {
    _canvas,
    _config,
    _canvas_bg,
    $_moveDraw
  } = this;
  let begin_x = 0; // 手指x坐标
  let ifMove = false; // 是否开始交互
  let moveDistance = 0;

  const start = (e) => {
    e.stopPropagation();
    e.preventDefault();
    ifMove = true;
    if (!e.touches) {
      begin_x = e.clientX;
    } else {
      begin_x = e.touches[0].clientX;
    }
  }

  const move = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const current_x = e.touches ? e.touches[0].clientX : e.clientX;
    if (ifMove) {
      moveDistance = current_x - begin_x;
      begin_x = current_x;
      this._point_x = this._point_x - moveDistance; // 刻度偏移量
      // console.log(this._point_x, _canvas_bg.width / dpr - _config.width);
      // 边界值处理
      if (this._point_x <= 0) {
        this._point_x = 0;
      } else if (this._point_x >= _canvas_bg.width / dpr - _config.width) {
        this._point_x = _canvas_bg.width / dpr - _config.width;
      }

      window.requestAnimationFrame($_moveDraw.bind(this))
    }
  }

  const end = (e) => {
    ifMove = false;
  }
  // 注册事件，移动端和PC端
  const hasTouch = 'ontouchstart' in window;
  const startEvent = hasTouch ? 'touchstart' : 'mousedown';
  const moveEvent = hasTouch ? 'touchmove' : 'mousemove';
  const endEvent = hasTouch ? 'touchend' : 'mouseup';
  _canvas.addEventListener(startEvent, start);
  _canvas.addEventListener(moveEvent, move);
  _canvas.addEventListener(endEvent, end);
}

Scale.prototype.$_moveDraw = function () {
  const {
    _ctx,
    _ctx_bg,
    _config
  } = this;
  let now_x = this._point_x;
  // 是否刻度移动
  if (_config.openUnitChange) {
    const st = (_config.start / _config.capacity - Math.floor(_config.start / _config.capacity)) * _config.unit;
    now_x = Math.round(this._point_x / _config.unit) * _config.unit - st;
  }
  _ctx.clearRect(0, 0, _config.width, _config.height);
  var imageData = _ctx_bg.getImageData(now_x * dpr, 0, _config.width * dpr, _config.height * dpr)
  _ctx.putImageData(imageData, 0, 0)
  this.$_drawMidLine();
  this.$_drawSign();
  const value = now_x * _config.capacity / _config.unit + _config.start;
  if (typeof this._callBack === 'function') {
    this._callBack(Math.round(value));
  }
}

Scale.prototype.update = function (value) {
  this._point_x = (value - this._config.start) / this._config.capacity * this._config.unit; // 初始化开始位置
  this.$_moveDraw();
}
Scale.prototype.resize = function (opt) {
  // this.clear();
  this.$_init(opt);
}
Scale.prototype.clear = function (value) {
  if (this._container && this._canvas) {
    this._container.removeChild(this._canvas);
    this._container = null;
    this._canvas = null;
  }
}

// 初始化
function init(el, options, callBack) {
  const container = document.querySelector(el);
  if (!container) {
    throw new Error('【scale】传入的「el」参数必须是有效的HTML容器节点！')
  }
  if (typeof callBack !== 'function') {
    console.warn('【scale】传入的「callBack」参数不是有效的回调函数！')
  }

  const scale = new Scale(container, options, callBack);

  scale.$_init();

  return scale;
}

export default {
  init
}
