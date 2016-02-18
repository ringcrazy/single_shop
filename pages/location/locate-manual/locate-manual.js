/*
    Title:定位页面
    Author:suning
    Date:2015.9.28
    Description:
        1.点击 定位当前地址，根据手机浏览器坐标进行定位
            1.1定位成功：转到上级页面，并将定位地址写入localstorage中，并加入“历史定位”中
            1.2定位失败：提示定位失败
        2.文本框中输入关键字进行定位
            2.1定位成功：从列表中选择一项，执行1.1
            2.2定位失败：提示，没找到匹配的地址
        3.地图按钮
            3.1跳转到地图定位页面
 */
//@require location,localstorage,cookie,confirm,template,_pages
Mo.ready(function(M) {
    // 接口
    try {
        var url = {
            GetAddressByKey: "http://map.baidu.com/su?callback=?",
            GoBack: "/waimai", // 回上一页
            GeoAddress: "/location/createLocation", // 将经纬度数据传递给后台
            GoMap: "/location/map",
            SetAddress: "/location/createLocationAddress", // 将地址信息传递给后台
            GetAddressList: "/address/adrlist", // 获取收餐地址列表
            NewAddress:"/location/newaddress" // 跳转至新增地址页面
            //WhetherLocateOrNot: M.one("#hidIsLoadingLocalAddressModel").getAttr("value") == "True", // 判断是否需要定位
            // LocateFailureAddress: M.one("#hidLocationAddressFailureUrl").getAttr("value") + "?title=" + M.one("#hidTitle").getAttr("value"), // 定位失败页面地址
        };
    } catch (e) {
        // console.log("接口错误！");
    }


    // 依赖项
    var lo = M.Location,
        local = M.LocalStorage,
        cookie = M.Cookie,
        geoc = new BMap.Geocoder();

    // DOM元素
    var dom = {
        go_back: M.one(".back"), // 转到上一页面
        go_map: M.one(".opc"), // 转到地图页面
        search_input: M.role("search-input"), // 搜索框
        search_list: M.role("search-list"), // 搜索结果列表
        search_close: M.role("search-close"), // 搜索结果 关闭
        locate: M.role("locate"), // 定位当前地址
        locate_close: M.role("locate-close"), // 删除文本框内容
        icon_locate: M.role("icon-locate"), // 定位按钮
        icon_loading: M.role("icon-loading"), // 加载中按钮
        locate_text: M.role("locate-text"), // 定位地址 文本
        history_list: M.role("history-list"), // 历史记录 外层容器
        history_delete: M.role("history-delete"), // 删除所有历史记录
        status_loading: M.one(".status-loading"), // 加载中状态
        status_nodata: M.one(".status-nodata"), // 未匹配到数据状态
        status_error: M.one(".status-error"), // 请求错误状态
        deliver_list:M.role("delivery-address"), // 历史收货地址容器
        delivery_address_list: M.one(".delivery-address-list"), // 历史收货地址
        new_address:M.one(".new-address"), // 新增地址
        loading:M.one(".ajaxloading") // 加载中 提示
    };

    // 变量
    var isLocated = false, // 已经执行定位操作
        keyUpLoadingFinished = true, // 请求已经结束
        prefix = "history_address"; // 存放历史地址的指定key值

    // 方法
    // 1.成功 回调
    var handle_success = function(point) {
        geoc.getLocation(new BMap.Point(point.lng, point.lat), handle_translate);
    };

    // 2.失败 回调
    var handle_failure = function(msg) {
        dom.icon_loading.addClass("d-none");
        dom.icon_locate.removeClass("d-none");
        dom.locate_text.setHTML("定位失败，请在网络良好的时候重试");
    };

    // 3.解析地址 回调
    var handle_translate = function(rs) {
        if (isLocated) {
            var addrComp = rs.addressComponents,
                address = rs.address,
                lng = rs.point.lng,
                lat = rs.point.lat;

            dom.icon_loading.addClass("d-none");
            dom.icon_locate.removeClass("d-none");

            saveGeoAddress(lng, lat, {
                province: addrComp.province,
                address: address,
                city: addrComp.city,
                district: addrComp.district,
                street: addrComp.street,
                streetNumber: addrComp.streetNumber
            }, "1");
        }
    };

    // 4.键盘按下 事件
    var handle_keyup = function(e) {

        // 隐藏定位按钮及历史记录
        dom.locate.addClass("d-none");
        dom.history_list.addClass("d-none");
        dom.deliver_list.addClass("d-none");

        // 文本框内容为空字符串时 隐藏搜索记录、删除文本按钮
        if (dom.search_input.get("value") == "") {
            dom.search_list.addClass("d-none");
            dom.locate_close.addClass("d-none");

            // 显示定位按钮及历史记录
            dom.locate.removeClass("d-none");
            dom.deliver_list.removeClass("d-none");
            var historyList = local.getItem(prefix);
            if (historyList && historyList.length > 0) {
                dom.history_list.removeClass("d-none");
            }
            return;
        }

        // 状态控制
        dom.status_nodata.addClass("d-none");
        dom.status_loading.removeClass("d-none");
        dom.status_error.addClass("d-none");
        dom.search_list.removeClass("d-none");
        dom.search_list.one("ul").empty();
        dom.locate_close.removeClass("d-none");

        // ajax请求
        if (keyUpLoadingFinished) {
            M.xPost({
                url: url.GetAddressByKey,
                data: {
                    type: 0,
                    wd: dom.search_input.get("value"),
                    cid: 131,
                    t: new Date().getTime()
                },
                method: 'get',
                on: {
                    complete: function(data, config) {

                        // success
                        if (data) {
                            keyUpLoadingFinished = true;
                            dom.status_error.addClass("d-none");
                            dom.status_loading.addClass("d-none");
                            var addressData = data.s;
                            if (addressData.length <= 0) {
                                dom.status_nodata.removeClass("d-none");
                                return;
                            }

                            var lis = '',
                                i = 0,
                                l = addressData.length;
                            for (; i < l; i++) {
                                var arrlist = addressData[i].split("$"),
                                    city = arrlist[0],
                                    district = arrlist[1],
                                    street = arrlist[2],
                                    streetNumber = arrlist[3];
                                if (city !== "" && district !== "") {
                                    lis += '<li>' +
                                        '<section>' +
                                        '<div class="addr-text"' +
                                        'data-city="' + arrlist[0] + '" ' +
                                        'data-district="' + arrlist[1] + '" ' +
                                        'data-street="' + arrlist[2] + '" ' +
                                        'data-streetNumber="' + arrlist[3] + '" ' +
                                        'data-address="' +
                                        arrlist[0] + arrlist[1] + arrlist[2] + arrlist[3] + '"><h3 class="street">' + street + streetNumber + '</h3>' +
                                        '<div class="city">' + city + " " + district + '</div>' +
                                        '</div>' +
                                        '</section>' +
                                        '</li>';
                                }

                            }
                            dom.search_list.one("ul").empty().append(lis).removeClass("d-none");
                            dom.search_list.removeClass("d-none");

                            // 绑定事件
                            dom.search_list.one("ul").all("li").on("click", function() {
                                var addr = this.one('.addr-text');
                                var city = addr.getAttr("data-city"),
                                    district = addr.getAttr('data-district'),
                                    street = addr.getAttr('data-street'),
                                    streetNumber = addr.getAttr('data-streetNumber'),
                                    address = addr.getAttr('data-address');
                                dom.locate_close.addClass("d-none");

                                // 保存至后台
                                saveAddress({
                                    province: "",
                                    city: city,
                                    district: district,
                                    street: street,
                                    streetNumber: streetNumber,
                                    address: address
                                });
                            });
                        }

                        // failure
                        else {

                            // M.tips('无法解析此地址');
                        }
                    }

                }
            });
        }
    };

    // 5.搜索历史记录
    var handle_localstorage = function() {
        var dom_localstorage_list = "";
        var historyList = local.getItem(prefix);

        // 存在搜索历史记录
        if (historyList && historyList.length > 0) {
            var len = historyList.length > 30 ? 30 : historyList.length;
            for (var i = 0; i < len; i++) {
                var street = historyList[i].street == undefined ? "" : historyList[i].street,
                    address = historyList[i].address == undefined ? "" : historyList[i].address,
                    province = historyList[i].province == undefined ? "" : historyList[i].province,
                    city = historyList[i].city == undefined ? "" : historyList[i].city,
                    district = historyList[i].district == undefined ? "" : historyList[i].district,
                    streetNumber = historyList[i].streetNumber == undefined ? "" : historyList[i].streetNumber;
                dom_localstorage_list +=
                    '<li data-street="' + street +
                    '" data-address="' + address +
                    '" data-province="' + province +
                    '" data-city="' + city +
                    '" data-district="' + district +
                    '" data-streetNumber="' + streetNumber + '">' +
                    '<section><div class="addr-text"><h3 class="street">' + street + streetNumber + '</h3><div class="city">' + city + " " + district + '</div></div><div class="addr-icon-box"><div class="addr-icon" >' +
                    '<i class="m-icon i-close"></i></div></div></section></li>';
            }
            dom.history_list.one("ul").empty().append(dom_localstorage_list);
            dom.history_list.removeClass("d-none");

            // 绑定事件
            dom.history_list.one("ul").all("li").on("click", function(e) {
                var address = this.getAttr("data-address"),
                    province = this.getAttr('data-province'),
                    city = this.getAttr("data-city"),
                    district = this.getAttr('data-district'),
                    street = this.getAttr("data-street"),
                    streetNumber = this.getAttr('data-streetNumber');

                // 删除单条历史记录
                if (e.srcElement.nodeName == "I" || e.srcElement.className == "addr-icon" || e.srcElement.className == "addr-icon-box") {

                    local.deleteValue(prefix, address);
                    this.remove();
                    if (!(local.getItem(prefix) && local.getItem(prefix).length > 0)) {
                        dom.history_list.addClass("d-none");
                    }
                    e.halt();
                } else {

                    // 保存历史信息
                    saveAddress({
                        address: address,
                        province: province,
                        city: city,
                        district: district,
                        street: street,
                        streetNumber: streetNumber
                    });
                }
            });

            // 清除所有搜索记录
            dom.history_delete.on("click", function() {
                if (confirm("清除全部历史记录？")) {
                    local.removeItem(prefix);
                    dom.history_list.one("ul").empty();
                    dom.history_list.addClass("d-none");
                }
            });

        }
    };

    // 6.处理收餐地址列表
    var handle_addressList = function() {
        M.xPost({
            url: url.GetAddressList,
            on: {
                success: function(data, config) {

                    

                    // 已登录
                    if (data.state && data.data.length > 0) {
                        // 展示
                        dom.deliver_list.removeClass("hide");
                        
                        var string_deliverylist = M.Template.get('_pages.location-manual-addresslist')(data);
                        dom.delivery_address_list.prepend(string_deliverylist);

                        // 绑定点击事件
                        dom.delivery_address_list.all("li").on("click", function(e) {
                            var address = this.one(".address").getText();
                            dom.loading.removeClass("hide");
                            M.xPost({
                                url: url.SetAddress,
                                data: {
                                    address:address,
                                    locationtype: 2 // 定位地址
                                },
                                method: 'GET',
                                on: {
                                    success: function(data, config) {
                                        dom.loading.addClass("hide");
                                        goBack();
                                    },
                                    failure: function(data, config) {
                                        dom.loading.addClass("hide");
                                    }
                                }
                            });
                        });
                    }
                    else if(data.state && data.data.length ==0){
                       var string_deliverylist = M.Template.get('_pages.location-manual-addresslist')({data:[{address1:"暂无历史送餐地址!"}]});
                        dom.delivery_address_list.prepend(string_deliverylist);
                    }
                    handle_localstorage();
                },
                failure: function(data, config) {
                    handle_localstorage();
                }
            }
        });
    };

    // 将地址信息保存至后台-包含经纬度
    var saveGeoAddress = function(lng, lat, addrObj, citySource) {
        dom.loading.removeClass("hide");
        // 将地址信息保存至后台
        M.xPost({
            url: url.GeoAddress,
            data: {
                lng: lng,
                lat: lat,
                locationtype: 1
            },
            method: 'GET',
            on: {
                success: function(data, config) {
                    dom.locate_text.setText(addrObj.address);
                    local.addItem(prefix, {
                        city: addrObj.city,
                        district: addrObj.district,
                        street: addrObj.street,
                        streetNumber: addrObj.streetNumber,
                        address: addrObj.address,
                        province: addrObj.province
                    });
                    dom.loading.addClass("hide");
                    goBack();
                },
                failure: function(data, config) {
                    dom.loading.addClass("hide");
                }
            }
        });
    };

    // 将地址信息保存至后台-不包含经纬度
    var saveAddress = function(addrObj) {
        dom.loading.removeClass("hide");
        M.xPost({
            url: url.SetAddress,
            data: {
                address: addrObj.address,
                locationtype: 1 // 定位地址
            },
            method: 'GET',
            on: {
                success: function(data, config) {

                    // 保存至localStorage
                    local.addItem(prefix, {
                        province: addrObj.province,
                        city: addrObj.city,     
                        district: addrObj.district,
                        street: addrObj.street,
                        streetNumber: addrObj.streetNumber,
                        address: addrObj.address
                    });
                     dom.loading.addClass("hide");
                    goBack();
                },
                failure: function(data, config) {
                     dom.loading.addClass("hide");
                }
            }
        });
    };

    // 返回到特定的页面（从哪里来回哪里）
    var goBack = function() {
        var backUrl = cookie.get("locate_redirect_url");
        window.location.href = backUrl;
    };

    // 事件处理
    // 定位当前地址
    dom.locate.on('click', function() {
        isLocated = true;
        dom.icon_locate.addClass("d-none");
        dom.icon_loading.removeClass("d-none");
        dom.locate_text.setHTML("定位中...");
        lo.getPosition(handle_success, handle_failure, "baidu");
    });

    // 输入框获得焦点 需阻止“定位当前地址”
    dom.search_input.focus(function() {
        isLocated = false;
        dom.icon_locate.removeClass("d-none");
        dom.icon_loading.addClass("d-none");
        dom.locate_text.setText("定位当前地址");
    });

    // 搜索文本框关闭按钮 事件处理
    dom.locate_close.on("click", function() {
        var historyList = local.getItem(prefix);
        dom.search_input.set("value", "");
        dom.search_list.addClass("d-none");
        this.addClass("d-none");
        dom.status_error.addClass("d-none");

        // 显示定位按钮及历史记录
        dom.locate.removeClass("d-none");
        dom.deliver_list.removeClass("d-none");
        if (historyList && historyList.length > 0) {
            dom.history_list.removeClass("d-none");
        }
    });

    // 搜索事件
    dom.search_input.on("keyup", handle_keyup);

    // 搜索地址 关闭
    dom.search_close.on("click", function() {
        var historyList = local.getItem(prefix);

        // 隐藏搜索结果
        dom.search_list.addClass("d-none");

        // 显示定位按钮及历史记录
        dom.locate.removeClass("d-none");
        dom.deliver_list.removeClass("d-none");
        if (historyList && historyList.length > 0) {
            dom.history_list.removeClass("d-none");
        }

        // 删除文本框中的标记
        dom.locate_close.addClass("d-none");
        dom.search_input.set("value", "");
    });

    // 转到上级页面
    dom.go_back.on("click", function() {

        if (url.WhetherLocateOrNot) {
            window.location.href = url.LocateFailureAddress;
        } else {
            window.location.href = url.GoBack;
        }

    });

    // 转到地图页面
    dom.go_map.on("click", function() {
        window.location.href = url.GoMap;
    });

    // 新增地址
    if(dom.new_address){
        dom.new_address.on("click", function(){
            window.location.href= url.NewAddress;
        });
    }

    // Execute
    // handle_localstorage();
    handle_addressList();

});
