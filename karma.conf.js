module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine', 'browserify'],

    files: [
      'test/spec/*Spec.js',
      { pattern: 'test/asset/*.svg', watched: false, included: false, served: true },
      { pattern: 'test/asset/*.webm', watched: false, included: false, served: true }
    ],

    exclude: [],

    proxies: {
      '/asset/': 'http://localhost:8080/test/asset/'
    },

    preprocessors: {
      'test/**/*.js': 'browserify'
    },

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      type : 'lcov',
      dir : 'test/coverage'
    },

    port: 8080,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: ['PhantomJS'],
    //browsers: ['Firefox'],

    singleRun: true
  });
};
