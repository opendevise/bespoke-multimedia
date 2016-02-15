module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine', 'browserify'],

    files: [
      'test/spec/*Spec.js',
      { pattern: 'test/asset/*.+(ogg|svg|webm)', watched: false, included: false, served: true }
    ],

    exclude: [],

    proxies: {
      '/asset': 'http://localhost:8080/test/asset'
    },

    preprocessors: {
      'test/**/*.js': 'browserify'
    },

    browserify: {
      transform: ['browserify-istanbul'],
    },

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      dir: 'test/coverage',
      reporters: [
        { type: 'lcov' },
        { type: 'json' }
      ]
    },

    port: 8080,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    customLaunchers: {
      PhantomJS_16x9: {
        base: 'PhantomJS',
        options: { viewportSize: { width: 1280, height: 720 } }
      }
    },

    //browsers: ['PhantomJS']
    browsers: ['PhantomJS_16x9']
    //browsers: ['Firefox']
    //browsers: ['Chrome']
    //browsers: ['PhantomJS_16x9', 'Firefox', 'Chrome']
  });
};
