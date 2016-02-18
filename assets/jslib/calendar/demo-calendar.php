<?
	$pagetitle = "calendar 日历";
	$pagedescription = '描述';
	$pagekeywords = "";

?>

<?php include("../_inc/before-body-moui.php"); ?>

 <link href="http://r.krss.cn/~?f=usage/home&v=0.0.0.1" rel="stylesheet">

<div id="form1" style="margin:0 auto; width: 400px">
    <br/><br/><br/><br/>
    <legend>日历</legend>
    <div id="calendar"></div>
    <p>单日历</p>
    <input type="text" id="input" />
    <br><br>
    <p>范围日历</p>
    <input type="text" id="input1" />
    <input type="text" id="input2" />
</div>

<div id="form2">
     <legend>表单2</legend>
   <form data-role="form2">

    </form>
</div>


<?php include("../_inc/after-body-moui.php"); ?>


<script>
    Mo.require('calendar', function(M){

        /** 单日历


        */
        var SingleCalendar = new M.Calendar({
            target: M.one('#input')
        });


        /** 范围日历


        */
        var RangeCalendar = new M.Calendar({
            rangeTarget: [M.one('#input1'), M.one('#input2')],
            monthSpan: 2
        });


    });
</script>
