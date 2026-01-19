/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals.push({
            "@remotion/compositor-darwin-arm64": "commonjs @remotion/compositor-darwin-arm64",
            "@remotion/compositor-darwin-x64": "commonjs @remotion/compositor-darwin-x64",
            "@remotion/compositor-linux-arm64-gnu": "commonjs @remotion/compositor-linux-arm64-gnu",
            "@remotion/compositor-linux-arm64-musl": "commonjs @remotion/compositor-linux-arm64-musl",
            "@remotion/compositor-linux-x64-gnu": "commonjs @remotion/compositor-linux-x64-gnu",
            "@remotion/compositor-linux-x64-musl": "commonjs @remotion/compositor-linux-x64-musl",
            "esbuild": "commonjs esbuild",
            "@remotion/bundler": "commonjs @remotion/bundler",
            "@remotion/renderer": "commonjs @remotion/renderer",
        });

        return config;
    },
    output: 'standalone',
};

module.exports = nextConfig;
