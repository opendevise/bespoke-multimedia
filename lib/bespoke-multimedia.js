module.exports = function() {
  return function(deck) {
    var VIMEO_RE = /\/\/player\.vimeo\.com\//, YOUTUBE_RE = /\/\/www\.youtube\.com\/embed\//, CMD = 'command', loc = location.protocol === 'file:',
      apply = function(sel, from, fn, mod) { for (var i = -1, r = from.querySelectorAll(sel+(mod||'')), l = r.length; ++i < l; fn(r[i])) {} },
      post = function(obj, msg) { obj.contentWindow.postMessage(JSON.stringify(msg), '*'); },
      play = function(obj) {
        var rew = obj.hasAttribute('data-rewind'), vol = Math.min(Math.max(parseFloat(obj.getAttribute('data-volume')), 0), 10);
        if (obj.play) {
          if (rew) obj.currentTime = 0;
          if (vol >= 0) obj.volume = vol/10;
          obj.play();
        }
        else if (YOUTUBE_RE.test(obj.src)) {
          if (rew) post(obj, {event:CMD, func:'seekTo', args:[0]});
          if (vol >= 0) post(obj, {event:CMD, func:'setVolume', args:[vol*10]});
          post(obj, {event:CMD, func:'playVideo'});
        }
        else if (VIMEO_RE.test(obj.src)) {
          if (loc) return console.warn('WARNING: Cannot play Vimeo video when deck is loaded via file://.');
          if (rew) post(obj, {method:'seekTo', value:0});
          if (vol >= 0) post(obj, {method:'setVolume', value:vol/10});
          post(obj, {method:'play'});
        }
      },
      pause = function(obj) {
        if (obj.pause) obj.pause();
        else if (YOUTUBE_RE.test(obj.src)) post(obj, {event:CMD, func:'pauseVideo'});
        else if (!loc && VIMEO_RE.test(obj.src)) post(obj, {method:'pause'});
      },
      reload = function(obj, name) { obj[name||'src'] = obj.getAttribute(name||'src'); },
      svg = function(obj) { try { return obj.contentDocument.rootElement; } catch(e) {} },
      toggle = function(obj, cmd) { (svg(obj)||obj).classList[cmd||'add']('active'); },
      activateSvg = function(obj) {
        if (obj.hasAttribute('data-reload')) reload(obj, 'data');
        else if (svg(obj)) toggle(obj);
        else obj.onload = function() { if (deck.slides[deck.slide()].contains(obj)) toggle(obj); };
      },
      deactivateSvg = function(obj) { toggle(obj, 'remove'); },
      eachMedia = apply.bind(null, 'audio,video,iframe'),
      eachSvg = apply.bind(null, 'object[type="image/svg+xml"]'),
      playMedia = function(slide) { eachMedia(slide, play); },
      pauseMedia = function(slide) { eachMedia(slide, pause); },
      activateSvgs = function(slide) { eachSvg(slide, activateSvg); },
      deactivateSvgs = function(slide) { eachSvg(slide, deactivateSvg, ':not([data-reload])'); },
      activate = function(e) {
        if (e.preview) return pauseMedia(e.slide);
        playMedia(e.slide);
        activateSvgs(e.slide);
        apply('img[data-reload][src$=".gif"]', e.slide, reload);
      },
      deactivate = function(e) {
        pauseMedia(e.slide);
        deactivateSvgs(e.slide);
      };
    deck.on('activate', activate);
    deck.on('deactivate', deactivate);
  };
};
