/*
    Title:KA-点菜页
    Author:suning
    Date:2016.1.25
    Description: 
        1.页面加载时，判断是否存在购物车缓存信息
        2.若存在，更新菜品分类、菜品、购物车
        3.若不存在，执行事件绑定

 */
//@require jscroll,amount-plugin,mask,confirm,swiper,template,inscreen
Mo.ready(function(M) {


    var prefix = "";
    // var url = {
    //     // ShopingCartId: 6394,
    //     ShopingCartId: M.one("input[name='CartsupplierId']").getAttr("value"), // 购物车ID
    //     CartdeskId: M.one("input[name='cartdeskId']").getAttr("value"), // 桌号ID
    //     CartwaitStaffId: M.one("input[name='cartwaitStaffId']").getAttr("value"), // 店员ID
    //     GetShoppingCart: prefix + "/ShoppingCart/Get",
    //     AddDish: prefix + "/ShoppingCart/EditCoodsCount", // 添加菜品
    //     ClearCartDish: prefix + "/ShoppingCart/ClearShoppingCart", // 清除购物车
    //     EditCartDescription: prefix + "/ShoppingCart/EditCartDescription", // 修改购物车备注
    //     OrderConfirm: prefix + "/ScanCodeDianCan/LunchBox/OrderConfirm", // 创建流水订单
    //     GetDishabstinence: prefix + "/ScanCodeDianCan/Supplier/GetDishabstinence", // 获取菜品忌口
    //     GetHotDishList: prefix + "/ScanCodeDianCan/Supplier/GetHotDishList", // 获得热卖菜品

    // };
    // 接口
    try {

    } catch (e) {
        // console.log("相关接口未暴露");
    }


    //滑动目录变化
    var DOM_MENU_WRAP = M.one('.menu-nav-list'); //  菜品分类容器
    var DOM_FOOD = M.one('.food-container'); // 菜品列表容器

    // 动态计算菜品分类的宽度
    var categoryLis = DOM_MENU_WRAP.all("li"),
        categoryLisWidth = 0,
        categoryLisMargin = 0;
    categoryLis.each(function(item, index) {

        var categoryLiRegion = item.get('region');
        if (index === 0) {
            categoryLisMargin = categoryLiRegion.left;
        }
        categoryLisWidth += categoryLiRegion.width + categoryLisMargin;
    });
    DOM_MENU_WRAP.one("ul").setStyle('width', categoryLisWidth + "px");

    // 菜品分类滚动
    var menuScroll = DOM_MENU_WRAP.scroll({
        click: true, // respond to the click event you have to explicitly 
        eventPassthrough: true,
        scrollX: true,
        scrollY: false,
        preventDefault: false
    });

    // 菜品滚动
    var foodScroll = DOM_FOOD.scroll({
        probeType: 3, // emits the scroll event with a to-the-pixel precision
        click: true
    });


    var currentTitle = null, // 当前分类标题
        currentCate = DOM_MENU_WRAP.one('.active'), // 当前选中的分类
        DOM_Title = M.one('#fix-title'), // fixed标题
        clickCate = false, // 点击分类时，阻止滚动，标志位
        selectFoods = [], // 当前选中的菜品及分类
        selectMenus = [],
        foodlist = {}, // 缓存已点菜品
        allFoodList = [], // 所有菜品记录
        pos = [], // 菜品标题位置缓存列表
        titles = M.all(".category-tile"), // 菜品分类标题
        changeTop = M.one('.food-container').get('region').top; // 菜品列表距离页面顶端的距离

    // 购物车标记
    var dishDom = {
        numDom: M.one('.shop-cart').one('.pubr'),
        priceDom: M.one('.subtotal').one('em')
    };
    // 分类标题缓存
    titles.each(function() {
        pos.push(this.get('region').top - changeTop);
    });

    //菜品滑动事件 更新菜品分类及列表
    var dishCategoryContent = M.all(".food-items"),
        dishListTop = DOM_FOOD.get('region').top,
        dishListHeight = DOM_FOOD.get('region').height;
    lazyImg();

    // 图片惰性加载
    function lazyImg() {
        dishCategoryContent.each(function(item) {
            if (item.get('region').top - dishListTop < dishListHeight + 100) {
                var imgList = item.all("img[data-src]");
                if (imgList) {
                    imgList.each(function(img) {
                        img.setAttr("src", this.getAttr("data-src")).removeAttr("data-src");
                    });
                }
            }
        });
    }

    // 滚动事件处理
    function scrollHandle() {
        if (clickCate) {
            clickCate = false;
            return;
        }
        var act = null; // 当前激活的菜品标题，中间值
        var scrollTop = foodScroll.y;

        //图片惰性加载
        lazyImg();


        M.each(pos, function(item, index) {
            if (item <= -scrollTop) {
                act = titles.item(index);
                //console.log('item' + index);
            } else {
                ////console.log('item' + item, scrollTop);
                return false;
            }
        });
        if (act == null) {
            DOM_Title.addClass('hide');
            return;
        }
        if (currentTitle != null && currentTitle == act) {
            DOM_Title.removeClass('hide');
            return;
        }
        currentTitle = act || titles.item(0);
        //设置跟随标题
        DOM_Title.setHTML(currentTitle.getHTML());
        DOM_Title.removeClass('hide');

        var cid = currentTitle.getAttr('data-cid');
        M.all('.active').removeClass('active');
        currentCate && currentCate.removeClass('active');
        currentCate = DOM_MENU_WRAP.one('[data-cid=' + cid + ']');
        currentCate && currentCate.addClass('active');
        //超出可视区的菜单自动回滚
        var itemTop = currentCate.get('region').top - DOM_MENU_WRAP.get('region').top;
        //console.log("top:" + itemTop);

        //if (itemTop <= 0) {
        menuScroll.scrollToElement(currentCate.getDOMNode()); // 菜品分类 scroll至指定的类别
        // }
    }

    // 注册 菜品滚动事件
    foodScroll.on('scroll', scrollHandle);

    // 注册 菜品分类点击事件
    DOM_MENU_WRAP.all('li').on('click', function() {
        clickCate = true;
        DOM_Title.addClass('hide');
        var cid = this.getAttr('data-cid');
        currentCate && currentCate.removeClass('active');
        currentCate = this;
        currentCate && currentCate.addClass('active');
        currentTitle = DOM_FOOD.one('[data-cid=' + cid + ']');
        if (currentTitle) {
            var scrollHeight = foodScroll.scrollToElement(currentTitle.getDOMNode(), 0);
            if (scrollHeight > foodScroll.maxScrollY) {
                DOM_Title.setHTML(this.getHTML());
                DOM_Title.removeClass('hide');
            }
        }
        lazyImg();
    });

    // 加减菜
    M.all('.f-numb').plug(M.Plugin.amount);
    M.all('.f-numb').each(function() {
        amount(this);
    });
    M.all(".img-container").on("click", function(e) {
        var foodDom = this.ancestor('li');
        amountChange(foodDom, "", 1);
    });

    /**
     * 加减菜按钮事件注册
     * @param  {[type]} dome 
     * @return {[type]}      [description]
     */
    function amount(dome) {
        var foodDom = dome.ancestor('li');
        dome.amount.on('plus', function(e) {
            //加
            amountChange(foodDom, e.scope.getValue(), 1);
        });
        dome.amount.on('reduce', function(e) {
            //减
            amountChange(foodDom, e.scope.getValue(), -1);
        });
    }

    function unamount(dome) {
        dome.amount.off();
    }

    /**
     * 菜品加减触发事件
     * @param  {[type]} foodDom  菜品li标签
     * @param  {[type]} value 菜品数量
     * @param  {[type]} type  加减操作 1 为加 －1为减
     * @return {[type]}       [description]
     */
    function amountChange(foodDom, value, type) {
        var foodid = foodDom.getAttr('data-fid');

        var info = getFoodInfo(foodid);
        var MenuId = info.menuId;
        info.Count = type;
        postAddDish(info);
    }

    /**
     * 获取菜品信息
     * @param  {string} foodid 菜品id
     * @return {object} 菜品信息对象
     */
    function getFoodInfo(foodid) {
        //读取缓存
        var foodDom = DOM_FOOD.one('[data-fid=' + foodid + ']');
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
        // info.name = foodDom.one('h4').getHTML();
        // info.price = foodDom.one('.f-price').getHTML();
        // info.num = foodDom.one('.f-numb').amount.getValue();
        // info.img = foodDom.one('img').getAttr('data-src');
        info.description = foodDom.getAttr("data-des");
        foodlist[foodid] = info;
        return info;
    }

    // 加减菜品post函数
    function postAddDish(foodinfo) {
        var postInfo = {
            "CartsupplierId": url.ShopingCartId,
            "CategoryId": foodinfo.CategoryId,
            "SupplierDishId": foodinfo.SupplierDishId,
            "Count": foodinfo.Count,
            "CategoryName": foodinfo.categoryname,
            "SupplierDishType": 0
        };
        M.xPost({
            url: url.AddDish,
            data: postInfo,
            method: 'POST',
            on: {
                success: function(data, config) {
                    // 渲染页面
                    updatePage(data);

                    // 如果购物车打开,渲染购物车
                    if (cueShow) {
                        updateDish();

                    }

                },
                failure: function(data, config) {

                    console.log("failure");
                }
            }
        });
    }

    // 清除菜品分类及菜品标记
    function clearAll() {
        for (var i = 0; i < selectMenus.length; i++) {
            //处理菜单分类
            setMenuNum(selectMenus[i], 0);

        }
        for (var i = 0; i < selectFoods.length; i++) {
            //处理菜单分类
            setFoodNum(selectFoods[i], 0);
        }
        selectFoods = [];
        selectMenus = [];
    }

    // 设置左侧菜品分类中菜品的数量
    function setMenuNum(cid, num) {
        // var changeMenu = DOM_MENU_WRAP.one('[data-cid=' + cid + ']').one('.pubr');
        // changeMenu.setHTML(num);

        // if (num > 0) {
        //     changeMenu.removeClass('hide');
        // } else {
        //     changeMenu.addClass('hide');
        // }
    }

    // 设置菜品数量
    function setFoodNum(fid, num) {
        //菜单菜品数量设置
        DOM_FOOD.one('[data-fid=' + fid + ']').one('.f-numb').amount.setValue(num);
        if (num > 0) {
            DOM_FOOD.one('[data-fid=' + fid + ']').one('.f-numb').removeClass("hide");
        } else {
            DOM_FOOD.one('[data-fid=' + fid + ']').one('.f-numb').addClass("hide");
        }
        //购物车菜品设置
        var dishFoodLi = M.one('.cart-list').one('[data-fid=' + fid + ']');
        if (dishFoodLi) {
            dishFoodLi.one('.f-numb').amount.setValue(num);
        }
        // 搜索结果菜品设置
        if (DOM_SearchResult.one('[data-fid=' + fid + ']')) {
            DOM_SearchResult.one('[data-fid=' + fid + ']').one('.f-numb').amount.setValue(num);
            if (num > 0) {
                DOM_SearchResult.one('[data-fid=' + fid + ']').one('.f-numb').removeClass("hide");
            } else {
                DOM_SearchResult.one('[data-fid=' + fid + ']').one('.f-numb').addClass("hide");
            }
        }
    }

    //渲染购物车整体数据,总价、菜品数量、是否可以下单按钮
    function updateShopCart(dishInfo) {
        if (dishInfo.totalCount != 0) {
            M.one(".no-food-wrap").addClass("hide");
            M.one(".menu-ft").removeClass('hide');
            dishDom.numDom.setHTML(dishInfo.totalCount);
            dishDom.priceDom.setHTML(dishInfo.totalPrice);
        } else {
            M.one(".menu-ft").addClass("hide");
            M.one(".no-food-wrap").removeClass('hide');
        }
    }

    //购物车信息更新
    function updatePage(data) {
        clearAll();
        //清楚已选菜品
        var dishClass = {
            totalCount: data.TotalCount,
            totalPrice: data.TotalPrice
        };
        //更新购物车整体数据
        updateShopCart(dishClass);

        if (data.TotalCount != 0) {
            //一级循环分类
            for (var i = 0; i < data.Category.length; i++) {
                //处理菜单分类
                var menuObject = data.Category[i];

                setMenuNum(menuObject.CategoryId, menuObject.Count);
                selectMenus.push(menuObject.CategoryId);
                //二级循环菜品
                for (var a = 0; a < menuObject.DishList.length; a++) {
                    //构建菜品信息
                    //保存已选菜品
                    selectFoods.push(menuObject.DishList[a].DishId);

                    setFoodNum(menuObject.DishList[a].DishId, menuObject.DishList[a].DishCount);
                }

            }
        }
    }

    // 获取购物车缓存信息
    function loadShopCartSessionData() {
        M.xPost({
            url: url.GetShoppingCart,
            data: {
                CartsupplierId: url.ShopingCartId
            },
            method: 'GET',
            on: {
                success: function(data, config) {
                    updatePage(data);

                },
                failure: function(data, config) {

                }
            }
        });
    }

    // 购物车按钮事件 注册 
    var cueShow = false;
    M.one('.cart-list').setHTML('<ul></ul>');
    var cueScroll = M.one('.cart-list').scroll({
        click: true
    });
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

    //清除购物车按钮
    M.one('.delet').on('click', function() {
        M.confirm({
            title: '确认删除',
            content: '您确认要清空购物车中的全部菜品么',
            ok: function() {

                //清空请求
                M.xPost({
                    url: url.ClearCartDish,
                    data: {
                        "CartsupplierId": url.ShopingCartId,
                    },
                    method: 'POST',
                    on: {
                        success: function(data, config) {
                            clearAll();
                            M.role('cue').fire('click');
                            var dishClass = {
                                totalCount: 0,
                                totalPrice: 0
                            };
                            //更新购物车整体数据
                            updateShopCart(dishClass);
                        },
                        failure: function(data, config) {
                            if (data) {
                                clearAll();
                                M.role('cue').fire('click');
                                var dishClass = {
                                    totalCount: 0,
                                    totalPrice: 0
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

    // 更新购物车列表
    function updateDish() {
        var html = '';

        for (var i in selectFoods) {
            var selectFoodInfo = getFoodInfo(selectFoods[i]);
            html = html + '<li data-cid="' + selectFoodInfo.menuId + '" data-fid="' + selectFoodInfo.id + '">' +
                '<h4>' + selectFoodInfo.supplierdishname + '</h4>' +
                '<span class="f-price"><b>￥</b>' + selectFoodInfo.price + '</span>' +
                '<div class="f-numb">' +
                '<div class="num-widget">' +
                '<div class="minus">' +
                '<a class="m-icon i-minus"></a>' +
                '</div>' +
                '<em class="num">' + selectFoodInfo.num + '</em>' +
                '<div class="plus">' +
                '<a class="m-icon i-plus"></a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</li>';
        }

        var seeHeigh = M.one(window).get('region').height - M.one('.ft-bar').get('region').height - M.one('.menu-container').get('region').height; // - M.one('.ft-bar').get('region').height - M.one('.header').get('region').height;
        if (M.one('.adr-bar')) {
            seeHeigh - M.one('.adr-bar').get('region').height;
        }

        M.one('.cart-list ul').setHTML(html);
        var num = selectFoods.length;
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
            amount(this);
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

    // 选好了 事件注册
    M.one(".sub-opc").on("click", function() {
        if (cueShow) {
            M.role('cue').fire('click');
        }
        M.one(".menu-ft").addClass("hide");
        M.one(".food-preference").removeClass("hide");
        M.mask({
            clickfn:function(){
                M.one(".food-preference").addClass("hide");
                M.one(".menu-ft").removeClass("hide");
            }
        });
    });

    // 忌口 事件注册
    M.one(".pre-special").on("click", function() {

        if (M.one(".dialog-preference")) {
            M.one(".dialog-preference").removeClass("hide");
            M.one(".dialog-mask").removeClass("hide");
            return;
        }

        var dialogStr = '<div class="dialog-preference">' +
            '<h3 class="d-title">请输入忌口</h3>' +
            '<textarea data-role="preference-text" placeholder="请输入您的忌口要求"></textarea>' +
            '<div class="preference"></div>' +
            '<div class="btn-box">' +
            '<button class="m-btn btn-cancel-n" data-role="confirm">确认</button>' +
            '</div>' +
            '</div>',
            maskStr = '<div class="dialog-mask"></div>';
        var dialogPreference = M.Node.create(dialogStr),
            maskPreference = M.Node.create(maskStr);

        M.one("body").appendChild(dialogPreference);
        M.one("body").appendChild(maskPreference);

        var DOM_Text = M.role("preference-text");


        // 提交购物车备注 创建流水订单
        M.role("confirm").on("click", function() {
            M.xPost({
                url: url.EditCartDescription,
                data: {
                    "CartsupplierId": url.ShopingCartId, // 门店ID
                    "DishDescription": DOM_Text.get('value')
                },
                method: 'POST',
                on: {
                    success: function(data, config) {
                        orderConfirm();
                    },
                    failure: function(data, config) {

                    }
                }
            });
        });

        // 获得忌口菜单
        M.xPost({
            url: url.GetDishabstinence,
            data: {
                "CartsupplierId": url.ShopingCartId // 门店ID
            },
            method: 'GET',
            on: {
                success: function(data, config) {
                    var len = data.Result.length;
                    if (len > 0) {
                        var preferenceSpan = "";
                        for (var i = 0; i < len; i++) {
                            preferenceSpan += "<span>" + data.Result[i].Name + "</span>";
                        }
                        M.one(".preference").append(preferenceSpan);
                        M.all(".preference span").on("click", function(e) {
                            var text = e.currentTarget.getText();
                            var preText = DOM_Text.get('value');
                            if (preText !== "") {
                                DOM_Text.set('value', preText + "," + text);
                            } else {
                                DOM_Text.set('value', text);
                            }
                        });
                    }


                },
                failure: function(data, config) {

                }
            }
        });

        M.one(".dialog-mask").on("click", function() {
            this.addClass("hide");
            M.one(".dialog-preference").addClass("hide");
        });

    });

    // 不忌口 事件注册
    M.one(".pre-normal").on("click", function() {
        orderConfirm();
    });

    // 缓存所有菜品列表，用于搜索
    M.all(".food-item").each(function(item, index) {
        var food = {
            foodId: item.getAttr("data-fid"),
            foodName: item.getAttr("data-supplierdishname")
        };
        allFoodList.push(food);
    });

    // 创建流水订单
    function orderConfirm() {
        M.xPost({
            url: url.OrderConfirm,
            data: {
                "CartsupplierId": url.ShopingCartId, // 门店ID
                "customerType": 1,
                "CartdeskId": url.CartdeskId, // 桌台ID
                "CartwaitStaffId": url.CartwaitStaffId // 店员ID
            },
            method: 'POST',
            on: {
                success: function(data, config) {
                    alert("跳转至核对订单页面");

                },
                failure: function(data, config) {

                }
            }
        });
    }

    var DOM_SearchTextInput = M.role("search-text"), // 输入框
        DOM_SearchTextCloseIcon = M.one(".i-close-wrap"), // 关闭按钮
        DOM_SearchHotDishes = M.one(".s-suggest"), // 推荐热卖菜品 容器
        DOM_SearchResult = M.one('.s-result'), // 搜索结果容器
        DOM_SearchResultNone = M.one('.s-result-none'); //无结果容器

    // 获取热卖菜品
    function getHotDishes() {
        M.xPost({
            url: url.GetHotDishList,
            data: {
                "CartsupplierId": url.ShopingCartId // 门店ID
            },
            method: 'POST',
            on: {
                success: function(data, config) {
                    var results = data.Result;
                    var len = results.length;
                    if (len > 0) {
                        var hotDishStr = "";
                        for (var i = 0; i < len; i++) {
                            hotDishStr += '<span>' + results[i].SupplierDishName + '</span>';
                        }
                        var DOM_HotDishes = M.one(".s-suggest-wrap");
                        DOM_HotDishes.append(hotDishStr);

                        // 注册事件
                        DOM_HotDishes.all('span').on("click", function(e) {
                            var text = e.currentTarget.getText();
                            DOM_SearchTextInput.set('value', text);
                            DOM_SearchTextInput.fire("input");
                        });
                    }

                },
                failure: function(data, config) {

                }
            }
        });
    }

    // 搜索输入框事件
    DOM_SearchTextInput.on("input", handleSearch);

    // 搜索框关闭事件
    DOM_SearchTextCloseIcon.on("click", function() {
        DOM_SearchTextCloseIcon.addClass("hide");
        DOM_SearchHotDishes.removeClass("hide");
        DOM_SearchResult.one("ul").empty();
        DOM_SearchTextInput.set("value", "");
        DOM_SearchResultNone.addClass("hide");
    });

    // 搜索事件
    function handleSearch(e) {
        DOM_SearchResultNone.addClass("hide");
        DOM_SearchResult.one("ul").empty();
        var text = DOM_SearchTextInput.get('value');
        // 判断搜索关键字是否为空
        if (text === "") {
            DOM_SearchTextCloseIcon.addClass("hide");
            DOM_SearchHotDishes.removeClass("hide");
            DOM_SearchResult.one("ul").empty();
        }

        // 判断搜索关键字是否为汉字,并匹配关键字
        if (!/^[\u4e00-\u9fa5]+$/.test(text)) {
            return;
        }
        DOM_SearchTextCloseIcon.removeClass("hide");
        DOM_SearchHotDishes.addClass('hide');
        var len = allFoodList.length,
            searchResult = [],
            pattern = new RegExp(text),
            searchResultStr = "";
        for (var i = 0; i < len; i++) {
            if (pattern.test(allFoodList[i].foodName)) {
                searchResult.push(allFoodList[i].foodId);
            }
        }
        if (searchResult.length == 0) {
            DOM_SearchResultNone.removeClass("hide");
            return;
        }
        for (var i = 0, l = searchResult.length; i < l; i++) {
            var searchFoodInfo = getFoodInfo(searchResult[i]);
            var hide = searchFoodInfo.num > 0 ? "" : "hide";
            searchResultStr += '<li class="food-item" data-fid=' + searchFoodInfo.SupplierDishId + '>' +
                '<div class="food-item-wrap">' +
                '<div class="num-widget f-numb ' + hide + '">' +
                '<div class="minus">' +
                '<a class="m-icon i-minus"></a>' +
                '</div>' +
                '<div class="separator"></div>' +
                '<em class="num">' + searchFoodInfo.num + '</em>' +
                '<div class="separator"></div>' +
                '<div class="plus">' +
                '<a class="m-icon i-plus"></a>' +
                '</div>' +
                '</div>' +
                '<div class="img-container">' +
                '<img src="' + searchFoodInfo.img + '">' +
                '</div>' +
                '<div class="info">' +
                '<div class="info-title">' + searchFoodInfo.supplierdishname + '</div>' +
                '<div class="info-price"><b>￥</b><span>' + searchFoodInfo.price + '</span></div>' +
                '</div>' +
                '</div>' +
                '</li>';
        }
        DOM_SearchResult.one("ul").empty().append(searchResultStr);
        //加减事件绑定
        DOM_SearchResult.all('.f-numb').plug(M.Plugin.amount);
        DOM_SearchResult.all('.f-numb').each(function() {
            amount(this);
        });
        DOM_SearchResult.all(".img-container").on("click", function(e) {
            var foodDom = this.ancestor('li');
            amountChange(foodDom, "", 1);
        });
    }

    var isAlreadyGetHotDishes = false;
    // 查找
    M.one(".search-text").on("click", function() {
        M.one(".g-main").addClass("hide");
        M.one(".search-main").removeClass("hide");
        M.role("search-text")._node.focus();

        if (isAlreadyGetHotDishes) {
            DOM_SearchTextCloseIcon.fire("click");
        } else {
            getHotDishes();
            isAlreadyGetHotDishes = true;
        }

    });

    // 取消搜索
    M.role("cancel-search").on("click", function() {
        M.one(".g-main").removeClass("hide");
        M.one(".search-main").addClass("hide");
    });

    loadShopCartSessionData();


});
