request = function()
	local userId = 123456
	local query = "?foo=hello&bar=42&baz=world"
	local path = "/users/" .. userId .. query
	local body = '{"nested":{"a":"example"},"b":[true,false,null],"c":123}'

	wrk.method = "POST"

	wrk.headers["Content-Type"] = "application/json"
	wrk.headers["Cookie"] = "cookie=example"

	return wrk.format(wrk.method, path, wrk.headers, body)
end
