/*
	Title:定位失败
	Author:suning
	Date:2015.9.27
	Description:
		自动定位失败，单击选择地址跳转到手动选择地址界面
 */
Mo.ready(function(M){

	// 接口
	var url={
		 GoBack: M.one("#hidWapGoBackUrl").getAttr("value")+"?referrer"+document.referrer, // 回上一页
		ManualLocationAddress:M.one("#hidLocationAddressManualUrl").getAttr("value"), // 手动定位页面地址
		GoHome: M.one("#hidHomeUrl").getAttr("value"), // 回主页
	};

	// DOM元素
	var dom={
		go_home: M.one(".opc"), // 首页
		go_back:M.one(".back"), // 返回上一页
		select_address:M.role("select-address"), // 选择地址
		img_failure:M.one(".none img")
	};

	// 事件
	dom.select_address.on("click", function(e){
		window.location.href=url.ManualLocationAddress;
	});
	dom.img_failure.on("click", function(e){
		window.location.href=url.ManualLocationAddress;
		e.halt();
	});

	// 定位失败，返回 跳转到首页
	dom.go_back.on("click", function(e){
		window.location.href= url.GoHome;
	});
	dom.go_home.on("click", function(e){
		window.location.href= url.GoHome;
	});
});