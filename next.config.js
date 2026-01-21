/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push({
                "@remotion/bundler": "commonjs @remotion/bundler",
                "@remotion/renderer": "commonjs @remotion/renderer",
                "puppeteer": "commonjs puppeteer",
            });
        }
        return config;
    },
};

module.exports = nextConfig;
