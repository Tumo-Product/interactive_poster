const parser = {
	dataFetch: async (json) =>
	{
		return new Promise((resolve, reject) =>
		{
			$.ajax({
				type: 'GET',
				dataType: 'json',
				url: json,
				success: function (data)
				{
					resolve(data);
				},
				error: function (error)
				{
					reject(error);
				},
			});
		})
	}
}