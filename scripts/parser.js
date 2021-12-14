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
}