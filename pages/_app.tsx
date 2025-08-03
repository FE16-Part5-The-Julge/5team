import Layout from '@/components/common/Layout/Layout';
import '@/styles/global.css';
import { UserProvider } from '@/contexts/auth-context';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
	return (
		<UserProvider>
			<Layout>
				<Component {...pageProps} />
			</Layout>
		</UserProvider>
	);
}
