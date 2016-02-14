module.exports = function() {
  return function(deck) {
    var VIMEO_URI_RE = /\/\/player\.vimeo\.com\//,
      YOUTUBE_URI_RE = /\/\/www\.youtube\.com\/embed\//,
      PLAYBACK_DENIED_MSG = 'Access denied: Cannot automatically play %s video since deck is loaded from a file:// URI.',
      isLocal = window.location.protocol === 'file:',
      forEach = function(c, fn) {
        Array.prototype.forEach.call(c, fn);
      },
      findGifs = function(scope) {
        return scope.querySelectorAll('img[src*=".gif"]');
      },
      findMedia = function(scope) {
        return scope.querySelectorAll('audio,video,iframe[src*="//www.youtube.com/embed/"],iframe[src*="//player.vimeo.com/"]');
      },
      findSvgs = function(scope, specifier) {
        // QUESTION should we require an "animated" class on the object element?
        return scope.querySelectorAll('object[type="image/svg+xml"]' + (specifier === undefined ? '' : specifier));
      },
      playMedia = function(obj) {
        var volume = obj.hasAttribute('data-volume') ? parseInt(obj.getAttribute('data-volume'), 10) : null;
        if (volume !== null) {
          if (volume < 0) volume = 0;
          if (volume > 100) volume = 100;
        }
        if (typeof obj.play === 'function') {
          if (obj.paused === true) {
            if (volume !== null) obj.volume = (volume / 100);
            obj.play();
          }
        }
        else if (typeof obj.src === 'string') {
          if (VIMEO_URI_RE.test(obj.src)) {
            if (isLocal) return console.warn(PLAYBACK_DENIED_MSG.replace(/%s/, 'Vimeo'));
            if (volume !== null) obj.contentWindow.postMessage('{ "method": "setVolume", "value": ' + (volume / 100) + ' }', '*');
            obj.contentWindow.postMessage('{ "method": "play" }', '*');
          }
          else if (YOUTUBE_URI_RE.test(obj.src)) {
            if (isLocal) return console.warn(PLAYBACK_DENIED_MSG.replace(/%s/, 'YouTube'));
            if (volume !== null) obj.contentWindow.postMessage('{ "event": "command", "func": "setVolume", "args": [' + volume + '] }', '*');
            obj.contentWindow.postMessage('{ "event": "command", "func": "playVideo" }', '*');
          }
        }
      },
      pauseMedia = function(obj) {
        if (typeof obj.pause === 'function') {
          if (obj.paused === false) obj.pause();
        }
        else if (typeof obj.src === 'string' && !isLocal) {
          if (VIMEO_URI_RE.test(obj.src)) {
            obj.contentWindow.postMessage('{ "method": "pause" }', '*');
          }
          else if (YOUTUBE_URI_RE.test(obj.src)) {
            obj.contentWindow.postMessage('{ "event": "command", "func": "pauseVideo" }', '*');
          }
        }
      },
      playAllMedia = function(slide) {
        forEach(findMedia(slide), playMedia);
      },
      pauseAllMedia = function(slide) {
        forEach(findMedia(slide), pauseMedia);
      },
      activateSvg = function(obj) {
        if (obj.getAttribute('data-reload') === 'true') {
          reloadSvg(obj);
        }
        else {
          var svg = obj.contentDocument.documentElement;
          if (svg.tagName === 'svg') {
            svg.classList.add('active');
          }
          else {
            obj.onload = function() { // wait for the SVG to load into the object container
              this.onload = null;
              if (deck.slides[deck.slide()].contains(this)) {
                this.contentDocument.documentElement.classList.add('active');
              }
            };
          }
        }
      },
      reloadSvg = function(obj) {
        // NOTE obj.data resolves to the qualified URL while getAttribute('data') returns original value
        obj.data = obj.getAttribute('data'); // setting data forces element to reload, replaying autostart animations
      },
      activateSvgs = function(slide) {
        forEach(findSvgs(slide), activateSvg);
      },
      reloadGif = function(img) {
        // NOTE obj.src resolves to the qualified URL while getAttribute('src') returns original value
        img.src = img.getAttribute('src'); // setting src forces element to reload, restarting GIF animation
      },
      reloadGifs = function(slide) {
        forEach(findGifs(slide), reloadGif);
      },
      restartAnimations = function(slide) {
        activateSvgs(slide);
        reloadGifs(slide);
      },
      deactivateSvg = function(obj) {
        obj.onload = null;
        var svg = obj.contentDocument.documentElement;
        if (svg.tagName === 'svg') svg.classList.remove('active');
      },
      deactivateSvgs = function(slide) {
        forEach(findSvgs(slide, ':not([data-reload="true"])'), deactivateSvg);
      },
      activate = function(e) {
        if (e.preview) {
          pauseAllMedia(e.slide);
        }
        else {
          playAllMedia(e.slide);
          restartAnimations(e.slide);
        }
      },
      deactivate = function(e) {
        pauseAllMedia(e.slide);
        deactivateSvgs(e.slide);
      };
    deck.on('activate', activate);
    deck.on('deactivate', deactivate);
  };
};
