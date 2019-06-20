const { injectBabelPlugin } = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');

module.exports = function override(config, env) {
  config = injectBabelPlugin(
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }], // change importing css to less
    config,
  );
  config = rewireLess.withLoaderOptions({
    modifyVars: {
      "@primary-color": "#7933e1",
      "@font-family": "'Open Sans' ,-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans- serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
      "@layout-sider - background - light": "#f6f9fc",
      "@layout-trigger - background - light": "#f6f9fc",
      "@text-color": "#483b7d",
      "@heading-color": "#2d225f",
      "@skeleton-color": "#dee3f2",
      "@input-placeholder-color": "#afb4d6",
      "@background-color-base": "#f6f9fc", // Default grey background color
      "background-color-light": "#f6f9fc", // background of header and selected item
      "@border-color-base": "#dee3f2", // base border outline a component
      "@primary-1": "#f6f9fc"
    },
    javascriptEnabled: true,
  })(config, env);
  return config;
};