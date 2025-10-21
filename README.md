# AI conversation with docker files
Talk with open source AI chatbots and freely change in between the conversation.

## Getting Started
First things first, open Docker Desktop and:
```bash
nvm use
npm install
```

First, start the Docker images and run the containers (coming soon):
```yaml

```

Second, run the development server:

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
- [ ] Adding 2 other chatbots in separate containers
- [ ] Making the new chatbots communicate with the app
- [ ] Create a feature to choose the model on the interface
- [ ] Add Dockerfile to project that gives the image of the 3 containers and run them
- [ ] Run a DB on Docker to store conversations 
- [ ] Create feature to choose the conversation on the interface
