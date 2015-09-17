module.exports = function() {
  return function(deck) {
    var VIMEO_URI_RE = /\/\/player\.vimeo\.com\//,
      YOUTUBE_URI_RE = /\/\/www\.youtube\.com\/embed\//,
      isLocalFile = window.location.protocol === 'file:',
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
      findVideos = function(scope) {
        return scope.querySelectorAll('video, iframe[src*="//www.youtube.com/embed/"], iframe[src*="//player.vimeo.com/"]');
      },
      playObject = function(obj) {
        if (typeof obj.play === 'function') {
          if (obj.paused === true) {
            // QUESTION should we raise a videoplayed event?
            //obj.currentTime = 0;
            obj.play();
          }
        }
        else if (typeof obj.src === 'string') {
          if (VIMEO_URI_RE.test(obj.src)) {
            if (isLocalFile) {
              console.warn('Access denied: Cannot automatically play Vimeo video since deck is loaded from a file:// URI');
            }
            else {
              obj.contentWindow.postMessage('{ "method": "play" }', '*');
            }
          }
          else if (YOUTUBE_URI_RE.test(obj.src)) {
            if (isLocalFile) {
              console.warn('Access denied: Cannot automatically play YouTube video since deck is loaded from a file:// URI');
            }
            else {
              var volume = parseInt(obj.getAttribute('data-volume'));
              if (volume >= 0 && volume <= 100) {
                obj.contentWindow.postMessage('{ "event": "command", "func": "setVolume", "args": [' + volume + '] }', '*');
              }
              obj.contentWindow.postMessage('{ "event": "command", "func": "playVideo" }', '*');
            }
          }
        }
      },
      pauseObject = function(obj) {
        if (typeof obj.pause === 'function') {
          if (obj.paused === false) {
            // QUESTION should we raise a videopaused event?
            obj.pause();
          }
        }
        else if (typeof obj.src === 'string') {
          if (VIMEO_URI_RE.test(obj.src)) {
            if (!isLocalFile) obj.contentWindow.postMessage('{ "method": "pause" }', '*');
          }
          else if (YOUTUBE_URI_RE.test(obj.src)) {
            if (!isLocalFile) obj.contentWindow.postMessage('{ "event": "command", "func": "pauseVideo" }', '*');
          }
        }
      },
      playVideos = function(slide) {
        forEach(findVideos(slide), playObject);
      },
      pauseVideos = function(slide) {
        forEach(findVideos(slide), pauseObject);
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
          pauseVideos(e.slide);
        }
        else {
          playVideos(e.slide);
          restartAnimations(e.slide);
        }
      },
      deactivate = function(e) {
        pauseVideos(e.slide);
      };
    deck.on('activate', activate);
    deck.on('deactivate', deactivate);
  };
};
