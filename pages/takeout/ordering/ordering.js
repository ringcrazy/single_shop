/*
    Title:外卖-点菜页
    Author:suning
    Date:2015.12.17
    Description: 
        1.页面加载时，进行定位，
            定位成功或手动更改地址后，会进行超区和打烊的提示
            若定位失败，只会进行打烊的提示
        2.定位逻辑完成后，判断是否存在购物车缓存信息
        3.若存在，更新菜品分类、菜品、购物车
        4.若不存在，获取菜品分类，执行事件绑定
        5.滑动时，滑动到某一菜品分类临界值时，需要去请求下一菜品数据

 */
//@require jscroll,amount-plugin,mask,confirm,swiper,template,inscreen,location,localstorage,_pages,cookie,dialog
Mo.ready(function(M) {



    // DOM元素
    var DOM_categoryWrap = M.one('.nav-lst'), // 左侧 菜品分类容器
        DOM_currentCategory, // 左侧 当前选中的分类
        DOM_FOOD = M.one('.menu-lst'), // 右侧 菜品列表容器
        DOM_locateAddressWrap = M.role("l-address"), // 地址容器
        DOM_modifyAddress = M.one(".change"); // 更改地址
    // 购物车数量和价格 容器
    var dishDom = {
        numDom: M.one('.shop-cart').one('.pubr'),
        priceDom: M.one('.subtotal').one('em'),
        deliveryDom: M.one('.subtotal').one("p")
    };

    // 变量
    var categoryScroll, // 菜品分类scroll
        foodScroll, // 菜品scroll
        currentCategory, // 当前活动状态下，菜品类别
        currentDish, // 当前活动状态下，菜品

        //当前选中的菜品及菜单;
        selectFoods = [],
        selectMenus = [],
        foodlist = {},

        // 菜品的高度和距页面顶端距离
        dishListHeight,
        dishListTop,

        // 购物车数据
        shopCartData,

        // 设备宽、高
        deviceHeight = M.one('body').get('region').height,
        deviceWidth = M.one('body').get('region').width;

    // 接口
    try {
        var url = {
            GetCategoryList: "/waimai/categorylist", // 获取菜品分类
            GetDishList: "/waimai/dishlist", // 根据分类Id获取菜品
            GetShoppingCart: "/waimai/mycart", // 获取购物车
            AddDish: "/waimai/adddish", // 添加菜品
            ClearCartDish: "/waimai/clearcart", // 清除购物车
            WhetherLocateOrNot: "/location/isLoadingLocalAddress", // 判断是否需要定位
            CreateLocation: "/location/createLocation", // 保存经纬度信息
            CreateLocationAddress: "/location/createLocationAddress", // 保存地址信息
            IsInDeliveryScope: "location/IsInDeliveryScope", // 判断是否超区
            IsOpenDoor: M.one("input[name='hidIsOpenDoor']").getAttr("value")=="true"?true:false, // 判断是否打烊
            IsSelfPick: M.one("input[name='hidIsCanPickUp']").getAttr("value")=="true"?true:false, // 判断是否开通自提
            saveDeliveryMethod: "/waimai/deliverymethod", // 保存配送方式
            IsCanDelivery: M.one("input[name='hidIsCanDelivery']").getAttr("value")=="true"?true:false, // 判断是否开通外送业务
        };
    } catch (e) {
        // console.log("相关接口未暴露");
    }


    // 依赖项
    try {
        var lo = M.Location,
            local = M.LocalStorage,
            cookie = M.Cookie,
            geoc = new BMap.Geocoder();
            

    } catch (e) {

    }

    // 1.定位成功 回调
    var handleSuccess = function(point) {
        geoc.getLocation(new BMap.Point(point.lng, point.lat), handleTranslate);
    };

    // 2.定位失败 回调
    var handleFailure = function(msg) {
        DOM_locateAddressWrap.setHTML("定位失败");
        handleTips({
            whetherOpen: url.IsOpenDoor,
            whetherOutScope: true
        }); // 处理打烊
    };

    // 3.解析地址 回调
    var handleTranslate = function(rs) {
        var address = rs.address;
        DOM_locateAddressWrap.setHTML(address);

        // todo：将地址信息保存至后台缓存中
        M.xPost({
            url: url.CreateLocation,
            method: "GET",
            data: {
                lat: rs.point.lat,
                lng: rs.point.lng,
                locationtype: 1
            },
            on: {
                success: function(data, config) {
                    // 处理判断条件
                    handleCondition();
                },
                failure: function(data, config) {}
            }
        });
    };

    // 4.定位入口
    var handleLocate = function() {
        M.xPost({
            url: url.WhetherLocateOrNot,
            method: "GET",
            on: {
                success: function(data, config) {
                    // 获取购物车缓存信息
                    loadShopCartSessionData();
                    if (data.result) {
                        lo.getPosition(handleSuccess, handleFailure, "baidu");
                    } else {
                        handleCondition();
                    }
                },
                failure: function() {}
            }
        });
    };

    // 5.渲染左侧菜品分类
    var renderCategoryList = function() {
        M.xPost({
            url: url.GetCategoryList,
            data: {},
            method: 'POST',
            on: {
                success: function(data, config) {
                    if (data && data.categoryList.length > 0) {
                        var dom_cagegorylist = M.Template.get('_pages.takeout-ordering-categorylist')(data);
                        DOM_categoryWrap.appendChild(dom_cagegorylist);
                        categoryScroll = DOM_categoryWrap.scroll({
                            click: true // respond to the click event you have to explicitly 
                        });

                        // 请求第一个菜品分类下的菜品
                        currentCategory = DOM_categoryWrap.one('.active');
                        var activeCategoryId = currentCategory.getAttr("data-cid");
                        var activeCategoryName = currentCategory.one('span b').getText()
                        renderFoodsByCategoryId(activeCategoryId, activeCategoryName);

                        // 菜品分类 点击事件 
                        DOM_categoryWrap.all('li').on('click', function() {

                            // 更新分类
                            var cid = this.getAttr('data-cid'),
                                cname = this.one('span b').getText();
                            if (cid == currentCategory.getAttr("data-cid")) {
                                return;
                            }
                            currentCategory && currentCategory.removeClass('active');
                            currentCategory = this;
                            currentCategory && currentCategory.addClass('active');

                            // 更新菜品
                            DOM_FOOD.all(".c-foods").removeClass("active").addClass("hide");
                            currentDish = DOM_FOOD.one('[data-cid=' + cid + ']');
                            if (currentDish) {
                                currentDish.addClass("active").removeClass("hide");
                                foodScroll.scrollTo(0, 0);
                                foodScroll.refresh();
                            } else {
                                // todo：根据菜品分类id去请求
                                renderFoodsByCategoryId(cid, cname, 1);
                            }
                        });

                    }
                },
                failure: function(data, config) {}
            }
        });
    };

    // 6.根据分类Id渲染对应菜品
    var renderFoodsByCategoryId = function(categoryId, categoryName, flag) {
        if (!categoryId) {
            return;
        }
        M.xPost({
            url: url.GetDishList,
            data: {
                categoryId: categoryId
            },
            method: 'POST',
            on: {
                success: function(data, config) {
                    if (data && data.dishlist.length > 0) {
                        data.categoryId = categoryId;
                        data.categoryName = categoryName;
                        var dom_dishlist = M.Template.get('_pages.takeout-ordering-dishlist')(data);
                        DOM_FOOD.one('.foods-container').appendChild(dom_dishlist);
                        // 首次加载
                        if (!flag) {
                            foodScroll = DOM_FOOD.scroll({
                                probeType: 3, // emits the scroll event with a to-the-pixel precision
                                click: true
                            });
                            foodScroll.on('scroll', scrollHandle);
                            currentDish = DOM_FOOD.one('[data-cid=' + categoryId + ']');
                        } else {
                            foodScroll.scrollTo(0, 0);
                            foodScroll.refresh();
                        }

                        // 绑定加、减菜事件
                        DOM_FOOD.one(".active").all('.f-numb').plug(M.Plugin.amount);
                        DOM_FOOD.one(".active").all('.f-numb').each(function() {
                            amount(this);
                        });

                        // 绑定大图事件
                        DOM_FOOD.one(".active").all('.foods-img, .foods-info h4 b').on('click', renderlargePictureMode);
                        dishListTop = DOM_FOOD.get('region').top;
                        dishListHeight = DOM_FOOD.get('region').height;
                        lazyImg();


                    }
                },
                failure: function(data, config) {}
            }
        });
    };


    // 7.处理超区、打烊、自提的提示
    var handleCondition = function() {
        var condition = {
            whetherSelfPick: url.IsSelfPick
        };
        isOpenDoor(condition);
    };

    // 8.判断是否超区
    var isInDeliveryScope = function(con) {
        M.xPost({
            url: url.IsInDeliveryScope,
            method: "GET",
            on: {
                success: function(data, config) {
                    con.whetherOutScope = data.result;
                    handleTips(con);
                },
                failure: function(data, config) {
                    con.whetherOutScope = true;
                    handleTips(con);
                }
            }
        });
    };

    // 9.是否打烊
    var isOpenDoor = function(con) {
        con.whetherOpen = url.IsOpenDoor;
        isInDeliveryScope(con);
    };

    // 10.保存配送方式,1代表自提，2代表外卖
    var saveDeliveryMethod = function(type) {
        M.xPost({
            url: url.saveDeliveryMethod,
            data: {
                deliveryMethodId: type
            },
            method: "POST",
            on: {
                success: function(data, config) {},
                failure: function(data, config) {}
            }
        });
    };

    // 11.处理提示信息
    var handleTips = function(con) {
        var fn = {
            // 自提事件
            ok: function() {
                saveDeliveryMethod(1);
            },

            // 外卖事件
            cancel: function() {
                saveDeliveryMethod(2);
            }
        };
        var message = "";

        // 判断是否打烊
        // 仅超区
        if (!con.whetherOutScope && con.whetherOpen) {
            message = "已超出配送范围，订单可能不会被处理";
            if (con.whetherSelfPick ) {
                M.dialog(message, fn, 'tips');
            } else {
                M.dialog(message, fn, 'tips', 'hide');
            }
            return;
        }

        // 仅打烊
        if (!con.whetherOpen && con.whetherOutScope) {
            message = "商户已打烊，订单可能不会被处理";
            M.dialog(message, fn, 'tips', 'hide');
            M.one(".title").appendChild('<i class="m-icon i-restaurant-closed"></i>');
            return;
        }

        // 两者兼有
        if (!con.whetherOpen && !con.whetherOutScope) {
            message = "商户已打烊同时超出配送范围，订单可能不会被处理";
            if (con.whetherSelfPick) {
                M.dialog(message, fn, 'tips');
            } else {
                M.dialog(message, fn, 'tips', 'hide');
            }
            M.one(".title").appendChild('<i class="m-icon i-restaurant-closed"></i>');
            return;
        }
    };

    // 12.图片延迟加载
    var lazyImg = function() {
        var items = DOM_FOOD.one(".active").all(".foods-items");
        items.each(function(item) {
            if (item.get('region').top - dishListTop < dishListHeight + 100) {
                var img = item.one("img[data-src]");
                if (img) {
                    img.setAttr("src", img.getAttr("data-src")).removeAttr("data-src");
                }
            }
        });
    };

    // 13.菜品滚动时，执行的方法
    var scrollHandle = function(e) {

        //图片惰性加载
        lazyImg();
    };

    // 14.加减 菜
    // 按钮事件绑定 , flag 标志位， 1代表从购物车上添加
    function amount(dome, flag) {
        var foodDom = dome.ancestor('li');
        dome.amount.on('plus', function(e) {

            //加
            amountChange(foodDom, e.scope.getValue(), 1, flag);
        });
        dome.amount.on('reduce', function(e) {
            //减
            amountChange(foodDom, e.scope.getValue(), -1, flag);
        });
    }

    // 15.加减 菜 事件解绑
    function unamount(dome) {
        dome.amount.off();
    }

    // 16.加减菜品请求函数
    function postAddDish(foodinfo) {
        var postData = {
            dishId: foodinfo.id,
            dishName: foodinfo.name,
            count: foodinfo.Count
        };
        M.xPost({
            url: url.AddDish,
            data: postData,
            method: 'POST',
            on: {
                success: function(data, config) {
                    // 渲染页面
                    shopCartData = data;
                    updatePage(data);
                    // 如果购物车打开,渲染购物车
                    if (cueShow) {
                        updateDish();
                    }
                },
                failure: function(data, config) {

                }
            }
        });
    }

    /**
     * 17.菜品加减触发事件
     * @param  {[type]} foodDom  菜品li标签
     * @param  {[type]} value 菜品数量
     * @param  {[type]} type  加减操作 1 为加 －1为减
     * @return {[type]}       [description]
     */
    function amountChange(foodDom, value, type, flag) {
        var info;
        if (flag) {
            info = {
                Count: type,
                id: foodDom.getAttr('data-fid'),
                name: foodDom.one("h4 b").getHTML()
            };
        } else {
            var foodid = foodDom.getAttr('data-fid');
            info = getFoodInfo(foodid);
            var MenuId = info.menuId;
            info.Count = type;
        }
        postAddDish(info);
    }

    /**
     * 18.获取菜品信息
     * @param  {string} foodid 菜品id
     * @return {object} 菜品信息对象
     */
    function getFoodInfo(foodid) {
        //读取缓存

        var foodDom = DOM_FOOD.one('[data-fid=' + foodid + ']');
        if (!foodDom) {
            return;
        }
        if (foodlist[foodid]) {
            foodlist[foodid].num = foodDom.one('.f-numb').amount.getValue();
            return foodlist[foodid];
        }
        //菜品信息属性，加减时需要传导后端
        var foodInfoProperty = ['supplierdishname',
            'price',
            'packingcharges',
            'categoryname',
            'sellingprice',
            'properties'

        ];
        var info = {};
        for (var item in foodInfoProperty) {
            info[foodInfoProperty[item]] = foodDom.getAttr('data-' + foodInfoProperty[item]);
        }
        //单独处理2个字断
        info['CategoryId'] = foodDom.getAttr('data-cid');
        info['SupplierDishId'] = foodDom.getAttr('data-fid');
        //
        // 用于交互的属性
        info.id = info['SupplierDishId'];
        info.menuId = info['CategoryId'];
        if (foodDom.one('img') == null) {
            info.img = "/Content/images/picNotFound.png";
        } else {

            info.img = (foodDom.one('img').getAttr('data-src') != undefined ? foodDom.one('img').getAttr('data-src') : foodDom.one('img').getAttr('src')).replace("120x120", "320x320");
        }

        info.num = foodDom.one('.f-numb').amount.getValue();
        info.name = foodDom.one('h4 b').getHTML();
        info.price = foodDom.one('.f-price').getHTML();
        info.description = foodDom.getAttr("data-des");
        foodlist[foodid] = info;
        return info;
    }

    /**
     * 19.设置左侧菜品分类中菜品的数量
     * @param {[type]} cid [description]
     * @param {[type]} num [description]
     */
    function setMenuNum(cid, num) {
        var changeMenu = DOM_categoryWrap.one('[data-cid=' + cid + ']').one('.pubr');
        changeMenu.setHTML(num);

        if (num > 0) {
            changeMenu.removeClass('hide');
        } else {
            changeMenu.addClass('hide');
        }
    }

    // 20.设置右侧菜品数量
    function setFoodNum(fid, num) {
        //菜单菜品数量设置
        if (DOM_FOOD.one('[data-fid=' + fid + ']')) {
            DOM_FOOD.one('[data-fid=' + fid + ']').one('.f-numb').amount.setValue(num);
            //购物车菜品设置
            var dishFoodLi = M.one('.cart-list').one('[data-fid=' + fid + ']');
            if (dishFoodLi) {
                dishFoodLi.one('.f-numb').amount.setValue(num);
            }
            if (M.one('.swiper')) {
                var swiperFoodLi = M.one('.swiper').one('[data-fid=' + fid + ']');
                if (swiperFoodLi) {
                    swiperFoodLi.one('.f-numb').amount.setValue(num);
                }
            }
            //大图菜品数量设置
        }
    }

    // 21.渲染购物车整体数据,总价、菜品数量、是否可以下单按钮
    function updateShopCart(dishInfo) {

        var dom_tipEmptyShopCart = M.one(".f-tips-empty"), // 空购物车提示
            dom_tipPackageFee = M.one(".package-fee"), // 打包费
            dom_tipDeliveryFee = M.one(".f-tips"); // 还差多少元起送
        dom_tipEmptyShopCart.setText(dishInfo.delMinOrderAmount + "元起送");
        if (dishInfo.totalCount != 0) {
            dishDom.numDom.removeClass('hide');
            dom_tipEmptyShopCart.addClass("hide");
            dom_tipPackageFee.removeClass("hide").one("em").setHTML(dishInfo.packageFee);
            dishDom.deliveryDom.setStyle("padding-top", 0);
            if (dishInfo.gapDelMinOrderAmount > 0) {
                dom_tipDeliveryFee.removeClass("hide").one("em").setHTML(dishInfo.gapDelMinOrderAmount);
            } else {
                dom_tipDeliveryFee.addClass("hide");
            }

        } else {
            dishDom.numDom.addClass('hide');
            dom_tipEmptyShopCart.removeClass("hide");
            dom_tipPackageFee.addClass("hide");
            dom_tipDeliveryFee.addClass("hide");
            dishDom.deliveryDom.setStyle("padding-top", "1.2rem");
        }
        dishDom.numDom.setHTML(dishInfo.totalCount);
        dishDom.priceDom.setHTML(dishInfo.totalPrice);

        if (dishInfo.totalPrice >= 0 && dishInfo.totalCount > 0 && dishInfo.gapDelMinOrderAmount <= 0) {
            M.one('.sub-opc').one('button').removeAttr('disabled');
        } else {
            M.one('.sub-opc').one('button').setAttr('disabled', true);
        }
    }

    // 22.购物车信息更新，flag标志位，flag为1，标志为首次加载
    function updatePage(data, flag) {

        var dishClass = {
            totalCount: data.cart.totalCount,
            totalPrice: data.cart.total,
            delMinOrderAmount: data.cart.delMinOrderAmount, // 起送费
            gapDelMinOrderAmount: data.cart.gapDelMinOrderAmount, // 差多少元起送
            packageFee: data.cart.packageFee // 配送费
        };

        //更新购物车整体数据
        updateShopCart(dishClass);


        // 更新购物车分类及菜品数量
        if (data.totalCount != 0) {


            // 清空所有的标记
            if (!flag) {
                clearAll();
            }

            //一级循环分类
            for (var i = 0; i < data.cart.categoryList.length; i++) {

                // 处理菜单分类
                var menuObject = data.cart.categoryList[i];
                selectMenus.push(menuObject.categoryId);
                if (!flag) {
                    setMenuNum(menuObject.categoryId, menuObject.count);
                }

                //二级循环菜品
                for (var a = 0; a < menuObject.dishList.length; a++) {
                    //构建菜品信息
                    //保存已选菜品
                    selectFoods.push(menuObject.dishList[a].dishId);
                    if (!flag) {
                        setFoodNum(menuObject.dishList[a].dishId, menuObject.dishList[a].count);
                    }
                }
            }
        }
    }

    // 23.清除菜品分类及菜品标记
    function clearAll() {
        for (var i = 0; i < selectMenus.length; i++) {
            //处理菜品分类
            setMenuNum(selectMenus[i], 0);
        }
        for (var i = 0; i < selectFoods.length; i++) {
            //处理菜品
            setFoodNum(selectFoods[i], 0);
        }
        selectFoods = [];
        selectMenus = [];
    }

    // 24.获取购物车缓存信息
    function loadShopCartSessionData() {
        M.xPost({
            url: url.GetShoppingCart,
            method: 'POST',
            on: {
                success: function(data, config) {
                    shopCartData = data;
                    updatePage(data, 1);

                    // 渲染菜品分类
                    renderCategoryList();
                },
                failure: function(data, config) {

                }
            }
        });
    }

    // 25.更新购物车内菜品
    function updateDish() {
        var html = '';

        var selectFoodInfo = getFoodInfoByCart(shopCartData);
        for (var i = 0, l = selectFoodInfo.length; i < l; i++) {
            html = html + '<li data-cid="' + selectFoodInfo[i].categoryId + '" data-fid="' + selectFoodInfo[i].dishId + '">' +
                '<h4><b>' + selectFoodInfo[i].dishName + '</b></h4>' +
                '<span class="f-price">￥' + selectFoodInfo[i].price + '</span>' +
                '<div class="f-numb">' +
                '<a class="m-icon i-minus"></a>' +
                '<em>' + selectFoodInfo[i].count + '</em>' +
                '<a class="m-icon i-plus"></a>' +
                '</div>' +
                '</li>';
        }

        var seeHeigh = M.one(window).get('region').height - M.one('.ft-bar').get('region').height - M.one('.header').get('region').height;
        if (M.one('.adr-bar')) {
            seeHeigh - M.one('.adr-bar').get('region').height;
        }

        M.one('.cart-list ul').setHTML(html);
        var num = selectFoodInfo.length;
        var cellHeight = M.one('.cart-list').one('li') === null ? 0 : M.one('.cart-list').one('li').get('region').height; // 获取购物车单元格高度
        var otherHeight = M.one('.cart-title').get('region').height + parseInt(M.one('.shop-cart').getStyle('marginTop')) + M.one('.ft-bar').get('region').height;
        var listHeight = cellHeight * num + otherHeight;
        if (listHeight > seeHeigh) {
            num = (seeHeigh - otherHeight) / cellHeight;
            listHeight = cellHeight * num + otherHeight;
        }
        M.one('.shop-cart').setStyle('height', listHeight);

        //加减事件绑定
        M.one('.cart-list').all('.f-numb').plug(M.Plugin.amount);
        M.one('.cart-list').all('.f-numb').each(function() {
            amount(this, 1);
        });

        M.one('.cart-list').setStyle('height', cellHeight * num);
        cueScroll.refresh();
        if (listHeight === otherHeight) {
            M.one('.shop-cart').setStyle('height', 0);
            cueShow = false;
            M.one('html').removeClass('mask_cart');
            M.mask.hide();
            //M.one('.cart-list ul').remove();
            return;
        }
    }

    // 26.将购物车数据转换成数组格式
    function getFoodInfoByCart(data) {
        var result = [];
        for (var i = 0, l = data.cart.categoryList.length; i < l; i++) {
            var categoryList = data.cart.categoryList[i];
            for (var j = 0, w = categoryList.dishList.length; j < w; j++) {
                var item = categoryList.dishList[j];
                item.categoryId = categoryList.categoryId;
                result.push(item);
            }
        }
        return result;
    }

    // 购物车是否展示 
    var cueShow = false;

    M.one('.cart-list').setHTML('<ul></ul>');
    var cueScroll = M.one('.cart-list').scroll({
        click: true
    });

    // 购物车按钮点击事件
    M.role('cue').on('click', function(e) {
        e.halt();
        //关闭购物车
        if (cueShow) {
            M.one('.shop-cart').setStyle('height', 0);
            cueShow = false;
            M.one('html').removeClass('mask_cart');
            M.mask.hide();
            M.one('.cart-list ul').empty();
            return;
        }

        //展开购物车时获取已选菜品信息
        if (selectFoods.length == 0) {
            return;
        }
        M.one('html').addClass('mask_cart');
        M.mask({
            clickfn: function() {
                M.one('.shop-cart').setStyle('height', 0);
                M.one('html').removeClass('mask_cart');
                cueShow = false;
            },
            zIndex: 110
        });
        cueShow = true;

        // 渲染购物车;
        updateDish();
    });


    // 清除购物车按钮
    M.one('.delet').on('click', function() {
        M.confirm({
            title: '确认删除',
            content: '您确认要清空购物车中的全部菜品么',
            ok: function() {

                //清空请求
                M.xPost({
                    url: url.ClearCartDish,
                    data: {},
                    method: 'POST',
                    on: {
                        success: function(data, config) {
                            clearAll();
                            M.role('cue').fire('click');
                            var dishClass = {
                                totalCount: data.cart.totalCount,
                                totalPrice: data.cart.total,
                                delMinOrderAmount: data.cart.delMinOrderAmount, // 起送费
                                gapDelMinOrderAmount: data.cart.gapDelMinOrderAmount, // 差多少元起送
                                packageFee: data.cart.packageFee // 配送费
                            };
                            //更新购物车整体数据
                            updateShopCart(dishClass);
                        },
                        failure: function(data, config) {
                            if (data) {
                                clearAll();
                                M.role('cue').fire('click');
                                var dishClass = {
                                    totalCount: data.cart.totalCount,
                                    totalPrice: data.cart.total,
                                    delMinOrderAmount: data.cart.delMinOrderAmount, // 起送费
                                    gapDelMinOrderAmount: data.cart.gapDelMinOrderAmount, // 差多少元起送
                                    packageFee: data.cart.packageFee // 配送费
                                };
                                //更新购物车整体数据
                                updateShopCart(dishClass);
                            }

                        }
                    }
                });
            }
        });
    });

    // 修改地址
    if (DOM_modifyAddress) {

        DOM_modifyAddress.on("click", function() {
            window.location.href = "/location/manual";
        });
        // 设置cookie
        cookie.set("locate_redirect_url", window.location.href);
    }


    // 确认下单
    M.one(".sub-opc").on("click", function() {
        window.location.href = "/waimai/shoppingcar";
    });




    // 判断是否开通外卖-外送业务
    if (url.IsCanDelivery) {
        handleLocate();
    } else {
        var message = "";
        var fn = {
            ok: function() {

            },
            // 自提事件
            cancel: function() {
                saveDeliveryMethod(1);
            }
        };
        // 是否打烊
        if (!url.IsOpenDoor) {
            message = "商户打烊啦，且仅支持自提哟！";
            M.dialog(message, fn, 'tips', 'hide');
        } else {
            message = "商户仅支持自提哟！";
            M.dialog(message, fn, "tips", 'hide');
        }
        // 获取购物车缓存信息
        loadShopCartSessionData();
    }


    //菜品详情相关
    var foosInfoItem = '{{each foods as item index}}' +
        '<div class="d-inner">' +
        '<i class="m-icon i-close"></i>' +
        '<div class="img-container">' +
        '<img src="{{=item.img}}" alt="" />' +
        '</div>' +
        '<div class="f-info" data-fid="{{=item.id}}">' +
        '<div class="f-dibar">' +
        '<div class="price"><em>{{=item.price}}</em></div>' +
        '<div class="f-numb">' +
        '<a class="m-icon i-minus"></a>' +
        '<em>{{=item.num}}</em>' +
        '<a class="m-icon i-plus"></a>' +
        '</div>' +
        '</div>' +
        '<div class="f-intro">' +
        '<i class="m-icon i-back"></i>' +
        '<h5>{{=item.name}}</h5>' +
        '<div class="f-des">' +
        '<p>{{=item.description}}</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '{{/each}}';

    var foosInfoHtml = '<div class="swiper">' +
        '<div class="swiper-wrapper">' + foosInfoItem + '</div>' +
        '</div>';

    // 27.渲染大图模式
    function renderlargePictureMode() {
        //当前点击的菜品
        var foodid = this.ancestor('.foods-items').getAttr('data-fid');
        var prefood = getPreFood(foodid);
        var food = getFoodInfo(foodid);
        var nextfood = getNextFood(foodid);

        var foods = [],
            initialSlide = 1;
        if (prefood !== null) {
            foods.push(prefood);
        } else {
            initialSlide = 0;
        }
        foods.push(food);
        if (nextfood !== null) {
            foods.push(nextfood);
        } else {
            if(prefood==null){
                initialSlide = 0;    
            }else{
                initialSlide=1;
            }
            
        }
        var data = {
            foods: foods
        };
        var html = M.Template(foosInfoHtml)(data);
        M.one('body').append(html);
        var swiperDom = M.one('.swiper');

        //绑定幻灯事件
        var swiper = swiperDom.swiper({
            slideClass: 'd-inner',
            slidesPerView: 1.2,
            centeredSlides: true,
            spaceBetween: 20,
            initialSlide: initialSlide,
            onSlideChangeEnd: function(swiper) {

                //滚动后再插入下下一张
                var activeDom = swiper.slides[swiper.activeIndex];

                var foodid = M.Node.create(activeDom.innerHTML).one('.f-info').getAttr('data-fid');

                foodScroll.scrollToElement(DOM_FOOD.one('[data-fid=' + foodid + ']').getDOMNode(), 100, 0, -20);

                swiper.unlockSwipes();

                var swipDom;

                if (swiper.activeIndex > swiper.previousIndex) {
                    //右滑
                    if (swiper.activeIndex == swiper.slides.length - 1) {
                        if(nextfood==null){
                            return;
                        }
                        nextfood = getNextFood(nextfood.id);
                        if(nextfood==null){
                            return;
                        }
                        var tempdom = M.Node.create(M.Template(foosInfoItem)({
                            foods: [nextfood]
                        }));
                        tempdom.all('.f-numb').plug(M.Plugin.amount);

                        tempdom.all('.f-numb').each(function() {
                            var foodDom = this.ancestor('.f-info');

                            this.amount.on('plus', function(e) {
                                //加

                                amountChange(foodDom, e.scope.getValue(), 1);
                            });
                            this.amount.on('reduce', function(e) {
                                //减

                                amountChange(foodDom, e.scope.getValue(), -1);
                            });
                        });
                        tempdom.all(".i-close").on("click", function(e) {
                            M.one('.swiper').remove();
                            M.mask.hide();
                        });


                        // 菜品介绍滚动事件
                        // 处理菜品滚动
                        tempdom.all(".f-intro").on("click", function() {
                            var isSpread = this.one("i").hasClass("active"); // 是否展开

                            if (!isSpread) {
                                if (this._status != undefined) {
                                    this.one('.f-des').setStyle("height", deviceHeight / 3);
                                    this.one("i").addClass("active");
                                    this._scroller.refresh();
                                } else {
                                    this._height = this.one('.f-des').get('region').height;
                                    this.one('.f-des').setStyle("height", deviceHeight / 3);
                                    this._scroller = this.one('.f-des').scroll();
                                    this.one("i").addClass("active");
                                    this._status = "alreayUnfolded";
                                }

                            } else {
                                this.one('.f-des').setStyle("height", this._height);
                                this.one("i").removeClass("active");
                                this._scroller.refresh();
                            }
                        });

                        swiper.appendSlide(tempdom.getDOMNode());
                        swiperDom.all('.img-container').setStyle("height", deviceWidth / 1.4);
                    }

                } else if (swiper.activeIndex < swiper.previousIndex) {
                    //左滑

                    //重新定位目录位置
                    if (swiper.activeIndex == 0) {
                        if(prefood==null){
                            return;
                        }
                        prefood = getPreFood(prefood.id);
                        if(prefood==null){
                            return;
                        }
                        var tempdom = M.Node.create(M.Template(foosInfoItem)({
                            foods: [prefood]
                        }));
                        tempdom.all('.f-numb').plug(M.Plugin.amount);

                        tempdom.all('.f-numb').each(function() {
                            var foodDom = this.ancestor('.f-info');

                            this.amount.on('plus', function(e) {
                                //加

                                amountChange(foodDom, e.scope.getValue(), 1);
                            });
                            this.amount.on('reduce', function(e) {
                                //减

                                amountChange(foodDom, e.scope.getValue(), -1);
                            });
                        });
                        tempdom.all(".i-close").on("click", function(e) {
                            M.one('.swiper').remove();
                            M.mask.hide();
                        });

                        // 处理菜品滚动
                        tempdom.all(".f-intro").on("click", function() {
                            var isSpread = this.one("i").hasClass("active"); // 是否展开
                            if (!isSpread) {
                                if (this._status != undefined) {
                                    this.one('.f-des').setStyle("height", deviceHeight / 3);
                                    this.one("i").addClass("active");
                                    this._scroller.refresh();
                                } else {
                                    this._height = this.one('.f-des').get('region').height;
                                    this.one('.f-des').setStyle("height", deviceHeight / 3);
                                    this._scroller = this.one('.f-des').scroll();
                                    this.one("i").addClass("active");
                                    this._status = "alreayUnfolded";
                                }
                            } else {
                                this.one('.f-des').setStyle("height", this._height);
                                this.one("i").removeClass("active");
                                this._scroller.refresh();
                            }
                        });
                        swiper.prependSlide(tempdom.getDOMNode());
                        swiperDom.all('.img-container').setStyle("height", deviceWidth / 1.4);
                    }
                }
            }
        });
        M.mask({
            clickfn: function() {
                M.one('.swiper').remove();
            }
        });
        //点击事件绑定
        swiperDom.all('.f-numb').plug(M.Plugin.amount);

        swiperDom.all('.f-numb').each(function() {
            var foodDom = this.ancestor('.f-info');

            this.amount.on('plus', function(e) {
                //加

                amountChange(foodDom, e.scope.getValue(), 1);
            });
            this.amount.on('reduce', function(e) {
                //减

                amountChange(foodDom, e.scope.getValue(), -1);
            });
        });
        swiperDom.all('.f-intro').each(function() {});

        swiperDom.touch('move', function() {});

        swiperDom.all(".i-close").on("click", function(e) {
            M.one('.swiper').remove();
            M.mask.hide();
        });

        swiperDom.all('.img-container').setStyle("height", deviceWidth / 1.4);

        // 处理菜品滚动
        swiperDom.all(".f-intro").on("click", function() {
            var isSpread = this.one("i").hasClass("active"); // 是否展开

            if (!isSpread) {
                if (this._status != undefined) {
                    this.one('.f-des').setStyle("height", deviceHeight / 3);
                    this.one("i").addClass("active");
                    this._scroller.refresh();
                } else {
                    this._height = this.one('.f-des').get('region').height;
                    this.one('.f-des').setStyle("height", deviceHeight / 3);
                    this._scroller = this.one('.f-des').scroll();
                    this.one("i").addClass("active");
                    this._status = "alreayUnfolded";
                }

            } else {
                this.one('.f-des').setStyle("height", this._height);
                this.one("i").removeClass("active");
                this._scroller.refresh();
            }
        });
    }

    /**
     * 28.获取下一个菜品信息
     * @param  {string} foodid 菜品id
     * @return {object}        菜品信息
     */
    function getNextFood(foodid) {
        var foodDom = DOM_FOOD.one('[data-fid=' + foodid + ']');
        var nextFoodDom = foodDom.next();
        if (!nextFoodDom) {
            return null;
        }
        var id = nextFoodDom.getAttr('data-fid');
        return getFoodInfo(id);
    }

    /**
     * 29.获取上一个菜品信息
     * @param  {[type]} foodid [description]
     * @return {[type]}        [description]
     */
    function getPreFood(foodid) {
        var foodDom = DOM_FOOD.one('[data-fid=' + foodid + ']');
        var nextFoodDom = foodDom.previous();
        //当上一兄弟节点不存在时
        if (!nextFoodDom) {
            return null;
        }
        var id = nextFoodDom.getAttr('data-fid');
        return getFoodInfo(id);
    }




});
