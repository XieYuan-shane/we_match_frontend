<template>
	<!-- 顶部 -->
	<view class="Rec-destination"
		:class="{'add-view-hei': isIncreased}">
		<view class="reco-Image-back"
		:class="{'reco-Image-over': isIncreased}">
			<image
			class="reco-Image-url"
			:class="[isIncreased ? 'add-Image-hei' : 'breathe']"
			:src="wxGainDailyRecomObj.imageUrl"
			mode="aspectFill"
			@click="increaseHeight"
			></image>
		</view>
		<!-- 未展开的 -->
		<text class="yin-yin" v-if="!isIncreased"></text>
		<text class="tansuo" v-if="!isIncreased" @click.stop="increaseHeight">去看看</text>
		<view class="search-input-top" :style="{backgroundColor: wxGainDailyRecomObj.color}" v-if="!isIncreased"
		@click="seacrhPage"
		>
			<image src="/static/icon/found/sousuo-bai.png" mode="widthFix"></image>
			<text>搜索活动</text>
		</view>
		<view v-show="!isIncreased" class="top-naviga-tion global-display global-j-around global-a-items">
			<view class="global-display global-a-items global-f-direction"
			v-for="(item,index) in topNavigaTion" :key="index" @click="topnavIgtion(index,item.text)">
				<image :src="item.icon" mode="widthFix"></image>
				<text>{{item.text}}</text>
			</view>
		</view>
		<!-- 已展开的 -->
		<view class="reco-Address" v-if="isIncreased">
			<text class="reco-Address-text">{{wxGainDailyRecomObj.title}}</text>
			<view class="global-display global-a-items global-j-content">
				<view class="global-display global-a-items"
				@click="chooseCity(wxGainDailyRecomObj.address)">
					<image src="/static/icon/index/address.png" mode="widthFix"></image>
					<text>{{wxGainDailyRecomObj.address}}</text>
				</view>
				<view class="global-display global-a-items" @click="destInation">
					<text>前往</text>
					<image src="/static/icon/personal-Data/jiantou-you.png" mode="widthFix"></image>
				</view>
			</view>
		</view>
		<view class="reco-Exit" v-show="isIncreased">
			<text @click.stop="exItfun">退出</text>
		</view>
	</view>
	<view style="height: 50rpx;"></view>

	<!-- tab导航 -->
	<view class="container">
		<scroll-view class="tabs" scroll-x :scroll-left="scrollLeft" enable-passive scroll-with-animation>
		  <view v-for="(item, index) in tabNav" :key="index"
		  class="tab" :data-index="index" @tap="handleTabTap"
		  >
			<view class="tab-text" :class="{ active: activeIndex === index }">{{ item.name }}</view>
			<view class="tab-underline" :class="{ activeBor: activeIndex === index }"></view>
		  </view>
		</scroll-view>
	</view>
	<!-- 推荐 -->
	<Recomment v-show="keyWords == '001'" :newestArticle="newestArticle"/>
	<!-- 瀑布流 -->
	<card :userArticles="newuserArticles"/>
	<view style="height: 200rpx;"></view>
</template>

