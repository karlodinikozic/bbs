async function readErrorMessage(response: Response): Promise<string> {
    try {
        const body = await response.json();
        return body.error ?? "Request failed";
    } catch {
        return "Request failed";
    }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T>  {
    const response = await fetch(`/api${path}`,{
        headers: {"Content-Type": "application/json"},
        ...options,
    })

    if(!response.ok){
       throw new Error(await readErrorMessage(response));
    }

    const NO_CONTENT = 204;

    if (response.status === NO_CONTENT) {
        return undefined as T;
    }

    return response.json();
}