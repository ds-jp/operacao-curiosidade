const createUrl = (endpoint, params) => {
  const url = new URL(`${baseUrl}/${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  return url;
};

const createOptions = (method, params) => {
  const token = localStorage.getItem('token');

  return {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(method !== 'GET' && { 'Content-Type': 'application/json' })
    },
    ...(method !== 'GET' && { body: JSON.stringify(params) })
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      if (errorData.message === 'E-mail já cadastrado. Por favor, tente com um e-mail diferente.') {
        setErrorMessage(errorData.message);
      }
    }
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.status !== 204 ? await response.json() : null;
  } else if (contentType && contentType.includes("text/plain")) {
    return await response.text();
  } else {
    return null;
  }
};

const fetchData = async (endpoint, params = {}, method = 'GET') => {
  const url = createUrl(endpoint, params);
  const options = createOptions(method, params);

  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    return [];
  }
};
