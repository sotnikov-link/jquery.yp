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
  var gapi_ready;
  window.onGoogleLoad = function () {
    gapi.client.setApiKey('AIzaSyDusM-PANrcOchwOPwzeUReSsRoyhOfNzM');
    gapi.client.load('youtube', 'v3', function() {
      gapi_ready = true;
      if (conf.debug) console.log('>>> 1) GAPI Ready and YouTube v3 API loaded.');
      if (api.ready) $(api.$waiting).trigger(api.event_type_for_ready);
    });
  };

  window.onYouTubeIframeAPIReady = function () {
    api.ready = true;
    if (conf.debug) console.log('>>> 1) You Tube Iframe API Ready.');
    if (gapi_ready) $(api.$waiting).trigger(api.event_type_for_ready);
  };

  // Загрузка API YouTube через IFrame
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  function requestPlaylistItems (args) {
    // args = {
    //   playlistId: String,
    //   callback: Function,
    //   pageToken: String // not required
    // };

    var requestOptions = {
      playlistId: args.playlistId,
      part: 'snippet',
      maxResults: 50
    };

    if (args.pageToken) {
      requestOptions.pageToken = args.pageToken;
    }

    console.log('!!! >>> args.pageToken = ' + args.pageToken);

    var request = gapi.client.youtube.playlistItems.list(requestOptions);

    request.execute(function(response) {
      args.callback(response.result);
    });
  }

  function displayPlaylistItems($yp, result) {
    $yp.find('.yp__list').removeClass('yp__list_loading');

    if (conf.debug) console.log('playlist items:', result.items);
    if (conf.debug) console.log('result.nextPageToken:', result.nextPageToken);
  }

  function displayPlaylist(id, $yp) {
    // Get info of playlist and display
    gapi.client.youtube.playlists.list({
      id: id,
      part: 'snippet',
      maxResults: 50
    })
    .execute(
      function(response) {
        var info = response.result.items[0].snippet;
        if (conf.debug) console.log('playlist info:', info);
        var $list_link = $yp.find('.yp__list-link').text(info.title);
        $list_link.attr('href', $list_link.attr('href') + id);

        var $channel_link = $yp.find('.yp__channel-link').text(info.channelTitle);
        $channel_link.attr('href', $channel_link.attr('href') + info.channelId);
      }
    );

    // Get info of items from playlist
    requestPlaylistItems({
      playlistId: id,
      callback: function (result) {
        $yp.find('.yp__list-count').text(result.pageInfo.totalResults);
        displayPlaylistItems($yp, result);

        var nextPageToken = result.nextPageToken ? result.nextPageToken : false;

        function displayNextItems(result) {
          displayPlaylistItems($yp, result);
          nextPageToken = result.nextPageToken ? result.nextPageToken : false;
          getDataNextItems();
        }

        function getDataNextItems() {
          requestPlaylistItems({
            playlistId: id,
            callback: displayNextItems(result),
            pageToken: nextPageToken
          });
        }

        if (nextPageToken) {
          getDataNextItems();
        }
      }
    });

    if (conf.debug) console.log('playlistId:', id);
  }

  // Функция плагина «yp» для jQyery
  $.fn.yp = function () {
    function createPlaylist() {
      var $yp = $(this);

      // Вешаем одноразовое событие
      $yp.one(api.event_type_for_ready, function (event) {
        if (conf.debug) console.log('>>> 2) Start event for player.', gapi_ready, api.ready);

        function onPlayerReady(event) {
          // В режиме debug, даем доступ к АПИ плеера
          if (conf.debug) window.yp_api.push(event.target);

          // Функция отрисовки элементов в плейлисте, нуждается в данных о
          // видео элементах и в html'е всего плагина «yp».
          displayPlaylist(event.target.getPlaylistId(), $yp);
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
      if (api.ready && gapi_ready) $yp.trigger(api.event_type_for_ready);
      else api.$waiting.push($yp[0]);
    }

    return this.each(createPlaylist);
  };
})(jQuery);
