# AI conversation with docker files
Talk with open source AI chatbots and freely change in between the conversation.

## Getting Started
First things first, run in the terminal :
```bash
nvm use
npm install
```

### AI set up
Then, open Docker Desktop and run the containers :

Navigate to the folder ai-setup :
```bash
cd app/backend/ai-setup
```
<details open>
<summary>Run and deploy llama3-2 model (3 billion params)</summary>

```bash
docker compose -f compose.llama-3.yaml up
```
</details>
<details>
<summary>Run and deploy gemma-3 model (1 billion params)</summary>

```bash
docker compose -f compose.gemma-3.yaml up
```

> [!NOTE]
> Other models coming soon !

</details>

### Start up the database (postgres)
Run the Postgres database on docker container :
```bash
cd app/backend/database/test
docker-compose --env-file ../../../../.env -f compose.postgresdb_testenv.yml up
```

> [!IMPORTANT]
> For production environment, it is important to use the "production" folder.

### Start up the interface
Finally, run the development server in terminal:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## TO DO
- [x] Create web interface
- [x] First hard-coded message to chatbot (tinyllama)
- [x] Custom messages to chatbot using inputs
- [x] Allowing stream (message displaying while chatbot sends back the answer)
- [x] Update interface to look more like a modern conversation interface
- [x] Adding 2 other chatbots in separate containers
- [x] Making the new chatbots communicate with the app
- [x] Create a feature to choose the model on the interface
- [x] Add docker-compose file to project that gives the image of the 3 containers and run them
- [x] Run a DB on Docker to store conversations 
- [x] Add storing layer
- [x] Add identifying layer to identify user and store conversation on his account
- [x] Add signup page
- [x] Email validation
- [x] Finish function "create conversation"
- [x] Create feature (sidebar) to choose the conversation on the interface
- [ ] Update interface (general UI : headers, conversation section, selection button, etc.)
- [x] Add function abort message
- [x] Create page "forgot password"
- [x] Add delete account
- [x] Add user settings to the UI and DB
- [ ] Error handling
- [ ] Handle logs using promtail and loki (grafana)
- [ ] Implement backup solution for data
