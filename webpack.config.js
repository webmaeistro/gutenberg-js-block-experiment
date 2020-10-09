/**
 * External dependencies
 */
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const postcss = require('postcss');

const { resolve } = require('path');

/**
 * Gutenberg-js dependencies
 */
// const PostCssWrapper = require('postcss-wrapper-loader');
// const StringReplacePlugin = require('string-replace-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

/**
 * Given a string, returns a new string with dash separators converedd to
 * camel-case equivalent. This is not as aggressive as `_.camelCase` in
 * converting to uppercase, where Lodash will convert letters following
 * numbers.
 *
 * @param {string} string Input dash-delimited string.
 *
 * @return {string} Camel-cased string.
 */
function camelCaseDash (string) {
  return string.replace(
    /-([a-z])/g,
    (match, letter) => letter.toUpperCase()
  );
}

const gutenbergPackages = [
  'a11y',
  // 'api-fetch', // global
  'autop',
  'blob',
  'blocks',
  'block-library',
  'block-serialization-default-parser',
  'block-serialization-spec-parser',
  'browserslist-config',
  'components', // keep it here because package overrides
  'compose',
  'core-data',
  'data',
  'date',
  'deprecated',
  'dom',
  'dom-ready',
  'edit-post',
  'editor',
  'element',
  'escape-html',
  'format-library',
  'hooks',
  'html-entities',
  'i18n',
  'is-shallow-equal',
  'keycodes',
  'list-reusable-blocks',
  'notices',
  'nux',
  'plugins',
  'redux-routine',
  'rich-text',
  'shortcode',
  'token-list',
  // 'url', // global
  'viewport',
  'wordcount',
];

const externals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  moment: 'moment',
  jquery: 'jQuery',
  lodash: 'lodash',
  'lodash-es': 'lodash',
};

const alias = {};

gutenbergPackages.forEach(name => {
  alias[ `@wordpress/${name}` ] = resolve(__dirname, 'node_modules/gutenberg/packages', name);
});

[
  'api-fetch',
  'url',
].forEach(name => {
  externals[ `@wordpress/${name}` ] = {
    this: [ 'wp', camelCaseDash(name) ],
  };
});

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: 'source-map',
  entry: './src/js/index.js',
  output: {
    filename: 'js/gutenberg-js.js',
    path: resolve(__dirname, 'build'),
    libraryTarget: 'this',
  },
  externals,
  resolve: {
    modules: [
      __dirname,
      resolve(__dirname, 'node_modules'),
      resolve(__dirname, 'node_modules/gutenberg/node_modules'),
    ],
    alias,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          /node_modules\/(?!(gutenberg)\/).*/,
        ],
        use: 'babel-loader',
      },
      {
        test: /\.js$/,
        oneOf: [
          {
            resourceQuery: /\?source=node_modules/,
            use: 'babel-loader',
          },
          {
            loader: 'path-replace-loader',
            options: {
              path: resolve(__dirname, 'node_modules/gutenberg'),
              replacePath: resolve(__dirname, 'src/js/gutenberg-overrides'),
            },
          },
        ],
      },
      /* {
        test: /editor\.s?css$/,
        include: [
          /block-library/,
        ],
        use: mainCSSExtractTextPlugin.extract({
          use: [
            {
              // removing .gutenberg class in editor.scss files
              loader: StringReplacePlugin.replace({
                replacements: [ {
                  pattern: /.gutenberg /ig,
                  // replacement: () => (''),
                  replacement: () => ('.gutenberg__editor'),
                } ],
              }),
            },
            ...extractConfig.use,
          ],
        }),
      },*/
      {
        test: /\.s?css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader', // creates style nodes from JS strings
          use: [
            { loader: 'css-loader' },   // translates CSS into CommonJS
            { loader: 'sass-loader' },  // compiles Sass to CSS
          ],
        }),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('./css/style.css'),
    // wrapping editor style with .gutenberg__editor class
    // new PostCssWrapper('./css/block-library/edit-blocks.css', '.gutenberg__editor'),
    // new StringReplacePlugin(),
    new CleanWebpackPlugin(['build']),
    new CopyWebpackPlugin([
      {
        from: `./node_modules/gutenberg/packages/block-library/build-style/style.css`,
        to: `./css/block-library/`,
        flatten: true,
        transform: content => {
          if (process.env.NODE_ENV === 'production') {
            return postcss([
              require('cssnano')({
                preset: 'default',
              }),
            ])
            .process(content, { from: 'src/app.css', to: 'dest/app.css' })
            .then(result => result.css);
          }
          return content;
        },
      },
    ]),
  ],
  stats: {
    children: false,
  },
};
