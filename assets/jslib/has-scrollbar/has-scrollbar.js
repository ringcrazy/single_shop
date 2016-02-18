/*
	判读当前元素是否可以滚动
*/
Mo.define('has-scrollbar', function(M){
	M.extend(M.Node, {
        "hasScrollbar": function() {
            return this.getDOMNode().scrollHeight - this.get('region').height > 0;
        }
    });
});