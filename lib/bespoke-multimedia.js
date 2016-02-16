module.exports = function() {
  return function(deck) {
    var VIMEO_RE = /\/\/player\.vimeo\.com\//, YOUTUBE_RE = /\/\/www\.youtube\.com\/embed\//, CMD = 'command',
      file = window.location.protocol === 'file:',
      post = function(obj, msg) { obj.contentWindow.postMessage(JSON.stringify(msg), '*'); },
      query = function(select, root, pr) { return Array.prototype.slice.call(root.querySelectorAll(select + (pr||''))); },
      play = function(obj) {
        var vol = Math.max(Math.min(parseFloat(obj.getAttribute('data-volume')), 10), 0), rwd = obj.hasAttribute('data-rewind');
        if (obj.play) {
          if (rwd) obj.currentTime = 0;
          if (!isNaN(vol)) obj.volume = vol/10;
          if (obj.paused) obj.play();
        }
        else if (YOUTUBE_RE.test(obj.src)) {
          if (rwd) post(obj, {event:CMD, func:'seekTo', args:[0]});
          if (!isNaN(vol)) post(obj, {event:CMD, func:'setVolume', args:[vol*10]});
          post(obj, {event:CMD, func:'playVideo'});
        }
        else if (VIMEO_RE.test(obj.src)) {
          if (file) return console.warn('WARNING: Cannot play Vimeo video when deck is loaded via file://.');
          if (rwd) post(obj, {method:'seekTo', value:0});
          if (!isNaN(vol)) post(obj, {method:'setVolume', value:vol/10});
          post(obj, {method:'play'});
        }
      },
      pause = function(obj) {
        if (obj.pause) obj.pause();
        else if (YOUTUBE_RE.test(obj.src)) post(obj, {event:CMD, func:'pauseVideo'});
        else if (!file && VIMEO_RE.test(obj.src)) post(obj, {method:'pause'});
      },
      reloadGif = function(img) { img.src = img.getAttribute('src'); },
      reloadSvg = function(obj) { obj.data = obj.getAttribute('data'); },
      setActive = function(obj, act) { obj.contentDocument.documentElement.classList[act||'add']('active'); },
      activateSvg = function(obj) {
        if (obj.hasAttribute('data-reload')) reloadSvg(obj);
        else if (obj.contentDocument.documentElement.tagName === 'svg') setActive(obj);
        else { // wait for the SVG to load into object container
          obj.addEventListener('load', function onLoad() {
            this.removeEventListener(onLoad, false);
            if (deck.slides[deck.slide()].contains(this)) setActive(this);
          }, false);
        }
      },
      deactivateSvg = function(obj) { setActive(obj, 'remove'); },
      findMedia = query.bind(null, 'audio,video,iframe'),
      findGifs = query.bind(null, 'img[src$=".gif"][data-reload]'),
      findSvgs = query.bind(null, 'object[type="image/svg+xml"]'),
      playMedia = function(slide) { findMedia(slide).forEach(play); },
      pauseMedia = function(slide) { findMedia(slide).forEach(pause); },
      reloadGifs = function(slide) { findGifs(slide).forEach(reloadGif); },
      activateSvgs = function(slide) { findSvgs(slide).forEach(activateSvg); },
      deactivateSvgs = function(slide) { findSvgs(slide, ':not([data-reload])').forEach(deactivateSvg); },
      activate = function(e) {
        if (e.preview) return pauseMedia(e.slide);
        playMedia(e.slide);
        activateSvgs(e.slide);
        reloadGifs(e.slide);
      },
      deactivate = function(e) {
        pauseMedia(e.slide);
        deactivateSvgs(e.slide);
      };
    deck.on('activate', activate);
    deck.on('deactivate', deactivate);
  };
};
