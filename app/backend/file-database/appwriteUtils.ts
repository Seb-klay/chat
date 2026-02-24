import { Client } from 'node-appwrite';

let appwriteClient: Client | undefined;

export const getAppwriteClient = async (): Promise<Client> => {
    if (!appwriteClient) {
        const endpoint = process.env.APPWRITE_ENDPOINT;
        const project = process.env.APPWRITE_PROJECT_ID;
        const key = process.env.APPWRITE_API_KEY;

        if (!endpoint || !project || !key) {
        throw new Error(
            `[Appwrite Singleton] Missing required environment variables: 
            Endpoint: ${endpoint}, Project: ${project}, Key: ${key ? 'SET' : 'MISSING'}`
        );
        }

        appwriteClient = new Client()
            .setEndpoint(endpoint) 
            .setProject(project)
            .setKey(key);
    }

  return appwriteClient;
};