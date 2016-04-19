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
      '/asset/': '/base/test/asset/'
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

    // execute `BROWSERS=all xvfb-run gulp test` to run tests in all browsers using background display
    browsers: process.env.TRAVIS ? ['PhantomJS_16x9', 'Firefox'] :
      (process.env.BROWSERS === 'all' ? ['PhantomJS_16x9', 'Firefox', 'Chrome'] : ['PhantomJS_16x9'])
  });
};
