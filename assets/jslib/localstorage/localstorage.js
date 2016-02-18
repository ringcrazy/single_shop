Mo.define('localstorage', function(M) {

    /** 
    * @namespace M.LocalStorage
    */
    M.LocalStorage = {};

    M.extend(M.LocalStorage, /** @lends M.LocalStorage */{
        /**
         * 设置本地存储支持expire
         * @static
         * @example
         * var loc = M.LocalStorage,
         *     k = 'locTest',
         *     v = {
         *      a: '11',
         *      b: '22'
         *     },
         *     exp = 100;
         *
         * loc.setItem(k,JSON.stringify(v),exp);
         *
         * @param {string} key    关键字
         * @param {string} value  值
         * @param {Number} [expire] 过期时间(以秒为单位)
         *
         */
        setItem: function(key, value, expire) {
            var curTime = new Date().getTime();
            //根据key生成对象
            var obj = {
                $value: value,
                $expire: (expire && expire > 0) ? expire : -1,
                $setTime: curTime
            };
            localStorage[key] = JSON.stringify(obj);
        },
        /**
         * 获取本地存储
         * @static
         * @example
         * var loc = M.LocalStorage,
         *     k = 'locTest';
         *
         * var v = loc.setItem(k);
         *
         * @param {string} key    关键字
         * @return {string} value 值
         *
         */
        getItem: function(key) {
            var curTime = new Date().getTime();
            var val = localStorage[key],
                obj;
            if (val) {
                try{
                    obj = JSON.parse(val);
                }catch(eee){
                    //console.log('使用原生localStorage设置:'+val);
                    return val; //使用原生localStorage设置
                }
                if (obj.$expire && obj.$expire != -1) { //设置了过期时间
                    //当前时间-设置时间小于过期时间则返回值
                    if (curTime - obj.$setTime <= obj.$expire * 1000) {
                        //console.log('设置过期时间返回值:'+obj.$value);
                        return obj.$value;
                    } else {
                        //清空localStorage
                        this.removeItem(key);
                        return undefined;
                    }
                } else if(obj.$value){ //没设置过期时间直接返回值
                    //console.log('没设置过期时间直接返回值:'+obj.$value);
                    return obj.$value;
                }else{
                    //console.log('使用原生localStorage设置:'+val);
                    return val; //使用原生localStorage设置的obj
                }
            }
            return obj;
        },
        /**
         * 删除本地存储
         * @static
         * @example
         * var loc = M.LocalStorage,
         *     k = 'locTest';
         *
         * loc.removeItem(k);
         *
         * @param {string} key    关键字
         *
         */
        removeItem: function(key) {
            localStorage.removeItem(key);
        },

        /**
         * 获取带有指定前缀的所有数据
         * @param  {[string]} prefix 
         * @return {[Object]}        
         */
        getAllItemsByPrefix:function(prefix){
            var items=[];
            for(var i in localStorage){
                if(i.indexOf(prefix)>-1){
                    items.push({
                        key:i,
                        value:localStorage[i]
                    })
                }
            }
            return items;
        },

        /**
         * 获取带有指定前缀的数据的数量
         * @param  {[string]} prefix 
         * @return {[number]}        
         */
        getItemsCountByPrefix:function(prefix){
            return this.getAllItemsByPrefix(prefix).length;
        },

        /**
         * 删除所有带有前缀的数据
         * @param  {[string]} prefix 
         * @return {[null]}        
         */
        clearAllItemsByPrefix:function(prefix){
            for(var i in localStorage){
                if(i.indexOf(prefix)>-1){
                    this.removeItem(i);
                }
            }
        },

        /**
         * 向指定key中添加历史记录
         * @param {[type]} key   [description]
         * @param {[type]} value [description]
         */
        addItem:function(key, value){
            var history = this.getItem(key);
            
            // 存在历史记录
            if(history){

                // 清除掉重复的历史记录
                for(var i=0,l=history.length;i<l;i++){
                    if(history[i].address === value.address){
                        history.splice(i,1);
                        break;
                    }
                }
                history.unshift(value);
                this.setItem(key, history);
            }else{
                this.setItem(key, [value]);
            }
        },

        /**
         * 删除指定key中的单条数据
         * @param  {string} key   键名称
         * @param  {sting} value 地址名称
         * @return {[type]}       [description]
         */
        deleteValue:function(key, value){
            var history = this.getItem(key);
            if(history){
                for(var i=0,l=history.length;i<l;i++){
                    if(history[i].address === value){
                        history.splice(i,1);
                        break;
                    }
                }
                this.setItem(key, history);
            }
        }
    });
});