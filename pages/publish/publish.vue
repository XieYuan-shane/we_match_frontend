<template>
	<view class="publish-button">
		<button :disabled="disabled" :style="{backgroundColor:disabled ? '' : '#f8d957'}" size="mini" @click="reLease">发布</button>
	</view>
	<!-- 展示图片 -->
	<view class="fillout-input" v-if="fileType == 'image'">
		<view class="init-uploader">
			<view v-for="(item,index) in fileList" :key="index">
				<image :src="item.tempFilePath" mode="aspectFill"></image>
				<image class="delete-Img" @click="beforeDelete(index)" src="/static/icon/companion/shanchu.png" mode="widthFix"></image>
			</view>
			<view @click="uploadImage()" v-if="fileList.length < 8">
				<image src="/static/icon/companion/shangchuan.png" mode="aspectFill"></image>
			</view>
		</view>
	</view>
	<!-- 展示视频 -->
	<view class="fillout-input" v-if="fileType == 'video'">
		<view class="video-view" v-for="(item,index) in fileList" :key="index">
			<video enable-play-gesture object-fit="cover" :poster="item.thumbTempFilePath" :src="item.tempFilePath"></video>
			<image class="delete-Img" @click="beforeDelete(index)" src="/static/icon/companion/shanchu.png" mode="widthFix"></image>
			<text @click="uploadImage(1,'image','002')">选封面</text>
		</view>
	</view>
	<view class="fillout-input">
		<input type="text" v-model="title" cursor-spacing="30" placeholder="好的标题更容易吸引人">
	</view>
	<view class="fillout-input" v-if="!showSelect">
		<textarea 
		maxlength="300"
		cursor-spacing="30" 
		@blur="blurEvent"
		v-model="describe.value"
		placeholder="想要分享内容/活动描述" />
	</view>
	
	<view class="fillout-input personal-view global-display global-a-items">
		<text>活动地址</text>
		<picker mode="multiSelector" @change="pickerChange" @columnchange="columnChange" :range="multiArray" :value="multiIndex">
			<input type="text" disabled placeholder="请选择活动地址" v-model="poiname">
		</picker>
		<image src="/static/icon/personal-Data/jiantou-you.png" mode="widthFix"></image>
	</view>
	<view class="fillout-input personal-view global-display global-a-items" v-show="poiname === '其他'">
	  <text>补充地址</text>
	  <input type="text" v-model="other_poiname" placeholder="活动地址">
	</view>
	
	<view class="fillout-input personal-view global-display global-a-items">
		<text>分类</text>
		<picker @change="pickerChangeCategory" :range="categories">
			<input type="text" disabled placeholder="请选择类别" v-model="category">
		</picker>
		<image src="/static/icon/personal-Data/jiantou-you.png" mode="widthFix"></image>
	</view>
	<!-- 已添加的标签 -->
	<view class="fillout-input location-view" v-if="myLabel.length > 0">
		<text class="tag-Text">还可添加{{numberTags - myLabel.length}}个标签</text>
		<view class="global-display global-f-wrap global-a-items">
			<text class="vanTag selectTag" v-for="(item,index) in myLabel" :key="index" @click="close(index,item)">
			  {{item}}
			</text>
		</view>
	</view>
	<!-- 选择标签 -->
	<view class="fillout-input location-view">
		<text class="tag-Text">推荐标签</text>
		<view class="global-display global-f-wrap global-a-items">
		<text class="vanTag" v-for="(item,index) in recLabel" :key="index"
		:style="getStyle(item)"
		@click="addTag(item)"
		>
		  {{item.name}}
		</text>
		<text class="customizeTag" @click="tagTrue = true">+ 自定义标签</text>
		</view>
	</view>
	<!-- 自定义标签弹窗 -->
	<!-- <view class="Custom-tag" v-if="tagTrue" @click="tagTrue = false">
		<view @click.stop="">
			<input type="text" placeholder="请输入自定义标签" 
			maxlength="6"
			v-model="customTag"
			cursor-spacing="15"
			@confirm="tagConfirm"
			@blur="tagTrue = false"
			focus>
		</view>
	</view> -->
<view class="Custom-tag" v-if="tagTrue" @click="tagTrue = false">
		<view @click.stop="">
			<input type="text" placeholder="请输入自定义标签" 
			maxlength="6"
			v-model="customTag"
			cursor-spacing="15"
			@blur="tagTrue = false"
			focus>
			<button @click="tagConfirm" class="custom-btn">确认</button>
		</view>
	</view>
	<!-- 选择发图文或视频 -->
	<view class="video-image" v-if="showSelect">
		<view>
			<text @click="uploadImage(9,'image')">发图文</text>
			<text @click="uploadImage(1,'video')">发视频</text>
		</view>
	</view>
	<!-- 上传中或上传成功提示 -->
	<view class="uoload-view" v-if="uploadCourse">
		<progress activeColor="#f8d957"
		:percent="percEnt" active stroke-width="20" duration="10"
		 border-radius="4"
		 active-mode="forwards"
		/>
		<text class="upload-Progress-tips">{{uploadTips}}</text>
		<view class="upload-Thankyou">
			<text>感谢你的分享</text>
			<image :src="previewImage" mode="aspectFill"></image>
			<text v-if="uploadComplete" @click="uploadCourse = false">完成</text>
		</view>
	</view>
	<view style="height: 300rpx;"></view>
