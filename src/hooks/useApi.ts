type ApiOptions = {
    url: string;
    method?: "GET" | "POST";
    body?: Record<string, any>;
  };
  
  export const apiRequest = async <T = any>({ url, method = "GET", body }: ApiOptions): Promise<T> => {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      ...(body && { body: JSON.stringify(body) }),
    });
  
    if (!res.ok) throw new Error("Failed to fetch");
  
    return res.json();
  };
  