/*
	Title:会员入口
    Author:suning
    Date:2015.11.25
    Description: 
    	此页面为会员入口界面、及注册用户开通会员页面
 */
Mo.ready(function(M){

	var url ={
		// 注册会员
		MemberDiscount:"User/MemberDiscount", // 会员优惠
		AccountSetup:"/User/AccountSetup", // 账号设置
		CustomerCardList:"/User/CustomerCardList", // 账户余额
		PointsListIndex:"/User/PointsListIndex", // 积分明细
		CusetomerPromotionCoupons:"/User/CusetomerPromotionCoupons", // 优惠券
		AddressManagement:"/Address/AddressManagement", // 地址管理
		hidIsCRM:M.one("#hidIsCRM").getAttr("value"), // 判断是否为CRM
		hidIsMember:M.one("#hidIsMember").getAttr("value"),
		// 会员
		PersonInfo:"/User/PersonInfo", // 会员卡详情

	};

	var dom = {
		setting:M.role("account-set"),
		register:M.role("member-register"),
		point:M.one(".member-point"),
		balance:M.one(".member-balance"),
		coupon:M.role("coupon-list"),
		address:M.role("address-management"),
		detail:M.role("acount-detail")
	};


	// 账户设置
	dom.setting.on('click', function(){
		window.location.href= url.AccountSetup;
	});

	// 开通会员（会员优惠）
	if(dom.register){
		dom.register.on("click", function(){
		window.location.href = url.MemberDiscount;
	});	
	}
	
	// 会员详情
	if(dom.detail){
		dom.detail.on("click", function(){
		window.location.href= url.PersonInfo;
	});	
	}
	
	// 卡内积分
	dom.point.on("click", function(){
		if(url.hidIsCRM && !url.hidIsMember){
			return;
		}
		window.location.href= url.PointsListIndex;
	});

	// 余额
	dom.balance.on("click", function(){
		if(url.hidIsCRM && !url.hidIsMember){
			return;
		}
		window.location.href= url.CustomerCardList;
	});

	// 优惠券
	dom.coupon.on("click", function(){
		window.location.href= url.CusetomerPromotionCoupons;
	});

	// 地址管理
	dom.address.on("click", function(){
		window.location.href= url.AddressManagement;
	});

});