<template>
	<view class="password-view">
		<view class="global-display global-a-items">
			<text>邮箱</text>
			<input type="text" v-model="email" placeholder="(必须@um.edu.mo结尾)">
		</view>
		<view class="global-display global-a-items">
			<text>验证码</text>
			<input type="text" v-model="code" placeholder="请输入验证码">
			<button size="mini" :disabled="codeDisabled" @click="sendCode">{{codeName}}</button>
		</view>
	</view>
	<view class="password-view">
		<view class="global-display global-a-items">
			<text>新密码</text>
			<input type="safe-password" password v-model="password" placeholder="6-20位大小写字母+数字组成">
		</view>
		<view class="global-display global-a-items">
			<text>确认密码</text>
			<input type="safe-password" password v-model="newPassword" placeholder="再次输入新密码">
		</view>
	</view>
	<!-- 提示 -->
	<view class="password-tips">{{errNewpassword}}</view>
	<button @click="subMit" :loading="loading" :disabled="subDisabled" class="sum-mit">提交</button>
</template>

<script setup>
	import { ref,watchEffect } from 'vue';
	import {requestApi} from '@/api/request.js'
	const email = ref('')//邮箱
	const code = ref('')//验证码
	const password = ref('')//密码
	const newPassword = ref('')//确认密码
	/* -------发送验证码-------- */
	const codeDisabled = ref(false);
	const countdownTime = ref(60);//倒计时时间
	const codeName = ref('发送验证码')
	// 发送验证码
	async function sendCode(){
		// 调用发送验证码接口
		const res = await requestApi('/vercode',{emailAddress:email.value})
		// 倒计时开始
		codeDisabled.value = true
		var timer = setInterval(()=>{
			if(countdownTime.value > 1){
				countdownTime.value--
				codeName.value = `${countdownTime.value}秒后重新获取`
			}else{
				clearInterval(timer);
				codeDisabled.value = false
				countdownTime.value = 60
				codeName.value = '发送验证码'
			}
		},1000)
	}
	// 校验表
	const errNewpassword = ref('')
	const subDisabled = ref(false)
	watchEffect(()=>{
		// 验证密码是否一致
		if (password.value === newPassword.value) {
		    errNewpassword.value = ''
			subDisabled.value = false
		} else {
			errNewpassword.value = '两次输入的密码不一致'
			subDisabled.value = true
		}
	})
	// loading
	const loading = ref(false)
	// 提交更新
	async function subMit(){
		try{
			loading.value = true
			const res = await requestApi('/upload-password',{
				email:email.value,
				code:code.value,
				password:password.value
			},'POST')
			loading.value = false
			if (res.error) {
			    // 如果后端返回错误信息，使用uni.showToast显示
			    uni.showToast({
			        title: res.msg, // 显示错误信息
			        icon: 'none', // 图标，有效值 "success", "loading", "none"
			        duration: 2000 // 提示的延迟时间，单位毫秒，默认：1500
			    });
			} else {
			    // 如果没有错误，正常导航回上一页
			    uni.navigateBack({delta: 1})
			}
		}catch(e){
			loading.value = false
			// 发生网络请求失败等异常时，也使用uni.showToast显示
			uni.showToast({
			    title: '请求失败，请稍后再试', // 或e.message获取更具体的错误信息
			    icon: 'none',
			    duration: 2000
			});
		}
	}

</script>

<style>
page{
	background-color: #f6f7f9;
}
.password-view{
	margin: 10rpx 20rpx 60rpx 20rpx;
	background-color: #ffffff;
	padding: 0 20rpx;
}
.password-view view{
	padding: 20rpx 0;
}
.password-view text{
	width: 150rpx;
	font-size: 32rpx;
}
.password-view input{
	flex: 1;
	padding: 0 10rpx;
}
.password-view button{
	background-color: #f9dc53;
	border: none;
}
.sum-mit{
	background-color: #f9dc53;
	width: 400rpx;
	margin-top: 40rpx;
	border: none;
}
.password-tips{
	padding-left: 20rpx;
	font-size: 30rpx;
	color: red;
}
</style>