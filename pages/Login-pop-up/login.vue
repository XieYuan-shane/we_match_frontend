<template>
	<view class="login-fanhui">
		<image src="/static/icon/login-pop-up/fanhui.png" mode="widthFix" @click="fanHui"></image>
	</view>
	<view class="login-view">
		<text>We Match</text>
		<text>登陆后更精彩</text>
	</view>
	<view class="login-input">
		<view class="input-view">
			<input v-model="email" type="number" focus cursor-spacing="15" placeholder="输入邮箱号(@um.edu.mo)" placeholder-class="input-style"/>
		</view>
		<view class="input-view" v-if="!codeShow">
			<input type="text" v-model="password" password cursor-spacing="15" placeholder="输入密码" placeholder-class="input-style"/>
		</view>
		<view v-if="codeShow" class="input-view global-display global-a-items">
			<input v-model="code" type="number" cursor-spacing="15" placeholder="输入验证码" placeholder-class="input-style"/>
			<button class="send-code-btn" size="mini" hover-class="none" :disabled="codeDisabled" @click="sendCode">{{codeName}}</button>
		</view>
		<button hover-class="none" class="go-button" @click="goLogin">登录</button>
		<view class="Login-switch global-display global-a-items global-j-content">
			<text @click="codeShow = !codeShow">{{codeShow ? '账号登陆' : '验证码登陆'}}</text>
			<text @click="uploadPassword">忘记密码</text>
		</view>
	</view>
</template>

<script setup>
	import {ref} from 'vue'
	import {requestApi} from '@/api/request.js'
	import {MenuButton} from '@/api/MenuButton.js'
	// 邮箱号，密码，验证码
	const email = ref('')
	const password = ref('')
	const code = ref('')
	// 验证码登陆和密码登录切换
	const codeShow = ref(false)
	/* ----------------登录逻辑----------------- */
	const codeDisabled = ref(false);
	const countdownTime = ref(60);//倒计时时间
	const codeName = ref('发送验证码')
	// 发送验证码
	async function sendCode(){
	if (!/^[^@]+@um\.edu\.mo$/.test(email.value)) {
			wx.showToast({
				title: '需要以@um.edu.mo结尾的邮箱',
				icon: 'none',
				duration: 2000
			});
			return; // 不继续执行函数
		}
		// 调用发送验证码接口
    requestApi('/vercode',{emailAddress:email.value})
		// 倒计时开始
		codeDisabled.value = true
		var timer = setInterval(()=>{
			if(countdownTime.value > 1){
				countdownTime.value--
				codeName.value = `重新发送（${countdownTime.value}s)`
			}else{
				clearInterval(timer);
				codeDisabled.value = false
				countdownTime.value = 60
				codeName.value = '发送验证码'
			}
		},1000)
	}
	// 验证码和密码登录
	async function goLogin(){
		wx.showLoading({title: '登陆中',mask:true})
		if(codeShow.value){//验证码登录
			const res = await requestApi('/email-registration',{email:email.value,code:code.value},'POST')
			wx.setStorageSync('userInfor',res.data)//存
		}else{//密码登录
			const res = await requestApi('/login',{email:email.value,password:password.value},'POST')
			wx.setStorageSync('userInfor',res.data)//存
		}
		wx.setStorageSync('ifLogin',true)
		uni.$emit('loginSuccess',true)
		wx.navigateBack({delta: 1})
	}
	// 忘记密码
	function uploadPassword(){
		wx.navigateTo({url:'/pages/password-settings/password'})
	}
	// 返回上一页
	function fanHui(){
		uni.navigateBack({delta: 1})
	}
</script>

<style>
page{
	/* background-image: url('https://diancan-1252107261.cos.accelerate.myqcloud.com/lvyou/icon/Login-beijin.jpg'); */
  background-image: url('https://wematch-1324086347.cos.accelerate.myqcloud.com/We_Match/0f192846ac473e05aece1e0a2a4a4a1.png');
    
	background-position: center center;
	background-repeat: no-repeat;
	background-size: cover;
	/* min-height: 100vh; */
}
.send-code-btn {
    width: 200px; /* 或者使用百分比、vw等其他单位 */
	font-size: 12px; /* 调整字体大小 */
}
.login-fanhui{
	padding-top: v-bind('MenuButton().top');
	height: v-bind('MenuButton().height');
	display: flex;
	align-items: center;
}
.login-fanhui image{
	width: 40rpx;
	display: block;
	margin-left: 20rpx;
}
.login-view{
	padding-top: 160rpx;
	padding-bottom: 140rpx;
}
.login-view text{
	padding-left: 40rpx;
	color: #ffffff;
}
.login-view text:nth-child(1){
	font-size: 70rpx;
	font-weight: bold;
}
.login-view text:nth-child(2){
	font-size: 50rpx;
	font-weight: bold;
	padding-bottom: 60rpx;
	padding-left: 150px; /* 向右移动文字 */
	padding-top: 20px; /* 向下移动文字 */
	/* font-family: 'myfont'; */
}
.login-input{
	/* background-color: #ffffff; */
	margin: 0 40rpx;
}
.login-input button{
	background-color: #f8e254;
	color: #333;
}
.input-style{
	color: #ffffff;
}
.input-view{
	background-color: rgba(172, 163, 168, 0.6);
	height: 100rpx;
	padding: 0 30rpx;
	border-radius: 40rpx;
	margin: 30rpx 0;
	color: #ffffff;
	font-size: 40rpx;
	font-weight: bold; /* 或者使用数值，例如 700 */
}
.input-view input{
	height: 100rpx;
}
.go-button{
	border-radius: 40rpx;
	height: 100rpx;
	line-height: 100rpx;
}
.Login-switch{
	color: #ffffff;
	padding-top: 20rpx;
}
.Login-switch text {
	    color: #000000; /* 设置文本颜色 */
	    font-size: 32rpx; /* 设置字体大小 */
	    margin: 0 10rpx; /* 给文本之间添加一些间距 */
		font-weight: bold; /* 或者使用数值，例如 700 */
}
</style>