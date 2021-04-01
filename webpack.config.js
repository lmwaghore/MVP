const path = require("path");

module.exports = {
	entry: "./client/src/index.jsx",
	output: {
		filename: "index.js",
		path: path.resolve(__dirname, "public"),
	},
	module: {
		rules: [
			{
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env", "@babel/preset-react"],
						plugins: [
							[
								"@babel/plugin-proposal-class-properties",
								{
									"loose": true
								}
							],
							[
								"file-loader",
								{
									"name": "[hash].[ext]",
									"extensions": ["png", "jpg", "jpeg", "gif", "svg"],
									"publicPath": "/public",
									"outputPath": "/public",
									"context": "",
									"limit": 0
								}
							]
						]
					},
				},
			},
		],
	},
	mode: "development",
	resolve: {
		extensions: [".js", ".jsx"],
	},
};
