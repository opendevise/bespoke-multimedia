module.exports = function() {
  return function(deck) {
    var VIMEO_URI_RE = /\/\/player\.vimeo\.com\//,
      YOUTUBE_URI_RE = /\/\/www\.youtube\.com\/embed\//,
      isLocal = window.location.protocol === 'file:',
      forEach = function(c, fn) {
        Array.prototype.forEach.call(c, fn);
      },
      findAnimatedSvgs = function(scope) {
        // QUESTION should we require an "animated" class on the object element?
        return scope.querySelectorAll('object[type="image/svg+xml"]');
      },
      findGifs = function(scope) {
        return scope.querySelectorAll('img[src*=".gif"]');
      },
      findMedia = function(scope) {
        return scope.querySelectorAll('audio,video,iframe[src*="//www.youtube.com/embed/"],iframe[src*="//player.vimeo.com/"]');
      },
      playMedia = function(obj) {
        var volume = parseInt(obj.getAttribute('data-volume'), 10);
        if (volume < 0 || volume > 100) volume = null;
        if (typeof obj.play === 'function') {
          if (obj.paused === true) {
            if (volume !== null) obj.volume = (volume / 100);
            obj.play();
          }
        }
        else if (typeof obj.src === 'string') {
          if (VIMEO_URI_RE.test(obj.src)) {
            if (isLocal) {
              console.warn('Access denied: Cannot automatically play Vimeo video since deck is loaded from a file:// URI.');
            }
            else {
              // TODO support volume
              obj.contentWindow.postMessage('{ "method": "play" }', '*');
            }
          }
          else if (YOUTUBE_URI_RE.test(obj.src)) {
            if (isLocal) {
              console.warn('Access denied: Cannot automatically play YouTube video since deck is loaded from a file:// URI.');
            }
            else {
              if (volume !== null) obj.contentWindow.postMessage('{ "event": "command", "func": "setVolume", "args": [' + volume + '] }', '*');
              obj.contentWindow.postMessage('{ "event": "command", "func": "playVideo" }', '*');
            }
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
      // NOTE doesn't work reliably in Firefox
      restartSvgAnimation = function(obj) {
        // NOTE obj.data resolves to the qualified URL; getAttribute('data') returns original value
        obj.data = obj.getAttribute('data'); // setting data forces element to reload, restarting SVG animation
        //obj.setAttribute('data', obj.getAttribute('data'));
      },
      restartSvgAnimations = function(slide) {
        forEach(findAnimatedSvgs(slide), restartSvgAnimation);
      },
      restartGifAnimation = function(img) {
        // NOTE obj.src resolves to the qualified URL; getAttribute('src') returns original value
        img.src = img.getAttribute('src'); // setting src forces element to reload, restarting GIF animation
      },
      restartGifAnimations = function(slide) {
        forEach(findGifs(slide), restartGifAnimation);
      },
      restartAnimations = function(slide) {
        restartSvgAnimations(slide);
        restartGifAnimations(slide);
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
      };
    deck.on('activate', activate);
    deck.on('deactivate', deactivate);
  };
};
