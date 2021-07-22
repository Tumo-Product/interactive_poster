const parser = {
	dataFetch: async () =>
	{
		let  url	= new URL(document.location.href);
		let _uid    = url.searchParams.get("_uid");

        return      axios.get(config.query_url + _uid);
	}
}