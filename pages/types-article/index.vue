<template>
	<card :userArticles="userUserArticles"/>
	<view style="height: 200rpx;"></view>
</template>

<script setup>
	import { ref } from "vue";
	import {onReachBottom,onLoad} from '@dcloudio/uni-app'
	import {requestApi} from '@/api/request.js'
	import card from '@/pages/Common-components/card-flow.vue'
	const userUserArticles = ref([])
	const articleQuery = ref({query:'',type:'',address:''})
	onLoad(async(event)=>{
		console.log(event);
		articleQuery.query = event.query
		articleQuery.type = event.type
		articleQuery.address = event.address
		wx.setNavigationBarTitle({title: event.query})
		await queryArticle()
	})
	async function queryArticle(page = 1){
		if(articleQuery.type == '001'){
			const res = await requestApi('/classifyArticles',{keywords:articleQuery.query,page})
			userUserArticles.value = [...userUserArticles.value,...res.data]
		}else{
			const res = await requestApi('/addressqueryArticles',
			{address:articleQuery.address,
			keywords:articleQuery.query,page})
			userUserArticles.value = [...userUserArticles.value,...res.data]
		}
	}
	// 上拉加载
	const page = ref(1)
	onReachBottom(async()=>{
		page.value++
		await queryArticle(page.value)
	})
</script>

<style>
</style>