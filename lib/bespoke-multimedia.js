module.exports = function() {
  return function(deck) {
    var VIMEO_RE = /^https:\/\/player.vimeo.com\//,
      forEach = function(c, fn) {
        Array.prototype.forEach.call(c, fn);
      },
      findAnimatedSvgs = function(slide) {
        // QUESTION should we require an "animated" class on the object element?
        return slide.querySelectorAll('object[type="image/svg+xml"]');
      },
      findGifs = function(slide) {
        return slide.querySelectorAll('img[src*=".gif"]');
      },
      findVideos = function(slide) {
        return slide.querySelectorAll('video, iframe[src^="https://player.vimeo.com/"]');
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
          if (VIMEO_RE.test(obj.src)) {
            if (window.location.href.startsWith('file://')) {
              console.warn('Access denied: Cannot automatically play Vimeo video when deck is loaded from file URL');
            }
            else {
              obj.contentWindow.postMessage({ 'method': 'play' }, '*');
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
          if (VIMEO_RE.test(obj.src)) {
            if (!window.location.href.startsWith('file://')) {
              obj.contentWindow.postMessage({ 'method': 'pause' }, '*');
            }
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
