// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    plugins: ["~/plugins/apollo"],

    runtimeConfig: {
		public: {
			graphqlUri:
				process.env.GRAPHQL_URI || "https://graphqlzero.almansi.me/api",
		},
	},

    css: ["~/assets/css/main.css"],
    devtools: { enabled: true },

    postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},

    modules: ["@nuxt/image"]
});