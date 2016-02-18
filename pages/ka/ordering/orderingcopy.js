orderingcopy.js/*
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

    // DOM元素
    var dom = {
        foods_list: M.one(".foods-lst"),
        go_back: M.one(".back")
    };

    // 接口
    try {
        var url = {
            Token: M.one("input[name='__RequestVerificationToken']").getAttr("value"), // Token
            ShopingCartId: M.one("input[name='hidShoppingCartId']").getAttr("value"), // 购物车ID
            GetShoppingCart: "/ZhongCanTangShi/Menu/GetShoppingCart",
            AddDish: "/ZhongCanTangShi/Menu/AddDish", // 添加菜品
            ClearCartDish: "/ZhongCanTangShi/Menu/ClearCartDish", // 清除购物车
            OrderCheck: "/ZhongCanTangShi/LunchBox/OrderCheck", // 核对订单
            GoBack: M.one("input[name='hidWapGoBackUrl']").getAttr("value") + "?referrer" + document.referrer, // 回上一页
        };
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
        clickCate = false,// 点击分类时，阻止滚动，标志位
        selectFoods = [],// 当前选中的菜品及分类
        selectMenus = [],
        pos = [], // 菜品标题位置缓存列表
        titles = M.all(".category-tile"), // 菜品分类标题
        changeTop = M.one('.food-container').get('region').top; // 菜品列表距离页面顶端的距离

    // 分类标题缓存
    titles.each(function() {
        pos.push(this.get('region').top - changeTop);
    });

    //菜品滑动事件 更新菜品分类及列表
    var dishCategoryContent = M.all(".food-items"),
        dishListTop = DOM_FOOD.get('region').top,
        dishListHeight = DOM_FOOD.get('region').height;
    //lazyImg();

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
        // lazyImg();


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
    foodScroll.on('scroll', scrollHandle);

    debugger;
    return;
    var deviceHeight = M.one('body').get('region').height,
        deviceWidth = M.one('body').get('region').width;
    var DOM_MENU_WRAP = M.one('.nav-lst'); //  菜品分类容器
    var pos = [];
    // var titles = M.all('.ul-title'); // 右侧 菜品分类标题
    var clickCate = false;
    var currentTitle = null;
    var currentCate = DOM_MENU_WRAP.one('.active'); // 左侧 当前选中的分类
    var DOM_FOOD = M.one('.menu-lst'); // 右侧 菜品列表容器
    var DOM_Title = M.one('#fix-title'); // 右侧 fix的标题
    //当前选中的菜品及菜单;
    var selectFoods = [];
    var selectMenus = [];

    var foodlist = {};

    //目录滑动劫持处理
    var menuScroll = DOM_MENU_WRAP.scroll({
        click: true // respond to the click event you have to explicitly 
    });
    var foodScroll = DOM_FOOD.scroll({
        probeType: 3, // emits the scroll event with a to-the-pixel precision
        click: true
    });

    var changeTop = M.one('.menu-foods').get('region').top; // 菜品列表距离页面顶端的距离

    //title top位置缓存
    titles.each(function() {
        pos.push(this.get('region').top - changeTop);
    });

    //菜品滑动事件 更新菜品分类及列表
    var dishCategoryContent = M.all(".foods-lst"),
        dishListTop = DOM_FOOD.get('region').top,
        dishListHeight = DOM_FOOD.get('region').height;
    lazyImg();

    //图片惰性加载
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

    function scrollHandle() {
        if (clickCate) {
            clickCate = false;
            return;
        }
        var act = null;
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
    foodScroll.on('scroll', scrollHandle);

    // 菜品分类 点击事件
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

    //加减
    M.all('.f-numb').plug(M.Plugin.amount);

    M.all('.f-numb').each(function() {
        amount(this);
    });

    //按钮事件绑定
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

    //加减菜品请求函数
    function postAddDish(foodinfo) {
        foodinfo.ShoppingCartId = url.ShopingCartId;
        foodinfo.__RequestVerificationToken = url.Token;
        M.xPost({
            url: url.AddDish,
            data: foodinfo,
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


                }
            }
        });
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

    /**
     * 设置左侧菜品分类中菜品的数量
     * @param {[type]} cid [description]
     * @param {[type]} num [description]
     */
    function setMenuNum(cid, num) {
        var changeMenu = DOM_MENU_WRAP.one('[data-cid=' + cid + ']').one('.pubr');
        changeMenu.setHTML(num);

        if (num > 0) {
            changeMenu.removeClass('hide');
        } else {
            changeMenu.addClass('hide');
        }
    }

    // 设置菜品数量
    function setFoodNum(fid, num) {
        //菜单菜品数量设置
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

    //购物册按钮事件 
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

    // 更新购物车列表
    function updateDish() {
        var html = '';

        for (var i in selectFoods) {
            var selectFoodInfo = getFoodInfo(selectFoods[i]);
            html = html + '<li data-cid="' + selectFoodInfo.menuId + '" data-fid="' + selectFoodInfo.id + '">' +
                '<h4>' + selectFoodInfo.supplierdishname + '</h4>' +
                '<span class="f-price"><b>￥</b>' + selectFoodInfo.price + '</span>' +
                '<div class="f-numb">' +
                '<a class="m-icon i-minus"></a>' +
                '<em>' + selectFoodInfo.num + '</em>' +
                '<a class="m-icon i-plus"></a>' +
                '</div>' +
                '</li>';
        }

        var seeHeigh = M.one(window).get('region').height - M.one('.ft-bar').get('region').height - M.one('.header').get('region').height;
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

    //弹层关闭
    M.all('.i-close').on('click', function() {
        this.ancestor('.dialog').addClass('hide');
        M.mask.hide();
    });

    //通知弹层
    var adrbar = M.one('.adr-bar');
    var notice = M.role('notice');
    if (adrbar) {
        //计算优惠高度
        adrbar.on('click', function() {
            notice.removeClass('hide');
            var tempHeight = notice.get('region').height - notice.one('.d-title').get('region').height;
            M.role('dCouponBox').setStyle('height', tempHeight);
            M.role('dCouponBox').scroll({
                click: true
            });
            M.mask({
                click: false
            });
        });
    }

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
                        cartId: url.ShopingCartId,
                        __RequestVerificationToken: url.Token
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
                // M.role('cue').fire('click');
                // for (i in selectFoods) {
                //     setMenuNum(selectFood[i].menuId, 0);
                //     DOM_FOOD.one('[data-fid=' + i + ']').one('.f-numb').amount.setValue(0);
                // }
                // selectFoods = {};

                // var totlePubr = M.role('cue').one('.pubr');

                // totlePubr.addClass('hide');
                // M.tips('删除成功');
            }
        });
    });

    //菜品详情相关
    var foosInfoItem = '{{each foods as item index}}' +
        '<div class="d-inner">' +
        '<i class="m-icon i-close"></i>' +
        '<div class="img-container">' +
        '<img src="{{=item.img}}" alt="" />' +
        '</div>' +
        '<div class="f-info" data-fid="{{=item.id}}">' +
        '<div class="f-dibar">' +
        '<div class="price"><b>￥</b><em>{{=item.price}}</em></div>' +
        '<div class="f-numb">' +
        '<a class="m-icon i-minus"></a>' +
        '<em>{{=item.num}}</em>' +
        '<a class="m-icon i-plus"></a>' +
        '</div>' +
        '</div>' +
        '<div class="f-intro">' +
        '<i class="m-icon i-back"></i>' +
        '<h5>{{=item.supplierdishname}}</h5>' +
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

    // 点击大图事件
    DOM_FOOD.all('.foods-img, .foods-info h4').on('click', function() {
        //当前点击的菜品
        var foodid = this.ancestor('.foods-items').getAttr('data-fid');
        var food = getFoodInfo(foodid);
        var nextfood = getNextFood(foodid);
        var nextfood2 = getNextFood(nextfood.id);
        var prefood = getPreFood(foodid);
        var prefood2 = getPreFood(prefood.id);
        var data = {
            foods: [prefood2, prefood, food, nextfood, nextfood2]
        };
        var html = M.Template(foosInfoHtml)(data);
        M.one('body').append(html);
        var swiperDom = M.one('.swiper');

        //绑定幻灯事件
        var swiper = swiperDom.swiper({
            slideClass: 'd-inner',
            slidesPerView: 1.4,
            centeredSlides: true,
            spaceBetween: 20,
            initialSlide: 2,
            onSlideChangeEnd: function(swiper) {
                //滚动后再入下下一张
                var activeDom = swiper.slides[swiper.activeIndex];

                var foodid = M.Node.create(activeDom.innerHTML).one('.f-info').getAttr('data-fid');

                foodScroll.scrollToElement(DOM_FOOD.one('[data-fid=' + foodid + ']').getDOMNode(), 100, 0, -20);

                swiper.unlockSwipes();

                var swipDom;
                if (swiper.activeIndex > swiper.previousIndex) {
                    //右滑
                    if (swiper.activeIndex == swiper.slides.length - 2) {
                        nextfood2 = getNextFood(nextfood2.id);
                        var tempdom = M.Node.create(M.Template(foosInfoItem)({
                            foods: [nextfood2]
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
                    if (swiper.activeIndex == 1) {
                        prefood2 = getPreFood(prefood2.id);
                        var tempdom = M.Node.create(M.Template(foosInfoItem)({
                            foods: [prefood2]
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

        swiperDom.touch('move', function() {

        });

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
    });

    /**
     * 获取下一个菜品信息
     * @param  {string} foodid 菜品id
     * @return {object}        菜品信息
     */
    function getNextFood(foodid) {
        var foodDom = DOM_FOOD.one('[data-fid=' + foodid + ']');
        var nextFoodDom = foodDom.next();
        if (!nextFoodDom) {
            var parent = foodDom.ancestor('ul');
            var preParent = parent.next();

            if (preParent) {
                //存在下一个ul,取最后一个节点
                nextFoodDom = preParent.next().one('li:first-of-type');
            } else {
                //不存在下一个ul,为第一个节点,取最后一个ul
                nextFoodDom = DOM_FOOD.one('ul:first-of-type').one('li:first-of-type');

            }
        }
        var id = nextFoodDom.getAttr('data-fid');
        return getFoodInfo(id);
    }

    /**
     * 获取上一个菜品信息
     * @param  {[type]} foodid [description]
     * @return {[type]}        [description]
     */
    function getPreFood(foodid) {
        var foodDom = DOM_FOOD.one('[data-fid=' + foodid + ']');
        var nextFoodDom = foodDom.previous();
        //当上一兄弟节点不存在时
        if (!nextFoodDom) {
            //查找上一个ul内最后一个节点
            var parent = foodDom.ancestor('ul');
            var preParent = parent.previous().previous();
            if (preParent) {
                //存在上一个ul,取最后一个节点
                nextFoodDom = preParent.one('li:last-of-type');
            } else {
                //不存在上一个ul,为第一个节点,取最后一个ul
                nextFoodDom = DOM_FOOD.one('ul:last-of-type').one('li:last-of-type');

            }
        }
        var id = nextFoodDom.getAttr('data-fid');
        return getFoodInfo(id);
    }

    var dishDom = {
        numDom: M.one('.shop-cart').one('.pubr'),
        priceDom: M.one('.subtotal').one('em')
    };

    //渲染购物车整体数据,总价、菜品数量、是否可以下单按钮
    function updateShopCart(dishInfo) {
        if (dishInfo.totalCount != 0) {
            dishDom.numDom.removeClass('hide');
        } else {
            dishDom.numDom.addClass('hide');
        }
        dishDom.numDom.setHTML(dishInfo.totalCount);
        dishDom.priceDom.setHTML(dishInfo.totalPrice);

        if (dishInfo.totalPrice >= 0 && dishInfo.totalCount > 0) {
            M.one('.sub-opc').one('button').removeAttr('disabled');
        } else {
            M.one('.sub-opc').one('button').setAttr('disabled', true);
        }
    }

    //购物车信息更新
    function updatePage(data) {
        clearAll();
        //清楚已选菜品
        var dishClass = {
            totalCount: data.data.TotalCount,
            totalPrice: data.data.TotalPrice
        };
        //更新购物车整体数据
        updateShopCart(dishClass);

        if (data.data.TotalCount != 0) {
            //一级循环分类
            for (var i = 0; i < data.data.Category.length; i++) {
                //处理菜单分类
                var menuObject = data.data.Category[i];

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

    // 获取购物车缓存信息
    function loadShopCartSessionData() {
        M.xPost({
            url: url.GetShoppingCart,
            data: {
                cartId: url.ShopingCartId,
                __RequestVerificationToken: url.Token
            },
            method: 'POST',
            on: {
                success: function(data, config) {
                    updatePage(data);
                },
                failure: function(data, config) {

                }
            }
        });
    }

    // 核对订单
    M.one('.sub-opc').one('button').on('click', function() {
        location.href = url.OrderCheck + '?shoppingCartId=' + url.ShopingCartId;
    });


    //阻止弹性滚动
    M.one('.menu-ft').touch('move', function() {});

    // 转到上一页
    setTimeout(function() {
        dom.go_back.on("click", function(e) {
            e.halt();
            window.location.href = url.GoBack;
        });
    }, 300);

    loadShopCartSessionData();


});
