import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default eslintConfig;
