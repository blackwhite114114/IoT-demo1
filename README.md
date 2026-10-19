# iot-demo

物联网设计与创新课程实践项目。

## 功能说明

模拟传感器设备（`publisher.js`）每 2 秒通过 MQTT 上报温湿度数据，Node.js 服务端（`server.js`）订阅该数据并经 Socket.IO 实时推送到浏览器，页面用 ECharts 绘制温湿度实时曲线。

### 数据链路

```
publisher.js(模拟设备) ──MQTT(TCP 1883)──> mosquitto <──MQTT── server.js ──Socket.IO(3000)──> 浏览器
```

### 消息格式

主题：`iot/demo/temperature`（见 `.env` 中 `TOPIC`）

```json
{ "deviceId": "sensor-001", "ts": 1700000000000, "temperature": "22.35", "humidity": "45.80" }
```

## 运行方式

前置条件：本机 mosquitto 服务运行中（监听 127.0.0.1:1883）。

```powershell
npm install      # 安装依赖（首次）
npm run pub      # 终端 A：启动模拟设备，开始上报数据
npm start        # 终端 B：启动可视化服务
```

浏览器访问 <http://localhost:3000>，即可看到实时温湿度曲线。

## 验证记录

- 2026-09-27：`npm run pub` + `npm start` 启动后，页面连接状态变绿，约 2 秒一跳更新卡片与曲线；用 `mosquitto_pub` 向主题注入测试消息，页面即时出现数据尖峰，端到端链路验证通过。

## 备注

- 页面图表库 ECharts 通过 jsdelivr CDN 引入；若课堂网络无法访问 CDN，可下载 `echarts.min.js` 放到 `public/vendor/`，并把 `public/index.html` 中的 CDN 地址改为 `/vendor/echarts.min.js`。
- 修改主题：编辑 `.env` 的 `TOPIC` 后重启服务；页面也可用 `http://localhost:3000/?topic=<主题名>` 临时指定。
- mosquitto 当前仅监听回环地址，如需局域网设备（如 ESP32）接入，需在 `mosquitto.conf` 中配置 `listener 1883 0.0.0.0` 并重启服务。