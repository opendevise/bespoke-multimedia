/*!
 * bespoke-multimedia v1.0.4-dev
 *
 * Copyright 2016, Dan Allen
 * This content is released under the MIT license
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g=(g.bespoke||(g.bespoke = {}));g=(g.plugins||(g.plugins = {}));g.multimedia = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function() {
  return function(deck) {
    var VIMEO_RE = /\/\/player\.vimeo\.com\//, YOUTUBE_RE = /\/\/www\.youtube\.com\/embed\//,
      ACTIVE = 'active', CMD = 'command', file = window.location.protocol === 'file:',
      post = function(obj, msg) { obj.contentWindow.postMessage(JSON.stringify(msg), '*'); },
      query = function(select, scope, pr) { return Array.prototype.slice.call(scope.querySelectorAll(select + (pr||''))); },
      play = function(obj) {
        var vol = Math.max(Math.min(parseFloat(obj.getAttribute('data-volume')), 10), 0), re = obj.getAttribute('data-restart') === 'true';
        if (obj.play) {
          if (re) obj.currentTime = 0;
          if (!isNaN(vol)) obj.volume = vol/10;
          if (obj.paused) obj.play();
        }
        else {
          if (YOUTUBE_RE.test(obj.src)) {
            if (re) post(obj, {event:CMD, func:'seekTo', args:[0]});
            if (!isNaN(vol)) post(obj, {event:CMD, func:'setVolume', args:[vol*10]});
            post(obj, {event:CMD, func:'playVideo'});
          }
          else if (VIMEO_RE.test(obj.src)) {
            if (file) return console.warn('WARNING: Cannot control Vimeo video since deck is loaded from a file:// URI.');
            if (re) post(obj, {method:'seekTo', value:0});
            if (!isNaN(vol)) post(obj, {method:'setVolume', value:vol/10});
            post(obj, {method:'play'});
          }
        }
      },
      pause = function(obj) {
        if (obj.pause) obj.pause();
        else {
          if (YOUTUBE_RE.test(obj.src)) post(obj, {event:CMD, func:'pauseVideo'});
          else if (!file && VIMEO_RE.test(obj.src)) post(obj, {method:'pause'});
        }
      },
      reloadGif = function(img) { img.src = img.getAttribute('src'); },
      reloadSvg = function(obj) { obj.data = obj.getAttribute('data'); },
      activateSvg = function(obj) {
        if (obj.getAttribute('data-reload') === 'true') reloadSvg(obj);
        else {
          var svg = obj.contentDocument.documentElement;
          if (svg.tagName === 'svg') svg.classList.add(ACTIVE);
          else { // wait for the SVG to load into object container
            obj.addEventListener('load', function addActive() {
              this.removeEventListener(addActive, false);
              if (deck.slides[deck.slide()].contains(this)) this.contentDocument.documentElement.classList.add(ACTIVE);
            }, false);
          }
        }
      },
      deactivateSvg = function(obj) { obj.contentDocument.documentElement.classList.remove(ACTIVE); },
      findMedia = query.bind(null, 'audio,video,iframe[src*="//www.youtube.com/embed/"],iframe[src*="//player.vimeo.com/"]'),
      findGifs = query.bind(null, 'img[src*=".gif"][data-restart=true]'),
      findSvgs = query.bind(null, 'object[type="image/svg+xml"]'),
      playMedia = function(slide) { findMedia(slide).forEach(play); },
      pauseMedia = function(slide) { findMedia(slide).forEach(pause); },
      reloadGifs = function(slide) { findGifs(slide).forEach(reloadGif); },
      activateSvgs = function(slide) { findSvgs(slide).forEach(activateSvg); },
      deactivateSvgs = function(slide) { findSvgs(slide, ':not([data-reload=true])').forEach(deactivateSvg); },
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

},{}]},{},[1])(1)
});