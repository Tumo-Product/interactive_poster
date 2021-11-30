const parser = {
	dataFetch: async () =>
	{
		let  url	= new URL(document.location.href);
		let _uid    = url.searchParams.get("_uid");

        return await axios.get(config.query_url + _uid);
	},
	getOutcomeTexts: (text) => {
        let splitText = text.split("%{div}");

        return splitText;
    },
	getFile : async (path) => {
		axios.defaults.baseURL = "https://content-tools.tumo.world:4000";
		let data = await axios.post("video/getfile", {path: path});
		let baseData = data.data.data;
		return baseData;
	}
}