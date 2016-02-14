/*!
 * bespoke-multimedia v1.0.4-dev
 *
 * Copyright 2016, Dan Allen
 * This content is released under the MIT license
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g=(g.bespoke||(g.bespoke = {}));g=(g.plugins||(g.plugins = {}));g.multimedia = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
      findAudio = function(scope) {
        return scope.querySelectorAll('audio');
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
              console.warn('Access denied: Cannot automatically play Vimeo video since deck is loaded from a file:// URI.');
            }
            else {
              obj.contentWindow.postMessage('{ "method": "play" }', '*');
            }
          }
          else if (YOUTUBE_URI_RE.test(obj.src)) {
            if (isLocalFile) {
              console.warn('Access denied: Cannot automatically play YouTube video since deck is loaded from a file:// URI.');
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
      playAudio = function(slide) {
        forEach(findAudio(slide), playObject);
      },
      playVideos = function(slide) {
        forEach(findVideos(slide), playObject);
      },
      pauseAudio = function(slide) {
        forEach(findAudio(slide), pauseObject);
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
          pauseAudio(e.slide);
          pauseVideos(e.slide);
        }
        else {
          playAudio(e.slide);
          playVideos(e.slide);
          restartAnimations(e.slide);
        }
      },
      deactivate = function(e) {
        pauseAudio(e.slide);
        pauseVideos(e.slide);
      };
    deck.on('activate', activate);
    deck.on('deactivate', deactivate);
  };
};

},{}]},{},[1])(1)
});