//let storageToken = "";
let storageToken = {
    key: "",
    expiresAt: new Date(Date.now())
}

export const getStorageToken = async (): Promise<string> => {
    // if no key or has expired
  if (storageToken.key.length === 0 || storageToken.expiresAt.getTime() < Date.now()) {
    const PUBLIC_URL = process.env.OBJECT_STORAGE_URL;

    if (!PUBLIC_URL)
      throw new Error(
        `[Storage Singleton] Missing required environment variables: 
                public url: ${PUBLIC_URL}`,
      );

    const authBody = {
      auth: {
        identity: {
          methods: ["password"],
          password: {
            user: {
              id: process.env.OBJECT_STORAGE_USER,
              password: process.env.OBJECT_STORAGE_PSW,
            },
          },
        },
        scope: {
          project: {
            id: process.env.OBJECT_STORAGE_PROJECT_ID,
          },
        },
      },
    };

    const response = await fetch(
      "https://api.pub1.infomaniak.cloud/identity/v3/auth/tokens",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authBody),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Authentication failed: ${response.status} ${response.statusText}`,
      );
    }

    // Extract token from headers
    storageToken.key = response.headers.get("X-Subject-Token") || "";
    // Add 55 minutes to the current time
    storageToken.expiresAt = new Date(Date.now() + 55 * 60 * 1000);
  }

  return storageToken.key;
};
