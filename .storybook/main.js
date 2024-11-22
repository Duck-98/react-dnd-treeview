const path = require("path");

const interactionsDisabled =
  process?.env?.STORYBOOK_DISABLE_INTERACTIONS === "true";

const addons = ["storybook-css-modules-preset", "@storybook/addon-essentials"];

if (!interactionsDisabled) {
  addons.push("@storybook/addon-interactions");
}

module.exports = {
  stories: ["../src/**/*.stories.tsx"],
  addons,
  features: {
    interactionsDebugger: !interactionsDisabled,
  },
  webpackFinal: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "~": path.resolve(__dirname, "../src"),
    };

    // 기존 MJS 파일 처리 설정
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    // @tanstack/react-virtual을 위한 설정 추가
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      include: /node_modules\/@tanstack/,
      use: {
        loader: require.resolve("babel-loader"),
        options: {
          presets: ["@babel/preset-env"],
        },
      },
    });

    delete config.resolve.alias["emotion-theming"];
    delete config.resolve.alias["@emotion/styled"];
    delete config.resolve.alias["@emotion/core"];

    return config;
  },
};