</template>

<script setup>
	import {reactive, ref,watchEffect} from 'vue'
	import {onLoad} from '@dcloudio/uni-app'
	import {requestApi} from '@/api/request.js'
	import {upLoadCos} from '@/api/cos.js'
	// 显示//隐藏文件选择弹窗
	const showSelect = ref(true)
	// 文章标题
	const title = ref('')
	// 文章内容
	const describe = reactive({value:''})
	// 存储图片或视频
	const fileList = ref([])
	// 判断上传的是图片还是视频
	const fileType = ref('image')
	// 取出一张图片作为上传的展示
	const previewImage = ref('')
	
	
	const categories = ['学习', '娱乐', '义工', '分享', '其他'];
	
	const multiArray = ref([
	        ['四院', '三院','二院','一院','N系','E系','其他'],
	        ['何鸿燊东亚书院', '满珍纪念书院', '蔡继有书院','霍英东珍禧书院']
	      ]) 
		  
	const multiIndex = ref([0, 0]);
	const poiname = ref('');
	const other_poiname = ref('');
	function pickerChange(e) {
	      const { value } = e.detail;
	      multiIndex.value = value; // 更新索引
		  poiname.value = `${multiArray.value[1][value[1]]}`;
	    }
    function columnChange(e) {
		switch(e.detail.column){
			case 0 :
		switch (e.detail.value){
			case 0:  
			multiArray.value = ([
			        ['四院', '三院','二院','一院','N系','E系','其他'],
			        ['何鸿燊东亚书院', '满珍纪念书院', '蔡继有书院','霍英东珍禧书院']
			      ]) 
			break;
			case 1:
			    multiArray.value = ([
			            ['四院', '三院','二院','一院','N系','E系','其他'],
			            ['曹光彪书院', '郑裕彤书院', '吕志和书院']
			          ]);
			break;
			case 2:
			multiArray.value =( [
			            ['四院', '三院','二院','一院','N系','E系','其他'],
			            ['马万祺罗柏心书院', '张昆仑书院']
			          ]);
			break;
			case 3:
			multiArray.value =( [
			            ['四院', '三院','二院','一院','N系','E系','其他'],
			            ['绍邦书院']
			          ]);
			break;
			case 4:
			multiArray.value =( [
			           ['四院', '三院','二院','一院','N系','E系','其他'],
			            ['N1聚贤楼', 'N2大学会堂','N6行政楼','N8体育馆','N9运动场','N21电子信息大楼',
						'N22中医药大楼','N23能源环境大楼']
			          ]);
			break;
			case 5:
			multiArray.value =( [
			           ['四院', '三院','二院','一院','N系','E系','其他'],
			            ['E1大学展馆', 'E2图书馆','E11科技学院','E12健康科学学院','E21人文社科楼',
						'E31学生活动中心','E32法学院','E33教育学院']
			          ]);
			break;
			case 6:
			multiArray.value =( [
			           ['四院', '三院','二院','一院','N系','E系','其他'],
			            ['其他']
			          ]);
			break;
			break;
		}
		}
	}
		
	// 选择种类
	const category = ref("")
	function pickerChangeCategory(event){
		category.value = categories[event.detail.value]
	}
	// 上传图片或视频
	async function uploadImage(count = 9,type = 'image',poster = '001'){
		wx.showLoading({title: '上传中',mask:true})
		wx.chooseMedia({
		  count,
		  mediaType: [type],
		  sizeType:['compressed'],
		  sourceType: ['album'],
		  success:async(res)=> {
			if(poster === '001'){
				fileType.value = res.type
				if(res.type === 'video'){
					if(res.tempFiles[0].size > 31457280){
						wx.showToast({
						  title: '视频文件太大',
						  icon: 'none',
						  duration: 1000
						})
						return false
					}
				}
				res.tempFiles.forEach(item=>{
					fileList.value.push(item)
				})
				showSelect.value = false
			}else{// 如果上传了视频封面图
				fileList.value[0].thumbTempFilePath = res.tempFiles[0].tempFilePath
			}
			previewImage.value = fileType.value === 'image' ? fileList.value[0].tempFilePath : fileList.value[0].thumbTempFilePath
			wx.hideLoading()
		  },
		  fail:(err)=>{
			wx.hideLoading()
		  }
		})
	}
	// 删除指定的图片,视频
	function beforeDelete(index){
		fileList.value.splice(index,1)
	}
	// 如果存储的文件为空数组，则弹出上传选择框
	watchEffect(()=>{
		if(fileList.value.length <= 0){
			showSelect.value = true
		}
	})
	
	
	// 推荐标签
	const recLabel = ref([])
	// 我选中的标签
	const myLabel = ref([])
	// 设置可以添加几个标签
	const numberTags = ref(10)
	// 自定义标签
	const customTag = ref('')
	// 自定义标签弹窗:显示||隐藏
	const tagTrue = ref(false)
	// 写文章失去焦时触发：分析文章关键词
	async function blurEvent(event){
		if(describe.value == '')return false
		const res = await requestApi('/article-keyword', {text:describe.value},'POST');
		console.log(res);
		if(res.data.length > 0){
			res.data.forEach(item=>{
				if (!recLabel.value.some((el) => el.name === item)) {
				    recLabel.value.push({name:item,active:false});
				}
			})
		}
	}
	function getStyle(item){
		return{
			'color': item.active ? '#ffffff' : '#000000',
			'background-color':item.active ? '#ec6f97' : '#f3f4f6'
		}
	}
	// 添加标签
	function addTag(tag) {
		if(myLabel.value.length >= 10){
			wx.showToast({title: '最多只能添加10个标签',icon: 'none',duration: 800})
			return
		}
		if (!tag.active) {
			myLabel.value.push(tag.name);
			// 设置标签为选中状态
			tag.active = true;
		}
	}
	// 删除标签
	function close(index,tag){
		myLabel.value.splice(index,1)
		// 设置标签为未选中状态
		const recTag = recLabel.value.find((item) => item.name === tag);
		if (recTag) {
		  recTag.active = false;
		}
	}
	// 选择自定义标签触发
	function tagConfirm(){
		tagTrue.value = false
		if(myLabel.value.length >= 10){
			wx.showToast({title: '最多只能添加10个标签',icon: 'none',duration: 800})
			return
		}
		if(customTag.value == '')return
		const res_a = myLabel.value.find(item=>item === customTag.value)
		if(res_a){
			wx.showToast({title: '相同标签只能存在一个',icon: 'none',duration: 800})
			return false
		}
		const res_b = recLabel.value.find(item=>item.name === customTag.value)
		if(res_b){
			wx.showToast({title: '推荐标签已存在',icon: 'none',duration: 800})
			return false
		}
		myLabel.value.push(customTag.value);
	}
	// 监听必填值是否填写完毕
	const disabled = ref(true)
	watchEffect(()=>{
		const hasData = title.value && category.value&& describe.value && fileList.value.length > 0 && myLabel.value.length > 0;
		disabled.value = hasData ? false : true
	})
	// 发布
	const uploadCourse = ref(false)//显示隐藏上传提示页面
	const uploadTips = ref('上传中...请勿退出该页面')
	const uploadComplete = ref(false)//显示隐藏完成按钮
	const percEnt = ref(80)//进度
	async function reLease(){
		// 登录校验
		await requestApi('/check-login');
		uploadComplete.value = false
		percEnt.value = 80
		uploadTips.value = '上传中...请勿退出该页面'
		uploadCourse.value = true
		if(poiname.value === '其他'){
			poiname.value = other_poiname.value;
		}
		// 判断上传图片还是视频类型
		if(fileType.value === 'image'){//图片
			try{
				const upLoadRes = await upLoadCos(fileList.value)
				
				const param = {
					title:title.value,
					content:describe.value,
					image:upLoadRes,
					address:poiname.value,
					tag:myLabel.value,
					category:category.value
				}
				await requestApi('/article-publish', param,'POST');
				clearData()
			}catch(err){
				uploadTips.value = '上传失败！'
				uploadComplete.value = true
				clearData()
			}
		}else{//视频
			try{
				// 1先上传封面图2上传视频
				const upLoadPost = await upLoadCos([
					{tempFilePath:fileList.value[0].thumbTempFilePath}
				])
				const upLoadVideo = await upLoadCos(fileList.value)
				const param = {
					title:title.value,
					content:describe.value,
					address:poiname.value,
					category:category.value,
					tag:myLabel.value,
					videoPoster:upLoadPost[0],
					videoUrl:upLoadVideo[0],
					videoWidth:fileList.value[0].width,
					videoHeight:fileList.value[0].height
				}
				await requestApi('/article-publish-Video', param,'POST');
				clearData()
			}catch(err){
				uploadTips.value = '上传失败！'
				uploadComplete.value = true
			}
		}
	}
	// 上传成功清空数据
	function clearData(){
		title.value = ''
		describe.value = ''
		category.value = ''
		poiname.value = ''
		other_poiname.value = ''
		myLabel.value = []
		recLabel.value = []
		fileList.value = []
		uploadTips.value = '上传成功'
		uploadComplete.value = true
		percEnt.value = 100
	}
