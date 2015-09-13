/*!
 * bespoke-multimedia v1.0.4-dev
 *
 * Copyright 2015, Dan Allen
 * This content is released under the MIT license
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g=(g.bespoke||(g.bespoke = {}));g=(g.plugins||(g.plugins = {}));g.multimedia = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
        // NOTE obj.data resolves to the qualified URL; we just want the original value
        obj.data = obj.getAttribute('data'); // setting data forces element to reload, restarting SVG animation
        //obj.setAttribute('data', obj.getAttribute('data'));
      },
      restartSvgAnimations = function(slide) {
        forEach(findAnimatedSvgs(slide), restartSvgAnimation);
      },
      restartGifAnimation = function(img) {
        // NOTE obj.src resolves to qualified URL; use getAttribute to get original value
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

},{}]},{},[1])(1)
});