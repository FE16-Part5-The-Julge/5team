import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'bootcamp-project-api.s3.ap-northeast-2.amazonaws.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'fastly.picsum.photos/**',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'picsum.photos/200/300',
				port: '',
				pathname: '/**',
			},
		],
	},

	webpack(config) {
		//svg 설정.(svg 파일을 컴포넌트 형식으로 사용 할 수 있게)
		//그래도 안될 시 npm install @svgr/webpack 명령어를 입력.★★★
		// by [최민준]
		config.module.rules.push({
			test: /\.svg$/,
			issuer: /\.[jt]sx?$/,
			use: ['@svgr/webpack'],
		});

		return config;
	},
};

export default nextConfig;
