// 初始化主要对象
var TMGrabber = {
	// 初始化
	init: function(){
		// 滚动到底部, 避免懒加载导致图片并未加载
		var lastScrollTop = 0;
		const scrollToBottom = setInterval(function(){
			lastScrollTop = document.body.scrollTop;
			document.body.scrollTop += 100;
			if(lastScrollTop == document.body.scrollTop){
				clearInterval(scrollToBottom);
				//初始化数据对象
				data = {
					name:"",
					originalPrice:0,
					finalPrice:0,
					banners:[],
					descriptions:[]
				};
				
				try{
					// 获取商品名称、价格
					data.name = document.body.querySelectorAll(".tb-detail-hd > h1")[0].innerText;
					data.originalPrice = document.body.querySelectorAll("span.tm-price")[0].innerText;
					data.finalPrice = document.body.querySelectorAll("span.tm-price")[1].innerText;
					
					// banner图
					var banners = document.body.querySelectorAll("#J_UlThumb img");
					for(var i = 0; i < banners.length; i++){
						data.banners.push(banners[i].currentSrc.substring(0, banners[i].currentSrc.lastIndexOf("_")));
					}
					
					// 图片详情
					var descriptions = document.body.querySelectorAll("#description > .content img");
					for(var i = 0; i < descriptions.length; i++){
						data.descriptions.push(descriptions[i].currentSrc);
					}

					console.log(data);

					// 发消息开始下载
					chrome.runtime.sendMessage({result:1, message:"downloading...", data:data}, function(response) {
						console.log("TMGrabber -- "+response.message);
					});
				}catch(e){
					chrome.runtime.sendMessage({result:-1, message:"无法获取数据, 请确保在天猫商品详情页!", data:e}, function(response) {
						console.log("TMGrabber -- "+response.message);
					});
				}
			}
		}, 30);
	}
};

(function(){
	console.log("TMGrabber -- 初始化完成!");
})();

//注入页面消息接收端
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	//console.log(msg);
	var json = JSON.parse(msg);
	// 设置相应对象
	switch(json.code){
		// 初始化操作
		case CODE_INIT:{
			TMGrabber.init();
			sendResponse({result:1, message:"inited!", data:{}});
		}; break;
		default : console.error("未知操作");
	}
});
