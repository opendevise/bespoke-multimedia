module.exports = function() {
  return function(deck) {
    var toArray = function(c) {
      return Array.prototype.slice.call(c);
    },
    findVideos = function(slide) {
      return toArray(slide.querySelectorAll('video'));
    },
    playNode = function(node) {
      if (typeof node.play === 'function' && node.paused === true) {
        // QUESTION should we raise a videoplayed event?
        //node.currentTime = 0;
        node.play();
      }
    },
    pauseNode = function(node) {
      if (typeof node.pause === 'function' && node.paused === false) {
        // QUESTION should we raise a videopaused event?
        node.pause();
      }
    },
    playVideos = function(slide) {
      findVideos(slide).forEach(playNode);
    },
    pauseVideos = function(slide) {
      findVideos(slide).forEach(pauseNode);
    },
    // force object to reload (restarts SVG animations)
    restartSvgAnimation = function(obj) {
      obj.data = obj.data;
      //obj.setAttribute('data', obj.getAttribute('data'));
    },
    restartSvgAnimations = function(slide) {
      toArray(slide.querySelectorAll('object')).forEach(function(obj) {
        if (obj.getAttribute('type') === 'image/svg+xml' && obj.contentDocument &&
            obj.contentDocument.querySelector('animate')) {
          restartSvgAnimation(obj);
        }
      });
    },
    // force object to reload (restarts GIF animation)
    restartGifAnimation = function(obj) {
      obj.src = obj.src;
      //obj.setAttribute('src', obj.getAttribute('src'));
    },
    restartGifAnimations = function(slide) {
      toArray(slide.querySelectorAll('img')).forEach(function(obj) {
        if (/\.gif/i.test(obj.src)) {
          restartGifAnimation(obj);
        }
      });
    },
    restartAnimations = function(slide) {
      restartSvgAnimations(slide);
      restartGifAnimations(slide);
    },
    activate = function(event) {
      playVideos(event.slide);
      restartAnimations(event.slide);
    },
    deactivate = function(event) {
      pauseVideos(event.slide);
    };

    deck.on('activate', activate);
    deck.on('deactivate', deactivate);
  };
};
