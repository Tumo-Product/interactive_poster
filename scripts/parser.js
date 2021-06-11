const parser = {
    dataFetch: async (json) => {
        let response = await fetch(json);
        return await response.json();
    }
}