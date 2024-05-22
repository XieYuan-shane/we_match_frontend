<template>
	<swiper class="swiper-view" indicator-dots indicator-active-color="#ffffff" circular>
		<block v-for="(item,index) in  activityData.image" :key="index">
		<swiper-item class="swiper-item">
			<image class="fadeIn" :src="item" mode="aspectFill"></image>
		</swiper-item>
		</block>
	</swiper>
	<!-- 发布者 -->
	<view class="partner-view">
	<view class="companion-name global-display global-a-items" v-for="(item,index) in activityData.author_data" :key="index">
		<image :src="item.avatarUrl" mode="aspectFill"></image>
		<view>
			<text>{{item.nickname}}</text>
			<text>{{activityData.timestamp}}</text>
		</view>
		<view v-if="signupRes || signupMy" class="companion-chat" @click=" chatWithGroup">chat</view>
		<view v-if="signupRes" class="companion-new">已报名</view>
		<view v-if="signupMy" class="companion-new" @click="managIngMember">管理成员</view>
	</view>
			
	<view class="companion-title">{{activityData.description}}</view>
	<view class="companion-time global-display global-a-items">
		<image src="/static/icon/concern/time.png" mode="widthFix"></image>
		<text>时间：&nbsp;{{activityData.companion_time}}</text>
	</view>
	<view class="companion-time global-display global-a-items">
		<image src="/static/icon/concern/address.png" mode="widthFix"></image>
		<text>地点：&nbsp;{{activityData.city}} {{activityData.full_address}}</text>
	</view>
	<view class="companion-time global-display global-a-items">
		<image src="/static/icon/concern/renshu.png" mode="widthFix"></image>
		<text>希望人数：&nbsp;{{activityData.number_of_people}}人</text>
	</view>
	</view>
	<view v-if="applicantData.quantity > 0">
		<text class="applicant-people">{{applicantData.quantity}}人已报名({{applicantData.male}}男{{applicantData.female}}女)</text>
		<scroll-view class="tabs" scroll-x enable-passive scroll-with-animation>
			<view class="applicant-view" v-for="(item,index) in activityData.signups" :key="index">
				<image :src="item.avatarUrl" class="fadeIn" mode="aspectFill"></image>
				<text class="text-show">{{item.nickname}}</text>
			</view>
		</scroll-view>
	</view>
	
	<!-- 报名 -->
	<view v-if="signupBtn" class="sign-up other-up" @click=" onSignUpClick">报名</view>
	<view v-if="signupRes" class="drop_group other-up" @click="dropGroup">退出队伍</view>
	<view style="height: 200rpx;"></view>
	<!-- 弹出报名 -->
	<page-container :show="showBottom" close-on-slide-down round @beforeleave="showBottom = false">
		<view class="popups">
			<view class="input-information">
				<input type="text" cursor-spacing="30" v-model="submitData.contact" placeholder="请输入手机号或微信号,仅发起人可见">
			</view>
			<view class="sex-views global-display global-a-items">
				<text>真实性别</text>
				<view class="sex-select global-display global-a-items">
					<text v-for="(item,index) in genderData" :key="index" 
					:class="[index == genderIndex ? 'gengderStyle' : '']"
					@click="genderFun(index,item.value)">{{item.name}}</text>
				</view>
			</view>
			<view class="init-textarea">
				<textarea v-model="submitData.message" cursor-spacing="30" placeholder="自我介绍,发起人会通过你的自我介绍来判断是否与你同行,请认真的介绍下自己" />
			</view>
			<view class="other-textarea" @click="showBottom = true">
				<text class="sign-up" @click="subMit">提交</text>
			</view>
		</view>
	</page-container>
	
</template>

<script setup>
import { reactive, ref,onMounted } from "vue"
import {requestApi} from '@/api/request.js'
import {onLoad} from '@dcloudio/uni-app'

