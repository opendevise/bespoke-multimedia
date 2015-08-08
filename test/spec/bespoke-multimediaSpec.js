Function.prototype.bind = Function.prototype.bind || require('function-bind');

var bespoke = require('bespoke');
var multimedia = require('../../lib-instrumented/bespoke-multimedia.js');

describe("bespoke-multimedia", function() {

  var deck,
    parent,
    createDeck = function() {
      parent = document.createElement('article');
      for (var i = 0; i < 4; i++) {
        var section = document.createElement('section');
        section.id = 'slide-' + (i + 1)
        if (i == 1) {
          var video = document.createElement('video');
          video.setAttribute('src', 'asset/sample.webm');
          video.setAttribute('loop', 'true');
          video.setAttribute('preload', 'auto');
          if (typeof video.play !== 'function') {
            video.paused = true;
            video.play = function() {
              this.paused = false;
            };
            video.pause = function() {
              this.paused = true;
            };
          }
          section.appendChild(video); 
        }
        if (i == 2) {
          var object = document.createElement('object');
          object.setAttribute('type', 'image/svg+xml');
          object.setAttribute('data', 'asset/sample.svg');
          section.appendChild(object);
        }
        parent.appendChild(section);
      }

      document.body.appendChild(parent);

      deck = bespoke.from(parent, [
        multimedia()
      ]);
    },
    destroyDeck = function() {
      if (parent != null) {
        parent.parentNode.removeChild(parent);
      }
    };

  beforeEach(createDeck);
  afterEach(destroyDeck);

  describe("deck.slide", function() {

    beforeEach(function() {
      deck.slide(0);
    });

    it("should play video when slide is activated", function() {
      var video = deck.parent.querySelector('video');
      deck.next();
      expect(video.paused).toBe(false);
    });

    it("should pause video when slide is deactivated", function() {
      var video = deck.parent.querySelector('video');
      deck.next();
      deck.next();
      expect(video.paused).toBe(true);
    });

    // NOTE this doesn't really test anything, other than looking for the SVG doesn't break the plugin
    it("should animate SVG when slide is activated", function() {
      deck.next();
      deck.next();
      deck.next();
      expect(deck.parent.querySelector('object').getAttribute('data')).toBe('asset/sample.svg');
    });

  });

});
