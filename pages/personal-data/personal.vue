<template>
	<view class="revise-back">
		<image class="revise-back-img" :src="userData.backdrop" mode="aspectFill"></image>
		<view class="revise-avater global-display global-f-direction global-a-items">
			<image :src="userData.avatarUrl" class="personal-margin" mode="aspectFill" @click="uploadAvatarurl(0)"></image>
			<view @click="uploadAvatarurl(1)">设置背景</view>
		</view>
	</view>
	<view class="personal-view">
		<view class="global-display global-a-items">
			<text>昵称</text>
			<input type="text" placeholder="请填写昵称" v-model="userData.nickname">
		</view>
		<view class="global-display global-a-items">
			<text>性别</text>
			<picker @change="pickerChangeGender" :range="['男','女']">
				<input type="text" disabled placeholder="请选择性别" v-model="userData.gender">
			</picker>
			<image src="/static/icon/personal-Data/jiantou-you.png" mode="widthFix"></image>
		</view>
		<view class="global-display global-a-items">
			<text>出生日期</text>
			<picker @change="pickerChangeDate" mode="date" :start="startDate" :end="endDate">
				<input type="text" disabled placeholder="请选择出生日期" v-model="userData.birthday">
			</picker>
			<image src="/static/icon/personal-Data/jiantou-you.png" mode="widthFix"></image>
		</view>
		<view class="global-display global-a-items">
			<text>书院</text>
			<picker mode="multiSelector" @change="pickerChange" @columnchange="columnChange" :range="multiArray" :value="multiIndex">
				<input type="text" disabled placeholder="请选择书院" v-model="userData.college">
			</picker>
			<image src="/static/icon/personal-Data/jiantou-you.png" mode="widthFix"></image>
		</view>
		<button @click="subMit" class="sum-mit">提交</button>
	</view>
</template>

<script setup>
	import {reactive, ref,onMounted} from 'vue'
	import moment from 'moment'
	moment.locale('zh-cn');
	import {requestApi} from '@/api/request.js'
	// import {compressImage} from '@/api/compression.js'
	import {upLoadCos} from '@/api/cos.js'
	// 获取本地缓存的用户资料
	onMounted(()=>{
		const {avatarUrl,backdrop,nickname,gender,birthday,college} = uni.getStorageSync('userInfor')
		userData.avatarUrl = avatarUrl
		userData.backdrop = backdrop
		userData.nickname = nickname
		userData.gender = gender
		userData.birthday = birthday
		userData.college = college
	})
	// 存储用户资料数据
	const userData = reactive({
		backdrop:'',
		avatarUrl:'',
		nickname:'',
		gender:'',
		birthday:'',
		college:''
	})
	// 上传头像背景图
	async function uploadAvatarurl(event){
		wx.chooseMedia({
		  count: 3,
		  mediaType: ['image'],
		  sizeType:['compressed'],
		  sourceType: ['album', 'camera'],
		  success:async(res)=> {
			wx.showLoading({title: '上传中',mask:true})
			try{
				const upLoadRes = await upLoadCos(res.tempFiles)
				if(event === 0){
					userData.avatarUrl = upLoadRes[0]
				}else{
					userData.backdrop = upLoadRes[0]
				}
			}catch(err){
			console.log(err);
			wx.showToast({title: '上传失败',icon: 'error',duration: 800})
			}
		  }
		})
	}
	// 选择性别
	function pickerChangeGender(event){
		userData.gender = event.detail.value === "0" ? '男' : '女'
	}
	// 选择生日
	const year = moment().format('YYYY-MM-DD')//当前年
	const startDate = ref('1930-01-01')
	const endDate = ref(year)
	function pickerChangeDate(event){
		userData.birthday = event.detail.value
	}
	
	//选择书院
	const multiArray = ref([
	        ['四院', '三院','二院','一院','其他'],
	        ['何鸿燊东亚书院', '满珍纪念书院', '蔡继有书院','霍英东珍禧书院']
	      ]) 
		  
	const multiIndex = ref([0, 0]);
	function pickerChange(e) {
	      const { value } = e.detail;
	      multiIndex.value = value; // 更新索引
		  userData.college = `${multiArray.value[1][value[1]]}`;
	    }
	function columnChange(e) {
		switch(e.detail.column){
			case 0 :
		switch (e.detail.value){
			case 0:  
			multiArray.value = ([
			        ['四院', '三院','二院','一院','其他'],
			        ['何鸿燊东亚书院', '满珍纪念书院', '蔡继有书院','霍英东珍禧书院']
			      ]) 
			break;
			case 1:
			    multiArray.value = ([
			            ['四院', '三院','二院','一院','其他'],
			            ['曹光彪书院', '郑裕彤书院', '吕志和书院']
			          ]);
			break;
			case 2:
			multiArray.value =( [
			            ['四院', '三院','二院','一院','其他'],
			            ['马万祺罗柏心书院', '张昆仑书院']
			          ]);
			break;
			case 3:
			multiArray.value =( [
			            ['四院', '三院','二院','一院','其他'],
			            ['绍邦书院']
			          ]);
			break;
			case 4:
			multiArray.value =( [
			           ['四院', '三院','二院','一院','N系','E系','其他'],
			            ['研究生宿舍', '博士生宿舍']
			          ]);
			break;
			break;
		}
		}
	}
	// 提交
	async function subMit(){
		wx.showLoading({title: '更新中',mask:true})
		const res = await requestApi('/modify-the-user', userData,'POST');
		const {age,avatarUrl,backdrop,birthday,college,gender,nickname} = res.data
		const userJson = uni.getStorageSync('userInfor')
		userJson.age = age
		userJson.avatarUrl = avatarUrl
		userJson.backdrop = backdrop
		userJson.birthday = birthday
		userJson.college = college
		userJson.gender = gender
		userJson.nickname = nickname
		wx.setStorageSync('userInfor',userJson)
		uni.$emit('uploadUserdata',true)
		wx.navigateBack({delta: 1})
	}
</script>

<style scoped>
.revise-back{
	height: 500rpx;
	overflow: hidden;
	position: relative;
}
.revise-back-img{
	height: 500rpx;
	width: 100%;
} 
.revise-avater{
	position: absolute;
	left:50%;
	top:50%;
	transform:translate(-50%,-50%);
}
.revise-avater view{
	background-color: #ffffff;
	margin-top: 20rpx;
	padding: 10rpx;
	display: block;
	border-radius: 6rpx;
	font-size: 30rpx;
}
.personal-view{
	margin-top: 40rpx;
	font-size: 32rpx;
}
.personal-view text{
	width: 150rpx;
	font-size: 32rpx;
}
.personal-view image{
	width: 30rpx;
}
.personal-view view{
	border-bottom: 2rpx solid #f2f2f2;
	padding: 30rpx 20rpx;
}
.personal-view input,picker{
	flex: 1;
}
.personal-margin{
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	border: 8rpx solid #ffffff;
}
.sum-mit{
	background-color: #f9dc53;
	width: 400rpx;
	margin-top: 40rpx;
	border: none;
}
</style>