<script setup>
	import {reactive, ref,nextTick,watch} from 'vue'
	import {onReachBottom,onPageScroll,onLoad,onPullDownRefresh} from '@dcloudio/uni-app'
	import {MenuButton} from '@/api/MenuButton.js'
	import {requestApi} from '@/api/request.js'
	import Recomment from '@/pages/index/components/recomment.vue'
	import card from '@/pages/Common-components/card-flow.vue'
	// pinia
	import { dataSet } from "@/store/index.js";
	const store = dataSet();
	// 点击顶部图片加高度
	let isIncreased = ref(false)
	function increaseHeight(){
		isIncreased.value = true
		wx.hideTabBar({animation:true})
	}
	function exItfun(){
		isIncreased.value = false
		wx.showTabBar({animation:true})
	}
	// 监听如果展示地址，禁用页面滚动
	watch(isIncreased,(newValue)=>{
		if(isIncreased.value){
			wx.setPageStyle({
			   style: {overflow: 'hidden'}
			})
		}else{
			wx.setPageStyle({
			   style: {overflow: 'inherit'}
			})
		}
	})
	// 存储顶部推荐切换地址和总条数
	const wxGainDailyRecomObj = ref({})
	const wxGainDailyRecomCount = ref(0)
	// 顶部导航
	const topNavigaTion = ref([
		{
			icon:'/static/icon/index/xuexi.png',
			text:'学习'
		},
		{
			icon:'/static/icon/index/yule.png',
			text:'娱乐'
		},
		{
			icon:'/static/icon/index/yigong.png',
			text:'义工'
		},
		{
			icon:'/static/icon/index/pinglun.png',
			text:'分享'
		},
		{
			icon:'/static/icon/index/qita.png',
			text:'其他'
		}
	])

	// 推荐四个最新的文章
	const newestArticle = ref([])
	// tab文章分类切换
	const tabNav = ref([])
	// 瀑布流：用户文章
	const userArticles = ref([])
	const newuserArticles = ref([])
	const articlesIndex = ref(0)
	const activeIndex = ref(0)
	const scrollLeft = ref(0)
	const tabWidths = ref([])
	// 点击tab切换分类
	const keyWords = ref('001')
	// 点击tab切换滑动指定tab上
	async function handleTabTap(e) {
		const index = e.currentTarget.dataset.index;
		scrollLeft.value = tabWidths.value[index].left - uni.getSystemInfoSync().windowWidth / 2 + tabWidths.value[index].width / 2
		activeIndex.value = index;
		const query = tabNav.value[index].key
		keyWords.value = query
		// 如果之前选中的就不再请求数据
		if(!userArticles.value.find(item => item.query === index)){
			const user_articles = await requestApi('/user-activities',
			{keywords:query,page:1})
			userArticles.value.push({query:index,data:user_articles.data,page:1})
			const newVal = userArticles.value.filter(item=>item.query === index)
			newuserArticles.value = newVal[0].data
		}else{
			const newVal = userArticles.value.filter(item=>item.query === index)
			newuserArticles.value = newVal[0].data
		}
		articlesIndex.value = userArticles.value.findIndex(item=>item.query === index)
	}
	
	// 请求全部数据
	onLoad(async()=>{
		// 每日推荐
	  const gainDailyRecom = await requestApi('/wxGainDailyRecom',{page:1})
	  wxGainDailyRecomObj.value = gainDailyRecom.data.data[0]
	  wxGainDailyRecomCount.value = gainDailyRecom.data.count
	  // 四个文章主题推荐
	  const gainRecomArticle = await requestApi('/gainRecomArticle')
	  newestArticle.value = gainRecomArticle.data
	  const tabArr = await requestApi('/article-class')
	  const user_articles = await requestApi('/user-activities',{keywords:'001',page:1})

	  tabNav.value = tabArr.data
	  userArticles.value.push({query:0,data:user_articles.data,page:1})
	  newuserArticles.value = userArticles.value[0].data
	  await nextTick()//获取tab导航数据
	  let query = uni.createSelectorQuery();
	  query.selectAll('.tab').boundingClientRect(rects => {
	  tabWidths.value = rects.map((item,index)=>{
		  return {width:item.width,left:item.left}
	  })
	  }).exec()
	})
	// 下拉刷新:顶部推荐
	const recoPage = ref(1)
	onPullDownRefresh(async()=>{
		recoPage.value++
		if(recoPage.value >= wxGainDailyRecomCount.value + 1){
			recoPage.value = 1
		}
		const gainDailyRecom = await requestApi('/wxGainDailyRecom',{page:recoPage.value})
		wxGainDailyRecomObj.value = gainDailyRecom.data.data[0]
		wx.stopPullDownRefresh()
	})
	// 上拉加载
	onReachBottom(async()=>{
		userArticles.value[articlesIndex.value].page++
		const user_articles = await requestApi('/user-activities',
		{	keywords:keyWords.value,
			page:userArticles.value[articlesIndex.value].page,
		})
		userArticles.value[articlesIndex.value].data = [...userArticles.value[articlesIndex.value].data,...user_articles.data]
		newuserArticles.value = userArticles.value[articlesIndex.value].data
	})
	// 搜索框透明度和颜色
	const styleOpacity = ref(0)
	// 滚动监听
	onPageScroll((event)=>{
		if(event.scrollTop <= 200){
			styleOpacity.value = 0
		}else{
			styleOpacity.value = event.scrollTop / 140
		}
	})

	// 跳转搜索
	function seacrhPage(){
		wx.navigateTo({url:'/pages/search-article/search'})
	}
	
	// 搜索框下面的分类类型
	function topnavIgtion(index,value){
	wx.navigateTo({url:`/pages/types-article/index?type=001&query=${value}&address=null`})

}
</script>

