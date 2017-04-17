setInterval(function() {
  clock();
}, 1000);

function clock()
{
  var time = new Date();
  var hours = time.getHours();
  var minutes = time.getMinutes();
  
  if ($('.h').text() != ((hours < 10 ? "0" : "") + hours)){
     $('.h').text((hours < 10 ? "0" : "") + hours);
     shake($('.h'));
  }
  
  if ($('.m').text() != ((minutes < 10 ? "0" : "") + minutes)) {
    $('.m').text((minutes < 10 ? "0" : "") + minutes);
    shake($('.m'));
  }

}

$(document).ready(function(){
  clock();
});

function shake(t) {
  t.addClass('shake-constant');
  setTimeout(function() {
    t.removeClass('shake-constant');
  }, 470)
}