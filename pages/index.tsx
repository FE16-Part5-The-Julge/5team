export async function getServerSideProps() {
	return {
		redirect: {
			destination: '/posts',
			permanent: false,
		},
	};
}

export default function Home() {
	return null;
}
