module.exports = function() {
  return function(deck) {
    var VIMEO_URI_RE = /\/\/player\.vimeo\.com\//, YOUTUBE_URI_RE = /\/\/www\.youtube\.com\/embed\//,
      PLAYBACK_DENIED_MSG = 'Access denied: Cannot automatically play %s video since deck is loaded from a file:// URI.',
      local = window.location.protocol === 'file:',
      forEach = function(c, fn) {
        Array.prototype.forEach.call(c, fn);
      },
      postMessage = function(obj, msg) {
        obj.contentWindow.postMessage(JSON.stringify(msg), '*');
      },
      findGifs = function(scope) {
        return scope.querySelectorAll('img[src*=".gif"]');
      },
      findMedia = function(scope) {
        return scope.querySelectorAll('audio,video,iframe[src*="//www.youtube.com/embed/"],iframe[src*="//player.vimeo.com/"]');
      },
      findSvgs = function(scope, specifier) {
        return scope.querySelectorAll('object[type="image/svg+xml"]' + (specifier || ''));
      },
      playMedia = function(obj) {
        var vol = obj.hasAttribute('data-volume') ? Math.max(Math.min(parseFloat(obj.getAttribute('data-volume')), 10), 0) : null;
        if (typeof obj.play === 'function') {
          if (obj.paused === true) {
            if (vol !== null) obj.volume = vol/10;
            obj.play();
          }
        }
        else if (obj.hasAttribute('src')) {
          if (VIMEO_URI_RE.test(obj.src)) {
            if (local) return console.warn(PLAYBACK_DENIED_MSG.replace(/%s/, 'Vimeo'));
            if (vol !== null) postMessage(obj, {'method': 'setVolume', 'value': vol/10});
            postMessage(obj, {'method': 'play'});
          }
          else if (YOUTUBE_URI_RE.test(obj.src)) {
            if (local) return console.warn(PLAYBACK_DENIED_MSG.replace(/%s/, 'YouTube'));
            if (vol !== null) postMessage(obj, {'event': 'command', 'func': 'setVolume', 'args': [vol*10]});
            postMessage(obj, {'event': 'command', 'func': 'playVideo'});
          }
        }
      },
      pauseMedia = function(obj) {
        if (typeof obj.pause === 'function') {
          if (obj.paused === false) obj.pause();
        }
        else if (obj.hasAttribute('src') && !local) {
          if (VIMEO_URI_RE.test(obj.src)) postMessage(obj, {'method': 'pause'});
          else if (YOUTUBE_URI_RE.test(obj.src)) postMessage(obj, {'event': 'command', 'func': 'pauseVideo'});
        }
      },
      playAllMedia = function(slide) {
        forEach(findMedia(slide), playMedia);
      },
      pauseAllMedia = function(slide) {
        forEach(findMedia(slide), pauseMedia);
      },
      activateSvg = function(obj) {
        if (obj.getAttribute('data-reload') === 'true') reloadSvg(obj);
        else {
          var svg = obj.contentDocument.documentElement;
          if (svg.tagName === 'svg') svg.classList.add('active');
          else {
            obj.onload = function() { // wait for the SVG to load into the object container
              this.onload = null;
              if (deck.slides[deck.slide()].contains(this)) this.contentDocument.documentElement.classList.add('active');
            };
          }
        }
      },
      reloadSvg = function(obj) {
        // NOTE obj.data returns qualified URL whereas obj.getAttribute('data') returns original value
        obj.data = obj.getAttribute('data'); // setting data forces element to reload, replaying autostart animations
      },
      activateSvgs = function(slide) {
        forEach(findSvgs(slide), activateSvg);
      },
      reloadGif = function(img) {
        // NOTE img.src returns qualified URL whereas img.getAttribute('src') returns original value
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
        if (e.preview) pauseAllMedia(e.slide);
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
