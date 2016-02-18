/**
 * 日历控件
 * @module: calendar
 * @author: Jiangjibing
 * @date: 2013/7/23
 */


//拼日历格式
/*
7,1,2,3,4,5,6
0,0,1,2,3,4,5
Template: M.Template('{{each data as month}}<div class="item" data-role="calendar-ymview" data-attrs="y={{month.y}}&amp;m={{month.m}}"><div class="hd">{{month.y}}年{{month.m}}月</div><div class="bd separator"><table><tr>{{each dayName as weekly}}<th>{{weekly}}</th>{{/each}}</tr>{{each month.days as week}}<tr>{{each week as day}}<td {{if day == month.current}}class="current-day"{{/if}}>{{if day > 0}}<a href="#" {{if month.selected == day && month.m == month.selectedm}} class="selected"{{/if}}>{{day}}</a>{{/if}}</td>{{/each}}</tr>{{/each}}</table></div></div>{{/each}}'),
HTML_CONTROL: '<div data-role="calendar-control"><s data-role="prevyear" class="prev-y">prevyear</s><s data-role="prev" class="prev-m">prevMonth</s><s data-role="next" class="next-m">nextMonth</s><s data-role="nextyear" class="next-y">nextyear</s></div>',


*/
Mo.define('calendar', function(M) {
    var Lang = M.Lang,
        DOC = M.one('body'),
        TARGET = 'target',
        RTARGET = 'rangeTarget';

    M.widget('Calendar', {
        DAYS: '日,一,二,三,四,五,六'.split(','),

        MONTHS: '1,2,3,4,5,6,7,8,9,10,11,12'.split(','),

        UNIT_DAY: '星期',

        UNIT_MONTH: '月',

        HTML_TABLE_HEAD: '',


        ATTRS: {

            //设置日历月份跨度: 默认为1个月
            monthSpan: {
                value: 1
            },

            //设置起始显示日期: 默认为创建时间
            startMonth: {
                value: new Date()
            },

            boundingBox: {
                value: M.one('body')
            },

            rangeSelect: {
                value: false
            },
            //范围选取跨度 单位天
            rangeSpan: {
                value: 10
            },
            //选择样式
            dayPickerClass: {
                value: {
                    hover: 'hover',
                    selected: 'selected',
                    disabled: 'disabled',
                    start: 'selected',
                    end: 'selected',
                    selectedRange: 'selected'
                }
            },
            //可选范围
            dayPickerRange: {
                value: {
                    start: '2013/2/1', //start & end
                    end: '2013/10/10'
                }
            },
            target: {
                value: null
            },
            rangeTarget: {
                value: null
            }

        },
        init: function() {
            this.renderUI(this.get('boundingBox'));
        },
        //widget插入
        renderTo: function() {
            return this.get('boundingBox')
        },
        //格式化时间
        formatDate: function(ms) {
            var fulltime = ms ? new Date(ms) : new Date();
            return {
                y: fulltime.getFullYear(),
                m: (parseInt(fulltime.getMonth()) + 1),
                d: fulltime.getDate()
            }
        },
        //格式形如 2012/1/2  2012-1-2 //date {y, m, d}
        formatMS: function(date) {
            return new Date(date.y + '/' + date.m + '/' + date.d);
        },
        //获取月份天数
        daysInMonth: function(y, m) {
            return [31, (this.isLeapYear(y) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
        },

        //当年是否为闰年
        isLeapYear: function(y) {
            return (0 == y % 400) || ((0 == y % 4) && (0 != y % 100)) || (0 == y);
        },

        //获取当前月份所含星期数
        weeksInMonth: function(y, m) {
            return (this.daysInMonth(y, m) + this.firstDayOfWeek(y, m) + 6 - this.lastDayOfWeek(y, m)) / 7
        },

        //获取所处月份第一天
        firstDayOfWeek: function(y, m) {
            return this.dayInWeek(y, m, 1);
        },

        //获取所处月份最后一天
        lastDayOfWeek: function(y, m) {
            return this.dayInWeek(y, m, this.daysInMonth(y, m));
        },

        //获取日期在所处月份中的星期数
        dayInWeek: function(y, m, d) {
            var date = new Date(y + '/' + m + '/' + d);
            return date.getDay();
        },

        //获取每周的日期排列
        getQueueOfWeek: function(y, m, n) {
            //查找偏移量
            var _queue = [],
                _firstOffset = this.firstDayOfWeek(y, m), //第一周偏移量
                _lastOffset = 6 - this.lastDayOfWeek(y, m), //最后一周偏移量
                _totleWeek = this.weeksInMonth(y, m), //总周数
                endNum = this.daysInMonth(y, m),
                startNum = (n - 1) * 7 - _firstOffset + 1, //相应周开始日期
                i = 1,
                _tempArr = [];
            //修正
            for (; i <= 7; i++) {
                if (startNum > endNum) {
                    _queue.push(0);
                } else {
                    _queue.push(startNum);
                }
                startNum += 1;
            }
            return _queue;
        },

        //组织当月日期
        /*
        [{
        year: 2012,
        month: 1,
        days: [
            [0,0,1,2,3,4,5],
            [6,7,8,9,10,11,12],
            [13,14,15,16,17,18,19],
            [20,21,22,23,24,25,26],
            [27,28,29,30,31,0,0]

        ],
        current: 10}]
        */
        //按月创建一个日历
        createDayOfMonth: function(y, m) {
            var data =
                dataOfMonth = [],
                totleweek = this.weeksInMonth(y, m);

            for (var i = 1; i <= totleweek; ++i) {
                dataOfMonth.push(this.getQueueOfWeek(y, m, i));
            }
            return dataOfMonth;
        },

        createData: function(date, span) {
            var self = this,
                i = 0,
                data = [],
                output = {},
                _today = self.today(),
                span = span || self.get('monthSpan'),
                m = parseInt(date.m),
                y = parseInt(date.y),
                d = date.d ? parseInt(date.d) : null;
            //M.log(d)
            for (; i < span; i++) {
                var aweek = {};
                if (m + i - 12 > 0) {
                    aweek.m = m + i - 12;
                    aweek.y = y + 1;

                } else {
                    aweek.m = m + i;
                    aweek.y = y;
                }
                //传入选中日
                if (d && self.hasInstance) {
                    aweek.selected = d;
                    aweek.selectedm = m;
                }
                //如果当月，指定当天日期
                if (_today.y === aweek.y && _today.m === aweek.m) {
                    aweek.current = _today.d
                }
                var weekIndex = Lang.getWeekIndex(new Date([aweek.y, aweek.m, 1].join('/')));

                aweek.days = self.createDayOfMonth(aweek.y, aweek.m);
                aweek.weekIndexs = [];
                M.each(aweek.days, function(n, i) {
                    aweek.weekIndexs.push(weekIndex + i);
                });

                data.push(aweek);
            }

            output.data = data;
            //
            output.dayName = self.constructor.DAYS;

            //赋值当前切换的第一帧
            this.CURRENT_MONTH = {
                y: data[0].y,
                m: data[0].m
            };
            return output;

        },
        //暴露外部调用
        reRender: this._renderTemplateData,

        _renderTemplateData: function(data) {
            var self = this,
                tpl = self.get('tpl') ? M.Template(self.get('tpl')) : M.Template.get('calendar.days'),
                pickRange = self.get('dayPickerRange'),
                dayRange = self.dayRange,
                _start = self.formatDate(pickRange.start),
                _end = self.formatDate(pickRange.end),
                _selectedStart = dayRange && dayRange.start && self.formatDate(dayRange.start),
                _selectedEnd = dayRange && dayRange.end && self.formatDate(dayRange.end),
                _itemDate,
                CLS = self.get('dayPickerClass'),
                _disabledCLS = CLS.disabled,
                _selectedRangeCLS = CLS.selectedRange,
                _startCLS = CLS.start,
                _endCLS = CLS.end,
                _markup = tpl(this.createData(data));

            _selectedStart = _selectedStart && self.formatMS(_selectedStart).getTime();
            _selectedEnd = _selectedEnd && self.formatMS(_selectedEnd).getTime();

            self.WEEKLY_BOX.set('innerHTML', _markup);
            //如果存在可选区域
            if (_start.d || _end.d) {
                self.WEEKLY_BOX.all('a').each(function(a) {
                    var timeStart = self.formatMS(_start).getTime(),
                        timeEnd = self.formatMS(_end).getTime();
                    var item = a.ancestor(function(node) {
                        return (node.getAttr('data-role') === 'calendar-ymview') ? true : false;
                    });
                    _itemDate = M.merge(item.getDataValue(), {
                        d: a.getText()
                    });
                    _itemDate = self.formatMS(_itemDate).getTime();

                    if (_itemDate < timeStart ||
                        _itemDate > timeEnd) {
                        a.addClass(_disabledCLS);
                    } else if (_itemDate === _selectedStart) {
                        a.addClass(_startCLS);
                    } else if (_itemDate === _selectedEnd) {
                        a.addClass(_endCLS);
                    } else if (_itemDate > _selectedStart && _itemDate < _selectedEnd) {
                        a.addClass(_selectedRangeCLS);
                    }
                });
            }
            self._prepareTrigger(_start, _end, _disabledCLS);

            if (self.inited) {
                self._fixContainer();
            }

        },

        //绘制日历
        renderUI: function(container) {

            var self = this,
                startMark = self.formatDate(self.get('startMonth')),
                target = self.get('target');

            self.SELECTED_DATE = startMark;
            //指定包含容器
            self.BOUNDING_BOX = M.Node.create('<div class="calendar"></div>'); //this.get('boundingBox');

            self.WEEKLY_BOX = M.Node.create('<div class="datepicker"></div>');
            //指定控制栏
            self.CONTROL_BAR = M.Node.create($res.tpl.calendar.control);
            //指定翻页控制
            self.triggerPrevMonth = self.CONTROL_BAR.role('prev');
            self.triggerPrevYear = self.CONTROL_BAR.role('prevyear');
            self.triggerNextMonth = self.CONTROL_BAR.role('next');
            self.triggerNextYear = self.CONTROL_BAR.role('nextyear');
            //开始渲染初始日历
            self._renderTemplateData(startMark, self.get('tpl'));


            self.BOUNDING_BOX.append(self.WEEKLY_BOX).append(self.CONTROL_BAR);

            //装载进入Flyout
            if (self.get('isInsert')) {
                container.setContent(self.BOUNDING_BOX);
                self.container = container;
            } else {
                self.container = new M.getWidget('overlay', {
                    // listenerToShow: 'click',
                    bodyContent: self.BOUNDING_BOX
                });
                self.container.on('afterShow', function() {
                    // self.container.set('body', self.BOUNDING_BOX);

                    self._fixContainer();
                    self.inited = true;
                });
                self.container.render();
            }
            //绑定日历点击事件
            self._bindEvent();
            if (!self.get('isInsert')) {
                self._focusInCalendar();
            }
            //绑定日历区域鼠标位置
            if (self.get(TARGET)) {
                self._bindSingle(self.get(TARGET));
            }

            if (self.get(RTARGET)) {
                self._bindRange(self.get(RTARGET));
            }

            self._bindSelect();
            self.container.show();
        },

        show: function(el) {
            var self = this;
            self.container.set('showNode', el);
            self.container.show();

            // self.container.rePosition({
            //     target: el,
            //     pos: 'bl',
            //     posFix: {
            //         // x: -5,
            //         // y: -5
            //     },
            //     show: true
            // });
            //点击重置一下被选中
            //M.log(self.SELECTED_DATE);
            self.setRange(el);

            self._renderTemplateData(self.SELECTED_DATE);
            self.hasInstance = true;
            self.currentTarget = el;
        },

        hide: function() {
            if (!this.isInCalendar) {
                this.Flyout.hide();
            }
        },
        setRange: function(el) {
            var self = this,
                start, end,
                rTargets = self.get(RTARGET);
            if (!rTargets || !Lang.isArray(rTargets)) return;

            self._setDefaultRange();

            start = rTargets[0].get('value').replace(/-/g, '/');
            end = rTargets[1].get('value').replace(/-/g, '/');
            self.dayRange = {
                start: start,
                end: end
            };

            switch (el) {
                case rTargets[0]:
                    end &&
                        self.set('dayPickerRange', {
                            start: self.defaultRange.start,
                            end: end
                        });
                    self.SELECTED_DATE = start ? self.formatDate(start) : self.SELECTED_DATE;
                    break;
                case rTargets[1]:
                    start &&
                        self.set('dayPickerRange', {
                            start: start,
                            end: self.defaultRange.end
                        });
                    self.SELECTED_DATE = end ? self.formatDate(end) : self.SELECTED_DATE;
                    break;
                default:
                    self.set('dayPickerRange', self.defaultRange);
                    break;
            }

        },
        _setDefaultRange: function() {
            var self = this;
            self.defaultRange = self.defaultRange || self.get('dayPickerRange');
        },
        setDayPickerRange: function(range) {
            var self = this,
                orgRange = self.get('dayPickerRange');
            self.set('dayPickerRange', M.merge(orgRange, range));
        },
        _bindSingle: function(target) {
            var self = this;
            target.on({
                click: function() {
                    self.show(target);
                },
                focus: function() {
                    !self.isCompleteSet && self.show(target);
                },
                blur: function() {
                    self.hide();
                    self.isCompleteSet = false;
                }
            });
        },
        _bindSelect: function() {
            var self = this;
            self.on('select', function(e) {
                self.currentTarget && self.currentTarget.set('value', e.format);
            });
        },
        _bindRange: function(target) {
            var self = this,
                length;
            length = Lang.isArray(target) && target.length;
            if (length !== 2) return;

            M.each(target, function(t, i) {
                self._bindSingle(t);
            });


        },
        //判断光标是否在flyout内
        _focusInCalendar: function() {
            var self = this;
            self.isInCalendar = false;
            self.container.get('dom').on({
                mouseenter: function() {
                    self.isInCalendar = true;
                },
                mouseleave: function() {
                    self.isInCalendar = false;
                    self.currentTarget.focus();;
                }
            });

        },

        _fixContainer: function() {
            var self = this,
                span = self.get('monthSpan'),
                _bd = self.WEEKLY_BOX.all('.bd');
            //给日历设定宽度
            _bd.item(_bd.size() - 1).removeClass('separator');
            if (span > 1) {
                self.BOUNDING_BOX.setStyle('width', _bd.item(0).get('region').width * span);
            }
        },


        _prepareTrigger: function(_start, _end, cls) {
            var self = this,
                //是否开启向下翻
                //如果向上已经被禁用了，查看隔开span后一个月是否有可选，如果有就点亮切换按钮
                _next = self._nextMonth(),
                _nexty = self._nextYear(),
                _prev = self._prevMonth(),
                _prevy = self._prevYear();
            //向下翻月
            if (self.formatMS(self._nextMonth_FirstDay(_next)) < self.formatMS(_end)) {
                self.triggerNextMonth.removeClass(cls);
            } else {
                self.triggerNextMonth.addClass(cls);
            }
            //向下翻年
            if (self.formatMS(self._nextYear_FirstDay(_nexty)) < self.formatMS(_end)) {
                self.triggerNextYear.removeClass(cls);
            } else {
                self.triggerNextYear.addClass(cls);
            }

            if (self.formatMS(self._prevMonth_LastDay(_prev)) > self.formatMS(_start)) {
                self.triggerPrevMonth.removeClass(cls);
            } else {
                self.triggerPrevMonth.addClass(cls);
            }

            //alert(_prevy.y + '/' + _prevy.m + '/' + _prevy.d+';'+_end.y + '/' + _end.m + '/' + _end.d)
            if (self.formatMS(self._prevYear_LastDay(_prevy)) > self.formatMS(_start)) {
                self.triggerPrevYear.removeClass(cls);
            } else {
                self.triggerPrevYear.addClass(cls);
            }


        },
        nextMonth:function(){
            var self = this;
            var nextDate = self._nextMonth();
            self.CURRENT_MONTH = nextDate;
            self._renderTemplateData(nextDate);
        },
        previousMonth:function(){
            var self = this;
            var prevDate = self._prevMonth();
            self.CURRENT_MONTH = prevDate;
            self._renderTemplateData(prevDate);
        },
        _bindEvent: function() {
            var self = this,
                nextDate,
                prevDate,
                prevYear,
                nextYear,
                outputDate = {},
                showDate,
                _classManage = self.get('dayPickerClass'),
                CLS_SELECT = _classManage.selected,
                CLS_HOVER = _classManage.hover,
                CLS_DISABLED = _classManage.disabled;

            //this.BOUNDING_BOX.delegate()

            this.triggerNextMonth.on('click', function(e) {
                if (self._preventClick(e, CLS_DISABLED)) return;
                self.nextMonth();
            });
            this.triggerPrevMonth.on('click', function(e) {
                if (self._preventClick(e, CLS_DISABLED)) return;
            });
            this.triggerNextYear.on('click', function(e) {
                if (self._preventClick(e, CLS_DISABLED)) return;
                nextYear = self._nextYear();
                self.CURRENT_MONTH = nextYear;
                self._renderTemplateData(nextYear)
            });
            this.triggerPrevYear.on('click', function(e) {
                if (self._preventClick(e, CLS_DISABLED)) return;
                prevYear = self._prevYear();
                self.CURRENT_MONTH = prevYear;
                self._renderTemplateData(prevYear)
            });

            //绑定单项点击
            if (!this.get('rangeSelect')) {
                this.WEEKLY_BOX.delegate('click', function(e) {
                    e.halt();
                    var el = e.currentTarget,
                        item;
                    if (el.hasClass(CLS_DISABLED)) {
                        self.isInCalendar = true;
                        return;
                    }
                    self.WEEKLY_BOX.all('a').each(function(a) {
                        a.removeClass(CLS_SELECT);
                        el.addClass(CLS_SELECT);
                    });

                    item = el.ancestor(function(node) {
                        return (node.getAttr('data-role') === 'calendar-ymview') ? true : false;
                    });

                    outputDate = M.merge(outputDate, {
                        y: parseInt(item.getDataValue().y),
                        m: parseInt(item.getDataValue().m),
                        d: parseInt(el.getText())
                    });


                    showDate = outputDate.y + '-' + outputDate.m + '-' + outputDate.d;
                    //单击绑定选择后的回调
                    self.fire('select', {
                        weekIndex: el.ancestor('tr').one('.weeks').getText(),
                        output: outputDate,
                        format: showDate
                    });
                    if (!self.get('isInsert')) {
                        self.container.hide();
                    }

                    //指定被选中
                    self.SELECTED_DATE = outputDate;
                    self.isCompleteSet = true;

                }, 'a');
            } else {
                //如果是范围点击，需记录两次点击
                //Todo
                this.WEEKLY_BOX.delegate('click', function(e) {


                }, 'td');
            }

        },
        _preventClick: function(e, cls) {
            e.halt();
            var el = e.currentTarget;
            return el.hasClass(cls) ? true : false;
        },
        //_nextMonth
        _nextMonth: function() {
            var self = this.CURRENT_MONTH,
                _m = self.m,
                _y = self.y;
            if (_m + 1 > 12) {
                _m = _m + 1 - 12;
                _y = _y + 1;
            } else {
                _m = _m + 1;
            }
            return {
                m: _m,
                y: _y
            }
        },
        //prevMonth
        _prevMonth: function() {
            var self = this.CURRENT_MONTH,
                _m = self.m,
                _y = self.y;
            if (_m - 1 == 0) {
                _m = _m + 11;
                _y = _y - 1;
            } else {
                _m = _m - 1;
            }
            return {
                m: _m,
                y: _y
            }
        },
        //_prevYear
        _prevYear: function() {
            var self = this.CURRENT_MONTH;
            return {
                m: self.m,
                y: self.y - 1
            }
        },
        //_prevYear
        _nextYear: function() {
            var self = this.CURRENT_MONTH;
            return {
                m: self.m,
                y: self.y + 1
            }
        },
        _nextMonth_FirstDay: function(obj) {
            var span = this.get('monthSpan');
            obj.m = obj.m + span - 1;
            if (obj.m > 12) {
                obj.m = obj.m - 12;
                obj.y = obj.y + 1;
            }
            obj.d = 1;
            return obj;
        },
        _nextYear_FirstDay: function(obj) {
            obj.d = 1;
            return obj;
        },
        _prevMonth_LastDay: function(obj) {

            obj.d = this.daysInMonth(obj.y, obj.m);
            return obj;
        },
        _prevYear_LastDay: function(obj) {
            obj.d = this.daysInMonth(obj.y, obj.m);
            return obj;
        },
        //显示今天
        today: function() {
            return this.formatDate();
        }


    });

});