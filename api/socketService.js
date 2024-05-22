// // 创建WebSocket连接
// const socket = uni.connectSocket({
//   url: 'ws://localhost:4666', // 你的WebSocket服务器地址
//   header: {
//     'content-type': 'application/json'
//   },
//   protocols: ['protocol1'], // 子协议数组，如果服务器不需要验证子协议，可以不填
//   success: () => console.log("连接成功"),
//   fail: () => console.error("连接失败"),
// });

// // 监听WebSocket连接打开事件
// uni.onSocketOpen(function() {
//   console.log('WebSocket连接已打开！');
//   // 发送消息
//   uni.sendSocketMessage({
//     data: 'hello server'
//   });
// });

// // 监听WebSocket接收到服务器的消息事件
// uni.onSocketMessage(function(message) {
//   console.log('收到服务器内容：' + message.data);
// });

// // 监听WebSocket错误
// uni.onSocketError(function(error) {
//   console.error('WebSocket连接打开失败，请检查！', error);
// });

// // 监听WebSocket连接关闭事件
// uni.onSocketClose(function() {
//   console.log('WebSocket 已关闭！');
// });

// export {socket};

// src/api/socketService.js
// websocketService.js
const socket = uni.connectSocket({
  url: 'ws://localhost:4666', // 你的WebSocket服务器地址
  header: {
    'content-type': 'application/json'
  },
  protocols: ['protocol1'], // 子协议数组，如果服务器不需要验证子协议，可以不填
  success: () => console.log("连接成功"),
  fail: () => console.error("连接失败"),
});

//   // 发送消息
//   sendMessage(message) {
//     if (socket) {
//       uni.sendSocketMessage({
//         data: JSON.stringify(message),
//       });
//     }
//   },

//   // 监听接收到的消息
//   onMessage(callback) {
//     uni.onSocketMessage((res) => {
//       const data = JSON.parse(res.data);
//       callback(data);
//     });
//   },

//   // 关闭WebSocket连接
//   close() {
//     if (socket) {
//       uni.closeSocket();
//       socket = null;
//     }
//   },
// };
export {socket};
