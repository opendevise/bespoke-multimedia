Function.prototype.bind = Function.prototype.bind || require('function-bind');

var bespoke = require('bespoke'),
  multimedia = require('../../lib/bespoke-multimedia.js');

describe('bespoke-multimedia', function() {

  var deck,
    parent,
    createDeck = function() {
      parent = document.createElement('article');
      for (var i = 1; i <= 5; i++) {
        var section = document.createElement('section');
        section.id = 'slide-' + i
        if (i < 3) {
          var video = document.createElement('video');
          video.setAttribute('src', 'asset/sample.webm');
          video.setAttribute('loop', 'true');
          video.setAttribute('preload', 'auto');
          if (typeof video.play !== 'function') {
            video.paused = true;
            video.play = function() { this.paused = false; };
            video.pause = function() { this.paused = true; };
          }
          section.appendChild(video); 
        }
        else if (i == 3) {
          var audio = document.createElement('audio');
          audio.setAttribute('src', 'asset/sample.ogg');
          audio.setAttribute('loop', 'true');
          audio.setAttribute('preload', 'auto');
          audio.setAttribute('data-volume', '0');
          if (typeof audio.play !== 'function') {
            audio.paused = true;
            audio.play = function() { this.paused = false; };
            audio.pause = function() { this.paused = true; };
          }
          section.appendChild(audio); 
        }
        else if (i == 4) {
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
      if (parent != null) parent.parentNode.removeChild(parent);
    };

  beforeEach(createDeck);
  afterEach(destroyDeck);

  describe('video playback', function() {
    beforeEach(function() { deck.slide(0); });

    it('should play video on first slide', function() {
      var video = deck.parent.querySelectorAll('video')[0];
      expect(video.paused).toBe(false);
    });

    it('should play video when slide is activated', function() {
      var video = deck.parent.querySelectorAll('video')[1];
      expect(video.paused).toBe(true);
      deck.next();
      expect(video.paused).toBe(false);
    });

    it('should pause video when slide is deactivated', function() {
      deck.next();
      deck.next();
      var video0 = deck.parent.querySelectorAll('video')[0];
      expect(video0.paused).toBe(true);
      var video1 = deck.parent.querySelectorAll('video')[1];
      expect(video1.paused).toBe(true);
    });
  });

  describe('audio playback', function() {
    beforeEach(function() { deck.slide(0); });

    it('should play audio when slide is activated', function() {
      var audio = deck.parent.querySelectorAll('audio')[0];
      deck.slide(1);
      expect(audio.paused).toBe(true);
      deck.next();
      expect(audio.paused).toBe(false);
    });

    it('should pause audio when slide is deactivated', function() {
      var audio = deck.parent.querySelectorAll('audio')[0];
      deck.slide(2);
      expect(audio.paused).toBe(false);
      deck.next();
      expect(audio.paused).toBe(true);
    });
  });

  describe('SVG animation', function() {
    beforeEach(function() { deck.slide(0); });

    // NOTE this doesn't really test anything, other than looking for the SVG doesn't break the plugin
    it('should animate SVG when slide is activated', function() {
      deck.slide(2);
      deck.next();
      expect(deck.parent.querySelector('object').getAttribute('data')).toBe('asset/sample.svg');
    });
  });
});
