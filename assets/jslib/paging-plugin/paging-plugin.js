/**
@module:	paging plug
@date   2013-7-8
@author zhangjian
 */
Mo.define('paging-plugin', function(M) {
	M.namespace('Plugin');


	var DefaultAttrs = {
		type: "sync",
		displaypage: 8,
		currentpage: 1,
		params: {
			start: 0,
			limit: 18
		}
	}

	// Class Paging
	var Paging = function(config) {
		config = config ? M.merge(DefaultAttrs, config) : {};
		config.node = config.host;
		Paging.superclass.constructor.apply(this, arguments);

	};
	Paging.NAME = 'Paging';
	Paging.NS = 'paging';

	Paging.ATTRS = DefaultAttrs;

	M.extend(Paging, M.EventTarget);
	// Extend Paging prototype
	M.extend(Paging, M.Plugin.Base, {
		init: function(config) {
			var self = this;
			self.config = M.merge(DefaultAttrs, config);
			self.host = self.get("host");
			//内建参数属性
			self._buildAttribute();
			//绑定事件
			self._bindEvent();
			if (self.config.type == "ajax") {
				//请求后台数据
				self._getRequestData();
			}
		},
		/**
		 *@description 请求数据方法
		 *@private
		 */
		_getRequestData: function() {
			var self = this;
			self._datas = [];

			self.config.params["start"] = self.config.currentpage == 1 ? 0 : ((parseInt(self.config.currentpage) - 1) * parseInt(self.config.params["limit"]) + 1);

			M.io({
				url: self.config.url || "",
				method: 'POST',
				//cache : false,
				//dataType : 'json',
				data: self.config.params || {},
				success: function(response) {
					var data = JSON.parse(response.responseText);
					if (data && data.error_code == 0) {
						if (parseInt(data.data.totals) <= 0) {

							return false;
						}
						self._totals = Math.ceil(data.data.totals / parseInt(self.config.params["limit"]));
						M.each(data.data.data, function(i) {
							self._datas.push(M.Template(self.config.tpl)(i));
						})

						self._updateData(data);
						self._updatebar(data);
						self.config.callback && self.config.callback.call(this, self._datas);
						self.fire("data-loaded", [self._status, self.config.params]);

					} else if (data.error_code = 1) {
						//YM.ShowTip(data.msg);
					}
				},
				failure: function(response) {
					M.log(self.config.url)
					M.log(response)
				}
			});
		},
		/**
		 *@description 更新数据
		 *@method _updateData
		 *@private
		 */
		_updateData: function(data) {
			var self = this,
				_tpl = "";
			M.each(self._datas, function(i) {
				_tpl += i;
			});
			if (self.config.ctarget) {
				//M.one(self.config.ctarget).set("innerHTML", '');
				M.one(self.config.ctarget).empty();
				M.one(self.config.ctarget).append(M.Node.create(_tpl)); //
			}

		},
		/**
		 *@description 更新分页条
		 *@method _updatebar
		 *@private
		 */
		_updatebar: function() {
			var self = this,
				_count = 1;
			var _bartpl = '',
				_prevflag = false,
				_step = 0;
			if (self.config.currentpage == 1) {
				_bartpl += '<span title="已经是第一页了" class="prev">&lt;</span>';
			} else {
				_bartpl += '<a title="上一页" class="prev" href="#">&lt;</a>';
			}

			if (self.config.currentpage > 5 && self._totals > 9) {
				if ((parseInt(self.config.currentpage) + 2) >= self._totals - 2) {
					_bartpl += '<a href="#">' + 1 + '</a>';
					_bartpl += '<span class="more">...</span>';
					for (var i = self._totals - 6; i <= self._totals; i++) {
						if (i == self.config.currentpage) {
							_bartpl += '<strong class="now">' + i + '</strong>';
						} else {
							_bartpl += '<a href="#">' + i + '</a>';
						}
					}
				} else {
					_bartpl += '<a href="#">' + 1 + '</a>';
					_bartpl += '<span class="more">...</span>';
					_bartpl += '<a href="#">' + (parseInt(self.config.currentpage) - 2) + '</a>';
					_bartpl += '<a href="#">' + (parseInt(self.config.currentpage) - 1) + '</a>';
					_bartpl += '<strong class="now">' + self.config.currentpage + '</strong>';
					_bartpl += '<a href="#">' + (parseInt(self.config.currentpage) + 1) + '</a>';
					_bartpl += '<a href="#">' + (parseInt(self.config.currentpage) + 2) + '</a>';
					if ((parseInt(self.config.currentpage) + 2) < self._totals - 2)
						_bartpl += '<span class="more">...</span>';
					_bartpl += '<a href="#">' + self._totals + '</a>';
				}
			} else {
				for (var i = 1; i <= 9; i++) {
					if (i > self._totals) {
						break;
					}
					if (i == self.config.currentpage) {
						_bartpl += '<strong class="now">' + i + '</strong>';
					} else {
						_bartpl += '<a href="#">' + i + '</a>';
					}
				}
			}

			if (self.config.currentpage == self._totals) {
				_bartpl += '<span title="已经是最后一页了" class="next">&gt;</span>';
			} else {
				_bartpl += '<a title="下一页" class="next" href="#">&gt;</a>';
			}

			_bartpl += '<p class="skip' + (self.config.hideInput === true ? " m-hide" : "") + '">到<span class="entry-box"><input type="text" class="entry" name="topage" id="topage"></span>页</p>'
			self.host.setContent(_bartpl);
			self.host.one("input").setStyle("ime-mode", "disabled");
		},
		/**
		 *@description 获取第几页的数据
		 *@method _go
		 *@private
		 */
		_go: function(idx) {
			var self = this;
			self._status = "go";
			self.config.currentpage = parseInt(idx);
			self._getRequestData();
		},
		/**
		 *@description 内建属性
		 *@method _buildAttribute
		 *@private
		 */
		_buildAttribute: function() {
			var self = this;
			self.config.params = self.config.params || {};
			//当前页
			self.config.currentpage = 1;
		},
		/**
		 *@description 绑定事件
		 *@method _bindEvent
		 *@private
		 */
		_bindEvent: function() {
			var self = this,_btn=self.host.one(".skip-btn"),_page=self.host.one(".entry"),_form=self.host.one("form"),
				_flag = true;
			self.host.delegate("keyup", function(evt) {
				var ET = evt.currentTarget,
					_v = ET.get("value").replace(/\D/g, ''),_maxpage=ET.getAttr("maxpage");
				if(!_maxpage){
					_maxpage=1;
				}else{
                                                         _maxpage=parseInt(_maxpage);
				}
				if (M.Lang.trim(_v) != "" && _v < 1) {
					_v = 1;
				}
				if(_v>_maxpage) _v=_maxpage;
				ET.set("value", _v);
				if (evt.keyCode == 13) {
					if (self.config.type == "ajax") {
						self._go(_v);
					} else {
						if (self.config.enterCb) {
							_flag = self.config.enterCb.call(ET, _v);
						}

						if (_flag) {
						location.href=_form.getAttr("action")+"page="+_page.get("value");
						}
					}
				}
				evt.halt();
			}, ".entry")
			if(_btn){
			_btn.on("click", function(ev) {
				ev.halt();
				var _inputvalue = ev.currentTarget.previous().get("value");
				if (M.Lang.trim(_inputvalue) == "") return;
				if (self.config.type == "ajax") {
					self._go(parseInt(_inputvalue));
				} else {
					if (self.config.enterCb) {
						_flag = self.config.enterCb.call(ev.currentTarget, _inputvalue);
					}

					if (_flag) {
						location.href=_form.getAttr("action")+"page="+_page.get("value");
					}
				}
			})
			}
			if (self.config.type == "ajax") {
				self.host.delegate("click", function(evt) {
					evt.halt();
					var _self = evt.currentTarget;
					if (_self.hasClass("prev")) {
						self._go(self.config.currentpage - 1);
						return false;
					}
					if (_self.hasClass("next")) {
						self._go(self.config.currentpage + 1);
						return false;
					}
					//当前节点TODO
					self._go(M.Lang.trim(_self.getContent()));
					return false;
				}, "a");
			}
		},
		/**
		 *@description 通过参数更新数据
		 *@method update
		 *@param {object} o
		 *@public
		 */
		update: function(o) {
			var self = this;
			self.config.params = M.merge(self.config.params, o || {});
			self._status = arguments[1] || "update";
			//请求分页数据
			self._getRequestData();
		}

	});

	M.Plugin.Paging = Paging;
});