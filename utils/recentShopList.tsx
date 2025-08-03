const MAX_ITEMS = 6;

export const saveRecentShops = (shopId: string | string[]) => {
	if (!shopId) return; //Exception Transaction

	const storedData = localStorage.getItem('recent_shops');
	let shops = storedData ? JSON.parse(storedData) : []; //json 문자열 -> 값

	shops = shops.filter((id: string | string[]) => id !== shopId);

	shops.unshift(shopId);

	if (shops.length > MAX_ITEMS) {
		//최대 개수 초과시 팝
		shops.pop();
	}

	localStorage.setItem('recent_shops', JSON.stringify(shops)); //값 -> json 의 문자열
};

export const getRecentShops = (): string[] => {
	const storedData = localStorage.getItem('recent_shops');
	return storedData ? JSON.parse(storedData) : []; //json 문자열 -> 값
};
