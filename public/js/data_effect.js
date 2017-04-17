//状态栏显示数据效果
var
function shake(t) {
    t.addClass('shake-constant');
    setTimeout(function() {
        t.removeClass('shake-constant');
    }, 470)
}