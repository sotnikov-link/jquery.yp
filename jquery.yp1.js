(function () {
  var conf = {
    debug: true,
  };

  if (conf.debug) window.yp_api = [];

  var api = {
    ready: false,
    event_type_for_ready: 'onApiReady.yt',
    $waiting : [] // Массив $элементов ожидающие готовности API
  };

  // Функция будет вызвана после загрузки API YouTube, вызывает для всех
  // ожидающих элементов событие
  window.onYouTubeIframeAPIReady = function () {
    api.ready = true;
    $(api.$waiting).trigger(api.event_type_for_ready);
  };

  // Загрузка API YouTube через IFrame
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // Основные функции для работы с элементом

  //
  function getPlaylist(playlistIDs, player) {

    return $.each(playlistIDs, function (i, v) {
      playlistIDs[i] = player.getVideoData(playlistIDs[i]);
    });
  }

  function drawPlaylist (playlist, $e) {
    console.log('>>> WOW! → ', playlist, $e);
  }

  // Функция плгина «yp» для jQyery
  $.fn.yp = function () {
    function createPlaylist() {
      var $e = $(this);

      // Вешаем одноразовое событие
      $e.one(api.event_type_for_ready, function (event) {
        var count_state5 = 0;
        var playlist = [];

        function onPlayerReady(event) {
          // В режиме debug, даем доступ к АПИ плеера
          if (conf.debug) window.yp_api.push(event.target);

          // Функция отрисовки элементов в плейлисте, нуждается в данных о
          // видео элементах и в html'е всего плагина «yp».
          drawPlaylist(
            getPlaylist(
              event.target.cuePlaylist(
                {
                  list: event.target.getPlaylistId(),
                  index: event.target.getPlaylistIndex()
                }
              )
            ), // Model/Data
            event.target // player
          );
        }

        var player = new YT.Player(
          event.target
          .getElementsByClassName('yp__player')[0]
          .getElementsByTagName('iframe')[0].id,

          {events: {'onReady': onPlayerReady,}}
        );
      });

      // Если API готово, сразу вызываем событие, иначе добавляем элемент
      // в ожидание готовности
      if (api.ready) $e.trigger(api.event_type_for_ready);
      else api.$waiting.push($e[0]);
    }

    return this.each(createPlaylist);
  };
})(jQuery);
