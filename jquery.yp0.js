(function () {

  var config = {
    debug: true,
  };

  var api_ready = {
    status: false,
    event_type: 'apiready.yp',
  };

  // 1. This code loads the IFrame Player API code asynchronously.
  //    This function creates an <iframe> (and YouTube player)
  //    after the API code downloads.
  window.onYouTubeIframeAPIReady = function () {
    api_ready.status = true;
    $('.yp').trigger(api_ready.event_type); // TODO: Это неправильно, должен быть буфер
  };

  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // 2. Функция для JQuery.
  $.fn.yp = function () {
    var make = function () {
      var $e = $(this);
      var template_li = $e.find('.yp__li_model');

      $e.one(api_ready.event_type, function (event) {
        var api = new YT.Player(
          event.target
            .getElementsByClassName('yp__player')[0]
            .getElementsByTagName('iframe')[0].id,
          {
            events: {
              'onReady': onPlayerReady,
              'onStateChange': function (event) { console.log('!!! onStateChange', event.data); }
            }
          }
        ); // YouTube Player API

        if (config.debug) window.api = api;

        function onPlayerReady (event) {
          var pl = [];

          switch (api.stopVideo()) {
            default:
              pl = api.getPlaylist();
              if (config.debug) console.log('playlist: ', pl);
          }

          // api.stopVideo();
          // var playlist = api.getPlaylist();
          // if (config.debug) console.log('playlist: ', playlist);
          //
          // $.each(playlist, function (i, e) {
          //
          // });
        }
      });

      if (api_ready.status) {
        $e.trigger(api_ready.event_type);
        if (config.debug)
          console.log('API было готово, произведен быстрый запуск!');
      } // TODO: Это неправильно, должен быть буфер еще в else
    };

    return this.each(make);
  };
})(jQuery);
