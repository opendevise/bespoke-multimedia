/*!
 * bespoke-multimedia v1.0.0
 *
 * Copyright 2015, Dan Allen
 * This content is released under the MIT license
 * 
 */

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self);var o=n;o=o.bespoke||(o.bespoke={}),o=o.plugins||(o.plugins={}),o.multimedia=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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
    animateSVG = function(obj) {
      obj.data = obj.data;
      //obj.setAttribute('data', obj.getAttribute('data'));
    },
    animateSVGs = function(slide) {
      toArray(slide.querySelectorAll('object')).forEach(function(obj) {
        if (obj.getAttribute('type') === 'image/svg+xml' && obj.contentDocument &&
            obj.contentDocument.querySelector('animate')) {
          animateSVG(obj);
        }
      });
    },
    activate = function(event) {
      playVideos(event.slide);
      animateSVGs(event.slide);
    },
    deactivate = function(event) {
      pauseVideos(event.slide);
    };

    deck.on('activate', activate);
    deck.on('deactivate', deactivate);
  };
};

},{}]},{},[1])
(1)
});