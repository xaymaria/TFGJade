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

  var url = window.location;
  $('ul.nav a[href="'+ url +'"]').parent().addClass('active');

  $('ul.nav a').filter(function() {
    return this.href == url;
  }).parent().addClass('active');

  $(".navbar a, footer a[href='#myPage']").on('click', function(event) {

    if (this.hash !== "") {
      event.preventDefault();

      var hash = this.hash;
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 900, function(){

        window.location.hash = hash;
      });
    }
  });
});