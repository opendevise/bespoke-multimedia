/*!
 * bespoke-multimedia v1.0.4-dev
 *
 * Copyright 2016, Dan Allen
 * This content is released under the MIT license
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g=(g.bespoke||(g.bespoke = {}));g=(g.plugins||(g.plugins = {}));g.multimedia = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function() {
  return function(deck) {
    var VIMEO_RE = /\/\/player\.vimeo\.com\//, YOUTUBE_RE = /\/\/www\.youtube\.com\/embed\//, CMD = 'command', loc = location.protocol === 'file:',
      apply = function(sel, from, fn, mod) { for (var i = -1, r = from.querySelectorAll(sel+(mod||'')), l = r.length; ++i < l; fn(r[i])) {} },
      post = function(obj, msg) { obj.contentWindow.postMessage(JSON.stringify(msg), '*'); },
      play = function(obj) {
        var rwd = obj.hasAttribute('data-rewind'), vol = Math.min(Math.max(parseFloat(obj.getAttribute('data-volume')), 0), 10);
        if (obj.play) {
          if (rwd) obj.currentTime = 0;
          if (!isNaN(vol)) obj.volume = vol/10;
          obj.play();
        }
        else if (YOUTUBE_RE.test(obj.src)) {
          if (rwd) post(obj, {event:CMD, func:'seekTo', args:[0]});
          if (!isNaN(vol)) post(obj, {event:CMD, func:'setVolume', args:[vol*10]});
          post(obj, {event:CMD, func:'playVideo'});
        }
        else if (VIMEO_RE.test(obj.src)) {
          if (loc) return console.warn('WARNING: Cannot play Vimeo video when deck is loaded via file://.');
          if (rwd) post(obj, {method:'seekTo', value:0});
          if (!isNaN(vol)) post(obj, {method:'setVolume', value:vol/10});
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
      setActive = function(obj, cmd) { (svg(obj)||obj).classList[cmd||'add']('active'); },
      activateSvg = function(obj) {
        if (obj.hasAttribute('data-reload')) reload(obj, 'data');
        else if (svg(obj)) setActive(obj);
        else obj.onload = function() { if (deck.slides[deck.slide()].contains(obj)) setActive(obj); };
      },
      deactivateSvg = function(obj) { setActive(obj, 'remove'); },
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

},{}]},{},[1])(1)
});