<style>
page{
	background-color: #f7f8fb;
}
.search-view{
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 9999;
	height: v-bind('MenuButton().seViewHeight');
	background-color: #FFFFFF;
	opacity: v-bind('styleOpacity');
}
.occupy-space{
	height: v-bind('MenuButton().seViewHeight');
}
.buttonTop{
	height: v-bind('MenuButton().top');
}
.search-input{
	background: #f4f4f4;
	border-radius: 50rpx;
	margin-left: 20rpx;
	display: flex;
	flex-direction: row;
	flex: 1;
	position: relative;
	height: v-bind('MenuButton().height');
	width: v-bind('MenuButton().left');
}
.search-input input{
	width: 100%;
	font-size: 30rpx;
	color: #b2b2b2;
	padding-left: 80rpx;
	height: v-bind('MenuButton().height');
}
.search-input image{
	width: 35rpx;
	height: 35rpx;
	position: absolute;
	left: 30rpx;
	align-self: center;
}
.input-color{
	color: #666666;
}
/* 推荐地点 */
.Rec-destination{
	position: relative;
	height: 800rpx;
}
/* 背景图原始高度 */
.reco-Image-back{
	width: 100%;
	height: 800rpx;
	overflow: hidden;
}
/* 全屏覆盖的高度 */
.reco-Image-over{
	height: 100%;
	transition: height 0.5s ease;
	overflow: inherit !important;
}
.reco-Image-url{
	width: 100%;
	height: 800rpx;
}
/* 全屏覆盖的图片高度 */
.add-Image-hei{
	height: 100%;
	transition: height 0.5s ease;
}
/* 全屏覆盖的图片父元素view高度 */
.add-view-hei{
	height: 100vh;
	transition: height 0.5s ease;;
}
.breathe {
  animation-name: breathe;
  animation-duration: 10s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

@keyframes breathe {
	0% { transform: scale(1); }
	50% { transform: scale(1.1); }
	100% { transform: scale(1); }
}
.yin-yin{
	position: absolute;
	bottom: 0;
	right: 0;
	left: 0;
	padding: 50rpx 0;
	background: linear-gradient(to bottom, rgba(247, 248, 251, 0),
	rgba(247, 248, 251, 0.3),
	rgba(247, 248, 251, 0.7),
	rgba(247, 248, 251, 1)
	);
}
.tansuo{
	color: #333;
	background-color:#FFFFFF;
	border-radius: 40rpx;
	padding: 11rpx 20rpx;
	position: absolute;
	right: 30rpx;
	top: 400rpx;
}
.all-destination{
	position: absolute;
	left: 20rpx;
	top: 50%;
	border: 2rpx solid #FFFFFF;
	border-radius: 40rpx;
	color: #FFFFFF;
	font-size: 30rpx;
	font-weight: bold;
	padding: 5rpx 25rpx;
}
.search-input-top image{
	width: 30rpx;
	display: block;
	padding-right: 15rpx;
}
.search-input-top{
	position: absolute;
	bottom: 190rpx;
	left: 20rpx;
	right: 20rpx;
	display: flex;
	align-items: center;
	border-radius: 40rpx;
	backdrop-filter: blur(5rpx);
	padding: 0 30rpx;
	height: 80rpx;
	line-height: 80rpx;
	color: #FFFFFF;
}
.top-naviga-tion{
	background-color: #FFFFFF;
	border-radius: 20rpx;
	position: absolute;
	left: 20rpx;
	right: 20rpx;
	bottom: -50rpx;
	padding: 45rpx 0;
	z-index: 99;
	color: #666666;
}
.top-naviga-tion image{
	width: 50rpx;
	display: block;
	padding-bottom: 10rpx;
}
.reco-Address{
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	color: #FFFFFF;
	background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8));
	padding: 100rpx 20rpx;
	transform: translateY(100%);
	transition: transform 800ms ease-in-out;
	animation: slide-up-animation 800ms forwards;
}
@keyframes slide-up-animation {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
.reco-Address image{
	width: 30rpx;
}
.reco-Address-text{
	font-size: 34rpx;
	font-weight: bold;
	padding-bottom: 20rpx;
}
.reco-Exit{
	left: 20rpx;
	position: absolute;
	top: v-bind('MenuButton().top');
	height: v-bind('MenuButton().height');
	line-height: v-bind('MenuButton().height');
	z-index: 9999;
}
.reco-Exit text{
	color: #FFFFFF;
	background-color: rgba(0, 0, 0, 0.3);
	border-radius: 40rpx;
	width: 140rpx;
	text-align: center;
}

/* tab滑动导航栏 */
.container{
	/* postion:-webkit-sticky; */
	position: sticky;/* //sticky */
	/* top: v-bind('MenuButton().seViewHeight'); *//* //取消粘性 */
	z-index: 99;
	background-color: #f7f8fb;
}
.tabs {
	white-space: nowrap;
	width: 100%;
}
.tab {
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	padding: 30rpx;
	font-size: 30rpx;
	font-weight: bold;
	color: #999;
}
.active{
  color: #000;
}
.tab-underline {
	width: 50rpx;
	height: 8rpx;
	margin-top: 10rpx;
	border-radius: 4rpx;
}
.activeBor{
	background-color: #f8e254;
}
.tabs .tab:nth-child(2) .tab-text{
	color: #91c36f !important;
	font-family: 'Lobster', cursive;
}
</style>
