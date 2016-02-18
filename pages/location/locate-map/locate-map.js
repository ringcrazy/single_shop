/*
    Title:地图定位页面
    Author:suning
    Date:2015.9.29
    Desecription:
        进入页面进行自动定位，
            若定位不成功，根据IP进行定位，地图视野为当前城市
            若定位成功，打点显示，并显示当前定位地址
        地图打点定位页面，长按打点，点击 确定后跳转到来源页
 */
//@require location,localstorage,cookie
Mo.ready(function(M) {

    // 接口
    var url = {
        GoBack: "/location/manual", // 回上一页
        GeoAddress: "/location/createLocation", // 将经纬度数据传递给后台
    };

    // 依赖项
    var map = new BMap.Map("map"), // 地图实例
        geoc = new BMap.Geocoder(), // 地址解析器的实例
        localCity = new BMap.LocalCity(), // 获取本地城市位置的实例
        lo = M.Location,
        cookie=M.Cookie,
        local = M.LocalStorage;

    // DOM元素
    var dom = {
        locator: M.one(".locator"), // 定位按钮
        go_back: M.one(".back"), // 返回上一页面
        locate_text: M.one(".address-text"), // 定位信息
        unlocate_footer: M.one(".footer-init"), // 未定位时Footer显示的信息
        locate_footer: M.one(".footer-active"), // 定位成功后Footer显示的信息
        btn_confirm: M.one(".btn-confirm") // 确定按钮
    };

    // 变量
    var timer, // 计时器
        prefix = "history_address", // 存放历史地址的指定key值
        isZooming = false, // 正在缩放中
        isMoving = false, // 正在移动中
        longPressPoint = null, // 长按时，存储点的信息
        marker, // 标注
        city, // 城市
        district, // 区域
        street, // 街道
        streetNumber, // 街道名称
        addr, // 详细地址
        lng, // 纬度
        lat; // 经度

    // 方法
    // 获取所在城市
    var getLocatedCity = function(res) {
        var cityName = "";
        if (res) {
            cityName = res.name;

            // 初始化地图，用城市名设置地图中心点
            map.centerAndZoom(cityName, 11);
        }
    };

    // 成功回调
    var handle_success = function(point) {
        var pt = new BMap.Point(point.lng, point.lat);
        map.centerAndZoom(pt, 15);
        geoc.getLocation(pt, handle_translate); // 解析坐标
        marker = new BMap.Marker(point); // 创建标注
    };

    // 失败回调
    var handle_failure = function(msg) {
        dom.unlocate_footer.removeClass("d-none");
        dom.locate_footer.addClass("d-none");
        dom.unlocate_footer.one('span').setText("定位失败，在地图上长按选择地址");

        // 删除地图上所有标注
        map.clearOverlays();

        // 获取所在城市
        localCity.get(getLocatedCity);
    };

    // 地址转换后的回调
    var handle_translate = function(rs) {
        var addrComp = rs.addressComponents;
        addr = rs.address;
        city = addrComp.city,
        district= addrComp.district,
        province= addrComp.province,
        street=addrComp.street,
        streetNumber=addrComp.streetNumber,
            lat = rs.point.lat,
            lng = rs.point.lng;
        dom.unlocate_footer.addClass("d-none");
        dom.locate_footer.removeClass("d-none");
        dom.locate_text.one("span").setText(addr);

        // 删除地图上所有标注
        map.clearOverlays();

        // 添加新标注
        map.addOverlay(marker);
    };

    // 长按事件
    var longPressEvent = function(e) {
        if (isZooming || isMoving) {
            return;
        }
        longPressPoint = e.point;
        marker = new BMap.Marker(longPressPoint);

        geoc.getLocation(longPressPoint, handle_translate);
    };

    // 长按事件、处理缩放时定位、打点完成后地图自动居中、地图移动时不定位
    map.addEventListener("longpress", longPressEvent);
    map.addEventListener("zoomstart", function() {
        isZooming = true;
    });
    map.addEventListener("zoomend", function() {
        setTimeout(function() {
            isZooming = false;
        }, 3000);
    });
    map.addEventListener("touchend", function() {
        isMoving = false;
        if (longPressPoint != null) {
            setTimeout(function() {
                map.panTo(longPressPoint);
                longPressPoint = null;
            }, 200);

        }
    });
    map.addEventListener('touchmove', function(e) {
        isMoving = true;
    });

    // 点击定位
    dom.locator.on("click", function() {
        dom.unlocate_footer.removeClass("d-none");
        dom.locate_footer.addClass("d-none");
        dom.unlocate_footer.one('span').setText("正在定位中，请稍候...");
        lo.getPosition(handle_success, handle_failure, "baidu");
    });

    // 返回上一页面
    dom.go_back.on("click", function() {
        window.location.href = url.GoBack;
    });

    // 确定按钮 事件
    dom.btn_confirm.on('click', function() {

        // 保存到后端
        M.xPost({
            url: url.GeoAddress,
            data: {
                lng: lng,
                lat: lat,
                locationtype: 1 // 定位地址
            },
            method: 'GET',
            on: {
                success: function(data, config) {
                    // 保存到localStorage
                    local.addItem(prefix, {
                        city: city,
                        district:district,
                        street: street,
                        streetNumber:streetNumber,
                        province:province,
                        address: addr
                    });
                    goBack();
                },
                failure: function(data, config) {}
            }
        });

    });

    // 返回上级页面
    var goBack = function() {

        var backUrl = cookie.get("locate_redirect_url");
        window.location.href = backUrl;
    };

    // 程序入口
    lo.getPosition(handle_success, handle_failure, "baidu");

});
