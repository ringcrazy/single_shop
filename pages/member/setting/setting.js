/*
	Title:账号设置
	Author：苏宁
	Date:2015.11.26

 */
Mo.ready(function(M) {

    var url = {
        GoBack: M.one("#hidWapGoBackUrl").getAttr("value")+"?referrer"+document.referrer, // 回上一页
        ModifyUserInfo: "/User/EditUserDetail", // 修改个人信息
        MemberRegister:"/User/Member", // 会员注册
        ModifyPassword: "/User/ModifyPassword", // 修改密码
        ModifyMobile:"/User/EditPhone", // 修改绑定手机号
        LogOut: "/Authen/Logout", // 退出登录
        Token: M.one("input[name='__RequestVerificationToken']").getAttr("value")
    };

    var dom = {
        go_back: M.one(".back"),
        modify_userinfo: M.role("modify-userinfo"),
        registe_member:M.role("member-registe"),
        modify_password: M.role("modify-password"),
        modify_mobile:M.role("change-mobile"),
        logout: M.role("logout")
    };

    // 回到上一页
    dom.go_back.on("click", function(e) {
        e.halt();
        window.location.href = url.GoBack;
    });

    // 修改个人信息
    if(dom.modify_userinfo){
    	dom.modify_userinfo.on('click', function(e) {
    		e.halt();
        window.location.href = url.ModifyUserInfo;
    });	
    }

    // 注册会员
    if(dom.registe_member){
    	dom.registe_member.on("click", function(){
    		window.location.href= url.MemberRegister;
    	});
    }
    

    // 修改密码
    dom.modify_password.on("click", function(e) {
    	e.halt();
        window.location.href = url.ModifyPassword;
    });

    // 修改绑定手机号
    dom.modify_mobile.on("click", function(e){
    	e.halt();
    	window.location.href= url.ModifyMobile;
    });

    // 退出登录
    dom.logout.on("click", function() {
            M.xPost({
                    url: url.LogOut,
                    method: 'GET',
                    on: {
                        success: function(data, config) {
                        	window.location.reload();
                        },
                        failure: function(data, config) {
                        	alert(data.Message);
                        }
                    }
                
            });
    });

});
