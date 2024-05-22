<template>
	 <!-- top nav -->
	<view class="status-bar">
	    <view class="login-c" @click="navBack">
	        <image src="/static/chat/back.png" class="login-back"></image> 
	    </view>
		<scroll-view scroll-x="true" class="scrollv">
						<view class="users">							
						<view v-for="(e,index) in userData" class="user-l" @tap="otoChat(index)" :key="index">
							<!-- 如果是自己就不显示了 -->
								<view v-if="e.user_id!=userid">
									<!-- 消息提示 -->
									<view class="tip" v-if="e.tip"></view>
								  <image :src="e.avatarUrl"></image>
		            <!-- </view> -->
							</view>
						</view>
						</view>
					</scroll-view>
	</view>
	<view class="main">
				<view v-for="(e,index) in messageData" :key="index">
						<view class="left msg" v-if="e.userid !=userid">
							<image :src="userMap.get(e.userid).avatarUrl"></image>
							<view class="nr">
								<view class="user-nickname">
									{{userMap.get(e.userid).nickname}}
								</view>
								<view class="neir">
									{{e.message}}
								</view>
								<view class="nt">{{timeDetia(e.time)}}</view>
							</view>
						</view>
						<view class="right msg" v-if="e.userid==userid">							
							<image :src="userMap.get(e.userid).avatarUrl"></image>
							<view class="nr">
								<view class="neir">
									{{e.message}}
								</view>
								<view class="nt">{{timeDetia(e.time)}}</view>
							</view>					
						</view>
				</view>	
				<!-- 空白区域 -->
				<view style="height: 65px;"></view> <!-- 调整这里的高度值 -->
	</view>
		<view class="send">
				<textarea type="text" confirm-type="send" class="chat-send"  v-model="userMessage" auto-height="true" show-confirm-bar="false" maxlength="-1" />
				<image src="/static/chat/fasong.png" mode="aspectFit" @tap="sendMessage"></image>
			</view>
	<!-- 弹出一对一消息 -->
			<view class="modify" :animation="animationData">
				<view class="u-name">
					{{uname}}
				</view>
				<scroll-view class="modfiy-mian" scroll-y="true" :scroll-top="scrollTopValue">
					<view v-for="(e,index) in otochats[privateChat]" :key="index" >
						<view class="left msg" v-if="e.receiverId === userid" >
							<image :src="userMap.get(e.userid).avatarUrl"></image>
							<view class="nr">
								<view class="neir">
									{{e.message}}
								</view>
								<view class="nt">{{timeDetia(e.time)}}</view>
							</view>
						</view>
						<view class="right msg" v-if="e.receiverId != userid">
							<image :src="userMap.get(e.userid).avatarUrl"></image>
							<view class="nr">
								<view class="neir">
									{{e.message}}
								</view>
								<view class="nt" >{{timeDetia(e.time)}}</view>
							</view>					
						</view>
					</view>	
				</scroll-view>
			</view>
			<view class="bg" @tap="outotoChat" :style="{display:bg}"></view>
			

</template>


