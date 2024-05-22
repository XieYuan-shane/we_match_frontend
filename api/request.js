// http://127.0.0.1:8900/apif  
//http://119.28.202.161/apif
// const baseUrl = 'http://119.28.202.161/apif'; //换成自己的ip地址
const baseUrl = '';
import { Base64 } from 'js-base64';

// 对token加密
function encryptToken(){
	const {user_Token} = wx.getStorageSync('userInfor')//从本地缓存里取出token
	const auth = Base64.encode(user_Token + ':')//对token加密
	return 'Basic ' + auth
}
// 提示
function showToast(title){
	wx.showToast({
		title,
		icon: 'none',
		duration: 1000,
	});
}
// 请求
function requestApi(url,data={},method = 'GET'){
	return new Promise((resolve, reject) => {
		uni.request({
			url: baseUrl + url,
			method,
			data,
			header: { Authorization: encryptToken() },
			success: (res) => {
				const status =  res.statusCode
				switch (status){
					case 200:
					resolve(res.data);
					wx.hideLoading()
					break;
					case 404:
					console.error('接口不存在')
					reject('404');
					wx.hideLoading()
					break;
					case 401:
					wx.navigateTo({ url: '/pages/Login-pop-up/login'});
					console.error('没有权限')
					reject('401');
					wx.hideLoading()
					break;
					case 500:
					console.error(res.data)
					showToast('发生异常错误');
					reject('500');
					wx.hideLoading()
					break;
					case 501:
					console.error(res.data)
					showToast('发生异常错误');
					reject('501');
					console.error(res.data)
					wx.hideLoading()
					break;
					case 502:
					console.error(res.data)
					showToast('发生异常错误');
					reject('502');
					wx.hideLoading()
					break;
					case 400:
					console.error(res.data.msg)
					reject('400');
					wx.hideLoading()
					break;
					case 422:
					showToast(res.data.msg);
					reject('422');
					wx.hideLoading()
					break;
				}
			},
			fail: (err) => {
				reject(err);
				wx.hideLoading()
			},
		});
	});
}
export { requestApi };