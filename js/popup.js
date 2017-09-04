// 向被注入页面发送信息并处理回调
function sendMessage(jsonmsg, exec){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var tab = tabs[0];
		chrome.tabs.sendMessage(tab.id, jsonmsg, {}, function(res){
			if(res === undefined){
				$("#title").text("无法获取数据, 请确保在天猫商品详情页!");
				return false;
			}
			console.log(res);
			if(exec instanceof Function) exec(res);
		});
	});
}

// 确认popup页面与被注入页面能建立通信
function init(){
	sendMessage(JSON.stringify({"code":CODE_INIT, message:"init"}), function(res){
		$("#title").text("加载图片中...");
	});
}

$(function(){
	// 初始化
	init();
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log((sender.tab ? "from a content script:" + sender.tab.url : "from the extension")+", with: "+JSON.stringify(request));
		
		if(request.result == -1){
			$("#title").text(request.message + " 错误: " + JSON.stringify(request.data));
			sendResponse({result:1, message:"ok!", data:{}});
			return false;
		}
		
		$("#title").text("OK!");
		
		var subfolder = request.data.name.replace(/[\\\/\:\*\?"<>\|]/gi, "");
		for(var i = 0; i < request.data.banners.length; i++){
			chrome.downloads.download({
				url:request.data.banners[i],
				//filename:request.data.name.replace(/[\\\/\:\*\?"<>\|]/gi, "")+"/封面图/"+request.data.banners[i].substring(request.data.banners[i].lastIndexOf("/")+1, request.data.banners[i].length),
				filename:subfolder+"/封面图/"+i+""+request.data.banners[i].substring(request.data.banners[i].lastIndexOf("."), request.data.banners[i].length),
				conflictAction:"overwrite"
			}, function(downloadId){
				console.log(request.data.banners[i]+" -- 已下载!");
			});
		}
		
		for(var i = 0; i < request.data.descriptions.length; i++){
			chrome.downloads.download({
				url:request.data.descriptions[i],
				filename:subfolder+"/详情图/"+i+""+request.data.descriptions[i].substring(request.data.descriptions[i].lastIndexOf("."), request.data.descriptions[i].length),
				conflictAction:"overwrite"
			}, function(downloadId){
				console.log(request.data.descriptions[i]+" -- 已下载!");
			});
		}
		
		sendResponse({result:1, message:"ok!", data:{}});
	}
);