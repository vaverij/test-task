export type ArticlesResponse = {
	posts: {
		data: [{ title: string; id: number }];
		links: {
			first: {
				limit: number;
				page: number;
			} | null;
			last: {
				limit: number;
				page: number;
			} | null;
			next: {
				limit: number;
				page: number;
			} | null;
			prev: {
				limit: number;
				page: number;
			} | null;
		};
	};
};

export type Article = { title: string | null; id: number };
export type Photo = { photo: { url: string; id: number } };
