require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const mqtt = require('mqtt');

const url = process.env.MQTT_URL || 'mqtt://localhost:1883';
const topic = process.env.TOPIC || 'iot/demo/temperature';
const port = process.env.PORT || 3000;

// ---------- Web 服务：托管 public/ 页面 + Socket.IO ----------
const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server);

// 内存保留最新一条消息，新页面连上时先补发，避免空屏等待
let latest = null;

io.on('connection', (socket) => {
  console.log('[SERVER] Browser connected:', socket.id);
  if (latest) {
    socket.emit('snapshot', latest);
  }
  socket.on('disconnect', () => {
    console.log('[SERVER] Browser disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`[SERVER] Visualization page: http://localhost:${port}`);
});

// ---------- MQTT 客户端：订阅传感器数据并推送给浏览器 ----------
const client = mqtt.connect(url, {
  username: process.env.MQTT_USERNAME || undefined,
  password: process.env.MQTT_PASSWORD || undefined,
  reconnectPeriod: 1000, // 断线重连
});

client.on('connect', () => {
  console.log('[SERVER] MQTT connected:', url);
  client.subscribe(topic, { qos: 0 }, (err) => {
    if (err) {
      console.error('[SERVER] Subscribe error:', err);
    } else {
      console.log('[SERVER] Subscribed to:', topic);
    }
  });
});

client.on('message', (t, payload) => {
  try {
    const data = JSON.parse(payload.toString());
    latest = data;
    io.emit('sensor', data);
  } catch (e) {
    // 非法 JSON 只告警，不中断服务
    console.warn('[SERVER] Invalid JSON payload:', payload.toString());
  }
});

client.on('error', (err) => {
  console.error('[SERVER] MQTT Error:', err.message);
});
