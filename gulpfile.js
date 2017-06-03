const gulp = require('gulp');
const todo = require('gulp-todo');
const lint = require('gulp-eslint');
const yaml = require('gulp-yaml-validate');


const paths = {
  src: './',
  spec: './spec/*.js',
  js: [
    './*.js',
    './src/*.js',
    './src/**/*.js',
    './bundles/**/*.js'
  ],
  yaml: [
    './bundles/**/*.yaml',
    './bundles/**/*.yml'
  ]
};

const report = {
  ignore: 0,
  warn: 1,
  error: 2,
};

const options = {
  todo: {
    absolute: true,
    fileName: 'gulpTODO.md'
  },
  lint: {
    rules: {
      'no-reserved-keys':  report.ignore,

      'no-cond-assign':    report.warn,
      'no-dupe-args':      report.warn,
      'no-dupe-keys':      report.warn,
      'no-duplicate-case': report.warn,
      'no-extra-semi':     report.warn,
      'no-func-assign':    report.warn,
      'no-sparse-arrays':  report.warn,
      'yoda':              report.warn,
      'camelcase':         report.warn,

      'use-isnan':         report.error,
      'valid-typeof':      report.error,
      'no-unreachable':    report.error,

    },
    parserOptions: {
      'ecmaVersion': 6,
    },
  }
};

gulp.task('todo', toDoTask);

gulp.task('lint', ['lintJS', 'lintYaml']);

gulp.task('lintJS', lintTask);
gulp.task('lintYaml', yamlTask);

gulp.task('default', ['todo', 'lint']);

function lintTask() {
  return gulp
    .src(paths.js)
    .pipe(lint(options.lint))
    .pipe(lint.format())
    .pipe(lint.failAfterError());
}

function yamlTask() {
  return gulp
    .src(paths.yaml)
    .pipe(yaml())
}

function toDoTask() {
  return gulp
    .src(paths.js)
    .pipe(todo(options.todo))
    .pipe(gulp.dest(paths.src));
}
