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
    // force object to reload (restarts SVG animations); doesn't work reliably in Firefox
    restartSvgAnimation = function(obj) {
      // NOTE obj.data resolves to the qualified URL; we just want the original value
      obj.data = obj.getAttribute('data');
      //obj.setAttribute('data', obj.getAttribute('data'));
    },
    restartSvgAnimations = function(slide) {
      toArray(slide.querySelectorAll('object')).forEach(function(obj) {
        if (obj.getAttribute('type') === 'image/svg+xml') {
          restartSvgAnimation(obj);
        }
        // contentDocument may not be accessible for file URLs, so this optimization may disable functionality
        //if (obj.getAttribute('type') === 'image/svg+xml' && obj.contentDocument &&
        //    obj.contentDocument.querySelector('animate')) {
        //  restartSvgAnimation(obj);
        //}
      });
    },
    // force object to reload (restarts GIF animation)
    restartGifAnimation = function(img) {
      // NOTE obj.src resolves to the qualified URL; we just want the original value
      img.src = img.getAttribute('src');
      //img.setAttribute('src', img.getAttribute('src'));
    },
    restartGifAnimations = function(slide) {
      toArray(slide.querySelectorAll('img[src*=".gif"]')).forEach(restartGifAnimation);
      // NOTE use the following if we want case insensitive matching
      //toArray(slide.querySelectorAll('img')).forEach(function(img) {
      //  if (/\.gif/i.test(img.src)) {
      //    restartGifAnimation(img);
      //  }
      //});
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