<script setup>
    import {ref,reactive} from 'vue'
    import {onLoad,onShow,onHide} from '@dcloudio/uni-app'
    import {requestApi} from '@/api/request.js'
    let avatar = ''//用户头像
    let message = ''//消息
    let messagetype = '' //跟踪谁发的
    let nickname = '' //用户昵称
    let userid = '' //用户id
	let authorId = ''
	let activityId = ''
	const uname = ref('')
	const receiverId = ref('') // 当前聊天对象的ID
	const otochat = ref([]) // 单独的聊天记录
    const messageData = ref([]) // 假设这是你存储消息的响应式变量
	const userData = ref({})   //群组用户数据
	const showOtoModal = ref(false)
	const bb = ref(false)
	const bg = ref('none'); // 初始化为 'none' 来确保背景层默认不显示
	const animationData = ref(null);
	const otochats = reactive({}); // 存储不同私聊会话的聊天记录
	//展现哪个私人聊天
	const privateChat = ref('')
	//自动滑倒最低端(注意，后需要每次都新增才能察觉到变化)
	const scrollTopValue = ref(99999)
	// 创建映射表
	let userMap = new Map()
	const userMessage = ref('') //输入框
	let socket = null; // 在组件的作用域内定义一个变量来持有socket连接
	onLoad(async(e)=>{
		activityId = e.activityId;
		userInfo()
		try {
		  const res = await requestApi('/chatMember', {id: activityId});
				userData.value = res.data
				console.log(JSON.stringify(userData.value))
		} catch (error) {
		  console.error("请求失败:", error);
		}
		
		userData.value.forEach(user => {
		  userMap.set(user.user_id, { avatarUrl: user.avatarUrl, nickname: user.nickname });
		  if(userid != user.user_id){
			  const privateChatKey = [userid, user.user_id].sort().join('_');
			  otochats[privateChatKey] = [];
		  }
		});
		})
		
		//注意，Map不能直接console.log查看，那样查看会是{}
		// console.log(Array.from(userMap.entries())); // 将Map转换成数组并输出
    
    onShow(async() => {
      // 检查是否已存在连接
      if (socket !== null) {
        console.log("WebSocket连接已存在。");
        return;
      }
      // 创建新的WebSocket连接
      socket = uni.connectSocket({
        url: 'ws://119.28.202.161:4666', // WebSocket服务器地址
        header: {
          'content-type': 'application/json'
        },
        protocols: ['protocol1'], // 可选：子协议数组
        success: () => {
			console.log("连接成功");
			},
        fail: () => {
          console.error("连接失败");
          // 这里可以添加更复杂的错误处理逻辑，比如重试
          socket = null; // 确保失败后重置socket变量，允许重试连接
        },
      });
	  uni.onSocketOpen(()=>{
		  uni.sendSocketMessage({
		  	  data: JSON.stringify(userid), // 将消息对象转换为字符串格式
		  	  success: () => {
		  	    console.log("初始化消息发送");},
		  		fail:()=> {console.log("初始化信息失败")}
		  })
	  });
      // 监听WebSocket关闭
      uni.onSocketClose(() => {
        socket = null; // 当连接关闭时重置socket变量
      });

	  //获取群组
	  const response =  await requestApi('/getGroupMessage',{groupId:activityId,userId:userid})
	  const messageGroup = response.data
	  if (messageGroup && messageGroup.length > 0) {
	      messageData.value = messageGroup.map(msg => {
	        return {
	          message: msg.content, // 假设每条消息的内容是在content字段
	          userid: msg.senderId, // 假设发送者的ID在senderId字段
	          receiverId: '', // 假设接收者的ID在receiverId字段
	          activityId: activityId,
	          time: msg.createdAt, // 假设消息时间戳在timestamp字段
	        };
	      });
	  }
	  } 
	);
    // 监听WebSocket接收到服务器消息的事件
    uni.onSocketMessage((res) => {
      try {
        const data = JSON.parse(res.data); // 将字符串转为对象
        console.log("接收到的消息是"+res.data);
        //表示是群组对象的消息
        if(data.receiverId === '' && data.activityId === activityId) {
          messageData.value.push(data);
		  uni.pageScrollTo({ scrollTop: 0, duration: 300 });
        }
        //私发消息
        else if (data.activityId === activityId) {
          const receivedId = data.receiverId; // 将这行移到适当的位置
          // 检测接收到的消息是否为当前用户的私聊消息
          if(receivedId === userid) {
            // 构造一个私聊的唯一键
            const privateChatKey = [userid, receiverId.value].sort().join('_'); // 将数组转换成字符串，作为映射的键
            // 确保该键已经存在
            if (!otochats[privateChatKey]) {
              otochats[privateChatKey] = [];
            }
            otochats[privateChatKey].push(data);
			scrollTopValue.value += 100; // 再次更新以触发滚动
          }
    
          // 如果接收方是我，但当前聊天对象不是发送者
          if (receivedId === userid && receiverId.value !== data.senderId) {
            // 更新用户列表，标记有未读消息
            const index = userData.value.findIndex(user => user.user_id === data.userid);
            if (index !== -1) {
              const user = userData.value[index];
              const updatedUser = { ...user, tip: true };
              userData.value.splice(index, 1, updatedUser); 
            }
          }
        }
      } catch (error) {
        console.error('接收消息处理出错', error);
      }
    });

    		// 监听WebSocket错误
    uni.onSocketError(function(error) {
    		    console.error('WebSocket连接打开失败，请检查！', error);
    		});
		
	async function otoChat(e) {
			 uname.value = userData.value[e].nickname;
			 receiverId.value = userData.value[e].user_id;
			 const privateChatKey = [userid, receiverId.value].sort().join('_'); // 将数组转换成字符串，作为映射的键
			privateChat.value = privateChatKey;
				 // 如果没有，请求历史私聊记录并创建
				 try {
					 const res = await requestApi('/getPrivateMessage', { senderId: userid, receiveId: receiverId.value });
					 if (res && res.data) {
						 const privateMessage = res.data;
						 if (privateMessage && privateMessage.length > 0) {
							 otochats[privateChatKey] = privateMessage.map(msg => {
								 // 确定消息接收者ID
								 const messageReceiverId = msg.senderId === userid ? receiverId.value : userid;
								 return {
									 message: msg.content,
									 userid: msg.senderId,
									 receiverId: messageReceiverId,
									 activityId: activityId,
									 time: msg.createdAt,
								 };
							 });
						 }
					 }
				 } catch (error) {
					 console.error('Fetching private messages failed:', error);
				 }
			 userData.value[e].tip = false;
			 showOtoModal.value = true;
			modify();
			}
	//退出一对一聊天value
	function outotoChat(){
			uname.value = '';
			receiverId.value = ''; //我正在聊天的对象
	        showOtoModal.value = false;
			modify();
	}
	 //私聊动画
	function modify(){
					bb.value = !bb.value
					if(bb.value){
						bg.value = 'block';
					}else{
						bg.value = 'none';
					}
					const animation = uni.createAnimation({
					  duration: 400,
					    timingFunction: 'ease',
					})
					 if(bb.value){
					 	animation.bottom(0).step()		 				  
					 }else{
					 	animation.bottom('-70%').step()		  
					 }				
					 animationData.value = animation.export();
		}
    //发送消息
   function sendMessage() {
     // 检查消息是否为空
     if (userMessage.value.trim() === '') return;
   
     // 构建消息对象
     let msgObj = {
       message: userMessage.value,
       userid: userid, // 发出人ID
       receiverId: receiverId.value, // 接收人ID，如果为空表示群发
       activityId: activityId,
       time: new Date(), // 时间戳
     };
     // 发送消息
     uni.sendSocketMessage({
       data: JSON.stringify(msgObj), // 将消息对象转换为字符串格式
       success: () => {
         // 消息发送成功后的逻辑
         if (receiverId.value === '' && activityId.value == messageData.value.activityId) {
           messageData.value.push(msgObj); // 群发消息，添加到群聊消息列表
		   uni.pageScrollTo({ scrollTop: 99999, duration: 300 }); // 滚动到页面底部，假设这里是0
         } else if(activityId.value == messageData.value.activityId){
			const privateChatKey = [userid, receiverId.value].sort().join('_'); // 将数组转换成字符串，作为映射的键
           otochats[privateChatKey].push(msgObj); // 私发消息，添加到私聊消息列表
		   scrollTopValue.value += 10; // 再次更新以触发滚动
         }
         userMessage.value = ''; // 清空输入框
       },
       fail: () => {
         console.error("Failed to send message");
         // 可以在这里处理消息发送失败的逻辑，比如提示用户
       }
     });
   }

	function  navBack(){
	    uni.navigateBack();
		// 页面隐藏时关闭WebSocket连接
		if(socket){
			uni.closeSocket();
			socket = null
		}
	}
    //获取本地缓存用户信息
   function userInfo() {
       // 尝试从存储中获取用户信息
       const userStr = uni.getStorageSync('userInfor'); // 确保键名正确
       if (!userStr) {
           console.error('User info not found in storage');
           return null; // 或根据实际情况返回一个合理的默认值
       }
       try {
          userid = userStr.uid,
          avatar = userStr.avatarUrl,
          nickname = userStr.nickname
       } catch (error) {
           console.error('Error parsing user info from storage', error);
           return null; // 解析失败时的处理
       }
   }
	function timeDetia(date){
				var time;
				var d = new Date(date);
				var n = new Date();
				//获取时间戳
				var dd = d.getTime();
				var h = d.getHours();
				var m = d.getMinutes();
				var Y = d.getFullYear();
				var M = d.getMonth() + 1;
				var D = d.getDate();
				//现在时间
				var nn = n.getTime();
				var hh = n.getHours();
				var mm = n.getMinutes();
				var YY = n.getFullYear();
				var MM = n.getMonth() + 1;
				var DD = n.getDate();
				
				if( D == DD && M == MM && Y ==YY){
					if(h<10){
					h = '0'+h;
					}
					if(m<10){
						m = '0'+m;
					}
					time = h+':'+m;
					return time;
				}else if(D+1 == DD && M == MM && Y ==YY){
					if(h<10){
					h = '0'+h;
					}
					if(m<10){
						m = '0'+m;
					}
					time = '昨天'+' '+h+':'+m;
					return time;
				}else{
					if(M<10){
						M = '0'+M;
					}
					if(D<10){
						D = '0'+D;
					}
					if(h<10){
					h = '0'+h;
					}
					if(m<10){
						m = '0'+m;
					}
					time = Y+'年'+M+'月'+D+'日'+' '+h+':'+m;
					return time;
				}
			}