</script>

<style scoped>
	.custom-btn {
	  position: fixed; /* Use fixed positioning */
	  top: 90%; /* Position the button halfway down the viewport */
	  left: 73%; /* Position the button halfway across the viewport */
	  width: 80px;
	  height: 40px;
	  color: #fff;
	  font-family: 'Lato', sans-serif;
	  font-weight: 500;
	  background: linear-gradient(135deg, #ff896b 0%, #ff62a5 100%);
	  border: none;
	  border-radius: 20px;
	  cursor: pointer;
	  transition: all 0.3s ease;
	  outline: none;
	  display: inline-block;
	  text-align: center;
	  line-height: 40px; /* Adjust line height to vertically center the text */
	  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}
	
	.custom-btn:hover {
	  background: linear-gradient(135deg, #ff62a5 0%, #ff896b 100%);
	  box-shadow: 0 6px 9px rgba(0, 0, 0, 0.15);
	}
	
	.custom-btn:active {
	  background: linear-gradient(135deg, #ff62a5 0%, #ff896b 100%);
	  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
	}

.publish-button{
	display: flex;
	justify-content: flex-end;
	padding: 20rpx;
}
.publish-button button{
	width: 200rpx;
	height: 70rpx;
	line-height: 70rpx;
	font-size: 30rpx;
	margin: 0 !important;
}
.fillout-input{
	margin: 0 20rpx;
	padding: 30rpx 0;
	border-bottom: 2rpx solid #f2f2f2;
}
.fillout-input textarea{
	width: 100%;
}
.video-view{
	position: relative;
}
.video-view video{
	width: 100%;
}
.video-view text{
	position: absolute;
	left: 0;
	top: 0;
	background-color: rgb(0, 0, 0,0.3);
	padding: 10rpx 20rpx;
	color: #ffffff;
}
.init-uploader{
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-gap: 6rpx;
}
.init-uploader view{
	height: 170rpx;
	overflow: hidden;
	position: relative;
}
.init-uploader image:nth-child(1){
	width: 100%;
	height: 170rpx;
}
.delete-Img{
	position: absolute;
	width: 40rpx;
	top: -8rpx;
	right: -8rpx;
}
.vanTag{
	margin: 20rpx 20rpx 0 0;
	border-radius: 40rpx;
	padding: 7rpx 22rpx;
}
.selectTag{
	color: #ffffff;
	background-color: #ec6f97;
}
.customizeTag{
	color: rgb(236, 111, 151);
	border: 2rpx solid rgb(236, 111, 151);
	border-radius: 40rpx;
	padding: 7rpx 22rpx;
	margin: 20rpx 20rpx 0 0;
}
.tag-Text{
	color: #bbb;
	font-size: 32rpx;
	font-weight: bold;
}
.personal-view text{
	width: 150rpx;
	font-size: 32rpx;
	font-weight: bold;
}
.personal-view image{
	width: 30rpx;
}
.personal-view input,picker{
	flex: 1;
	color: #ffd01e;
	font-weight: bold;
}
.video-image{
	position: fixed;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	background-color: rgb(0, 0, 0,0.7);
	z-index: 99;
}
.video-image view{
	height: 350rpx;
	background-color: azure;
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	border-top-left-radius: 40rpx;
	border-top-right-radius: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.video-image text{
	background-color: #f8d957;
	font-size: 30rpx;
	text-align: center;
	display: inline-block;
	padding: 20rpx 150rpx;
	margin: 20rpx 0;
	border-radius: 40rpx;
}
.Custom-tag input{
	background-color: #f2f2f2;
	height: 100rpx;
	border-radius: 10rpx;
	padding: 0 10rpx;
}
/* 上传中提示 */
.uoload-view{
	position: fixed;
	top: 0;
	bottom: 0;
	right: 0;
	left: 0;
	background-color: rgba(217, 139, 184, 0.9) !important;
	backdrop-filter: blur(5rpx);
	z-index: 999;
	padding: 10rpx;
}
.upload-Progress-tips{
	text-align: center;
	padding: 20rpx 0;
	color: #ffffff;
}
.upload-Thankyou{
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 160rpx;
	color: #ffffff;
}
.upload-Thankyou image{
	width: 300rpx;
	height: 300rpx;
	border-radius: 30rpx;
	margin: 50rpx 0;
}
.upload-Thankyou text:nth-child(1){
	font-size: 45rpx;
	font-weight: bold;
}
.upload-Thankyou text:nth-child(3){
	background-color: #f8d957;
	border-radius: 10rpx;
	padding: 15rpx 100rpx;
	color: #333;
	font-size: 35rpx;
}
.uoloadErr{}
</style>