// 弹出框
const showBottom = ref(false)
// 存储视图层性别
const genderData = ref([{name:'男',value:1},{name:'女',value:0}])
const genderIndex = ref(0)
function genderFun(index,value){
	genderIndex.value = index
	submitData.gender = value
}
// 输入和选中值
const submitData = reactive({
	contact:'',
	gender:1,
	message:''
})
// 活动id
const activityId = ref('')
// 是否已报名
const signupRes = ref(false)
// 是否是自己发表的
const signupMy = ref(false)
// 是否显示报名表
const signupBtn = ref(true)
// 存储请求得到数据
const activityData = ref({})
// 存储本用户姓名
const myname = ref("")
// 存储本用户头像
const myavatarUrl = ref("")
let author_uid = ''
// 存储报名人数说明
const applicantData = reactive({
	quantity:0,
	male:0,
	female:0
})
const name = ref("测试")
let isInBlackList = ''
const img = ref("/static/icon/index/address.png")
let articleId = null;
onLoad(async(event)=>{
	if(event._id){
	  const _id = event._id
	  activityId.value = _id
	}
	//通过活动详情
	else{
		const res = await requestApi('/getCompIdByActivityId',{articleId:event.articleId})
		activityId.value = res.data._id
	}
	 await requestData()
})
// 获取请求结果的方法
async function requestData(){
	// 查询是否已报名
	const signupQuery = await requestApi('/signup-query',{id:activityId.value})
	
	const res = await requestApi('/companion-details',{id:activityId.value})
	
	// 判断角色
	if(signupQuery.data == '001'){//用户自己发表的
		signupRes.value = false
		signupMy.value = true
		signupBtn.value = false
	}else if(signupQuery.data == '002'){//已报名
		signupRes.value = true
		signupMy.value = false
		signupBtn.value = false
	}else{//未报名
		signupRes.value = false
		signupMy.value = false
		signupBtn.value = true
	}
	isInBlackList = res.data[0].isInBlackList
	activityData.value = res.data[0]
	applicantData.quantity = res.data[0].signups.length
	myname.value = res.data[0].my_info.nickname
	author_uid = res.data[0].uid
	myavatarUrl.value = res.data[0].my_info.avatarUrl
	res.data[0].signups.forEach(item=>{//判断报名用户性别
		if(item.gender === 0){
			applicantData.female++
		}else{
			applicantData.male++
		}
	})
}
async function subMit(){
  wx.showLoading({title: '提交中', mask: true});
     await requestApi('/sign-up-partner', {
      signup_id: activityId.value,
      contact_inform: submitData.contact,
      gender: submitData.gender,
      introduce: submitData.message
    }, 'POST')
	await requestData();
    wx.hideLoading();
    showBottom.value = false; // 关闭报名
}
// 管理成员
function managIngMember(){
	wx.navigateTo({url:'/pages/companion/managing-member?_id=' + activityId.value})
}
// 点击报名按钮的方法
function onSignUpClick() {
    // 判断申请人数是否大于等于希望人数
    if (applicantData.quantity >= activityData.value.number_of_people) {
        // 弹出提示：报名人数已满
        uni.showToast({
            title: '报名人数已满',
            icon: 'none',
            duration: 2000
        });
    } 
	else if(isInBlackList){
		// 弹出提示：曾经退出
		uni.showToast({
		    title: '您曾经退出，无法再次报名',
		    icon: 'none',
		    duration: 2000
		});
	}
	else {
        // 显示报名弹窗
        showBottom.value = true;
    }
}

// 退出队伍的方法
function dropGroup(){
	
  uni.showModal({
      title: '提示',
      content: '确认退出队伍吗？（退出后无法再加入）',
      confirmText: '确认',
      confirmColor: '#ff0000', // 确认按钮的文字颜色
      cancelText: '放弃',
      cancelColor: '#000000', // 取消按钮的文字颜色
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确认');
          // 执行退出队伍的请求逻辑
          requestDropGroup().then(() => {
            // 请求成功后重新加载数据
            requestData().then(() => {
              uni.showToast({
                title: '已退出队伍',
                icon: 'success',
                duration: 2000
              });
            });
          }).catch((error) => {
            console.error('退出队伍失败:', error);
            uni.showToast({
              title: '操作失败，请重试',
              icon: 'none',
              duration: 2000
            });
          });
        } else if (res.cancel) {
          console.log('用户点击放弃');
          // 用户取消操作，不需要进一步执行
        }
      }
    });
  }


async function requestDropGroup() {
 
	await requestApi('/drop-group', { Id: activityId.value }, 'POST');
}

// 点击报名按钮的方法
function chatWithGroup() {
     // 跳转聊天
	 uni.navigateTo({
		url: '../chatroom/chatroom?activityId='+ activityId.value+'&author_id='+author_uid,
	});
}

</script>

<style>
@import url('@/style/index.css');
/* 轮播 */
.swiper-view{
	height: 700rpx;
}
.swiper-item image{
	height: 700rpx;
	width: 100%;
}
.partner-view{
	padding: 0 20rpx;
}
.companion-name{
	padding-top: 20rpx;
}
.applicant-people{
	padding: 20rpx;
	border-top: 2rpx solid #e3e4e7;
	color: #727476;
}
.applicant-view{
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	width: 140rpx;
	overflow: hidden;
}
.applicant-view image{
	width: 90rpx;
	height: 90rpx;
	border-radius: 50%;
	display: block;
}
.applicant-view text{
	margin: 10rpx 0;
	font-size: 26rpx;
	font-weight: bold;
	width: 90rpx;
	text-align: center;
}
.popups{
    height: 1000rpx;
    overflow-y: hidden;
    width: 100%;
    background-color: #ffffff;
}
.input-information{
	margin: 40rpx 20rpx 20rpx 20rpx;
	background-color: #f9f9f9;
	padding: 20rpx 0;
	border-radius: 5rpx;
}
.input-information input{
	padding: 0 10rpx;
	font-size: 30rpx;
}
.init-textarea{
	background-color: #f9f9f9;
	border-radius: 8rpx;
	margin: 20rpx;
	padding: 5rpx;
}
.init-textarea textarea{
	width: 100%;
	padding: 0 10rpx;
	font-size: 30rpx;
}
.sex-views{
	padding: 20rpx;
}
.sex-views text{
	font-size: 30rpx;
}
.sex-select text{
	background-color: #f7f7f7;
	margin: 0 30rpx;
	padding: 10rpx 60rpx;
	border-radius: 8rpx;
}
.gengderStyle{
	background-color: #f8d957 !important;
}
</style>