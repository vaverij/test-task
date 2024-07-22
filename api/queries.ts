import { gql } from "@apollo/client/core";

export const GET_POST_QUERY = gql`
	query ($postId: ID!) {
		post(id: $postId) {
			id
			title
			body
		}
	}
`;

export const GET_POST_IMAGE_QUERY = gql`
	query ($photoId: ID!) {
		photo(id: $photoId) {
			id
			url
		}
	}
`;

export const GET_POSTS_QUERY = gql`
	query ($options: PageQueryOptions) {
		posts(options: $options) {
			data {
				id
				title
			}
			links {
				first {
					page
					limit
				}
				prev {
					page
					limit
				}
				next {
					page
					limit
				}
				last {
					page
					limit
				}
			}
			meta {
				totalCount
			}
		}
	}
`;
