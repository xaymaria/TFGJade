$(document).ready(function () {
  /* Bootstrap functions */
  $('[data-toggle="tooltip"]').tooltip();

  $('.components .logoSmall').on('click', function(){
    $(this)
      .toggleClass('logoActive')
      .removeClass('logoActiveHover logoHover');
  });
  $('.components h4').on('click', function(){
    $(this).prev()
      .toggleClass('logoActive')
      .removeClass('logoActiveHover logoHover');
  });

  $('.components h4').on('mouseenter', function(){
    var prev = $(this).prev();
    if(prev.hasClass('logoActive')){
      prev.addClass('logoActiveHover');
    }else{
      prev.addClass('logoHover');
    }
  });

  $('.components h4').on('mouseleave', function(){
    var prev = $(this).prev();
    prev.removeClass('logoActiveHover logoHover');
  });
});