</script>

<style lang = 'scss'>
	.status-bar{
		position: fixed;
		left: 0;
		width: 100%;
		height: 88rpx;
		padding-top: var(--status-bar-height);
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
		overflow: hidden;
		-webkit-box-pack: justify;
		-webkit-justify-content: space-between;
		justify-content: space-between;
		z-index: 998;
		color: #272832;
		-webkit-transition-property: all;
		transition-property: all;
		background:rgba(255,255,255,0.96);
		.login-c{
			width: 60rpx;
			height: 60rpx;
			padding-top: 22rpx;
			padding-left: 32rpx;
		}
		.login-back{
			width: 20rpx;
			height: 34rpx;
		}
		.scrollv{
			width: 84%;
			.users{
				//background: #eee;
				display: flex;
				.user-l{
					padding: 12rpx 8rpx;
					position: relative;
					image{
						width:64rpx;
						height:64rpx;
						border-radius: 50%;
					}
					.tip{
						width:14rpx;
						height:14rpx;
						background:rgba(255,77,60,1);
						position: absolute;
						top: 12rpx;
						right: 10rpx;
						border-radius: 50%;
						z-index: 10;
					}
				}
				
			}
		}
	}
	.main{
		padding: 160rpx 28rpx 160rpx;
	}
	.main,.modfiy-mian{
		.msg{
			display: flex;
			align-items:flex-end;
			padding: 40rpx 0;
			image{
				flex: none;
				width:70rpx;
				height:70rpx;
				border-radius:18rpx;
				margin: 0 20rpx;
				
			}
			.nr{
				.user-nickname {
					position: relative;
					top: -3rpx; /* 将昵称上移，数值根据实际情况调整 */
					left: 0rpx; /* 根据需要调整，保持与背景框对齐 */
					font-size:20rpx;
					color:rgba(25,29,35,0.5);
					line-height:34rpx;
				}
				.neir{
					max-width:380rpx;
					// padding:26rpx 32rpx;
					padding:10rpx 15rpx;
					min-height:48rpx;
					font-size:30rpx;
					color:rgba(25,29,35,1);
					line-height:40rpx;
				}
				.nt{
					padding-top: 4rpx;
					position: absolute;
					font-size:20rpx;
					color:rgba(25,29,35,0.5);
					line-height:34rpx;
				}
			}
		}
		.left{
			flex-direction: row;
			.neir{
				background:rgba(244,244,244,1);
				border-radius:24rpx 24rpx 24rpx 0px;
			}
		}
		.right{
			flex-direction: row-reverse;
			.neir{
				background:rgba(255,234,222,1);
				border-radius:24rpx 24rpx 0px 24rpx;
			}
			.nt{
				right: 132rpx;
			}
		}
	}
	.send{
		position: fixed;
		z-index: 1002;
		bottom: 0;
		width: 100%;
		padding-bottom:var(--status-bar-height);
		min-height: 100rpx;
		background:rgba(255,255,255,0.96);
		display: flex;
		.chat-send{
			margin: 12rpx 48rpx;
			flex: 1;
			width: 100%;
			min-height:40rpx;
			background:rgba(242,242,242,1);
			border-radius:24rpx;
			font-size:28rpx;
			color:rgba(25,29,35,1);
			line-height:40rpx;
			padding: 24rpx 80rpx 24rpx 24rpx;
		}
		image{
			width: 48rpx;
			height: 48rpx;
			position: absolute;
			right: 68rpx;
			top: 32rpx;
		}
	}
	.modify{
		position: fixed;
		overflow: hidden;
		left: 0;
		bottom:-90%;
		width: 100%;
		height: 90%;
		z-index: 1000;
		background: #fff;
		border-radius:48rpx 48rpx 0px 0px;
	}
	.u-name{
		position: absolute;
		top: 0;
		background-color: #fff;
		height: 80rpx;
		text-align: center;
		width: 100%;
		line-height: 80rpx;
	}
	.modfiy-mian{
		padding: 88rpx 28rpx 120rpx;
		box-sizing: border-box;
		height: 97%;
	}
	.bg{
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 999;
		background-color: rgba(0,0,0,0.4);
	}
</style>