# AI conversation with docker files
Talk with open source AI chatbots and freely change in between the conversation.

## Getting Started
First things first, run in the terminal :
```bash
nvm use
npm install
```

Then, open Docker Desktop and run the containers (coming soon):

Navigate to the folder ai-setup :
```bash
cd app/ai-setup
```
<details open>
<summary>Run and deploy tinyLlama model</summary>

```bash
    chmod +x tinyllama.sh && ./tinyllama.sh
```
</details>
<details>
<summary>Run and deploy llama3-2 model (3 billion params)</summary>

```bash
    chmod +x llama3-2.sh && ./llama3-2.sh
```
</details>
<details>
<summary>Run and deploy deepseek-r1 model (7 billion params)</summary>

```bash
    chmod +x deepseek-r1.sh && ./deepseek-r1.sh
```
</details>
<details>
<summary>Run and deploy gemma-3 model (1 billion params)</summary>

```bash
    chmod +x gemma-3.sh && ./gemma-3.sh
```
</details>


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
- [ ] Making the new chatbots communicate with the app
- [ ] Create a feature to choose the model on the interface
- [ ] Add Dockerfile to project that gives the image of the 3 containers and run them
- [ ] Run a DB on Docker to store conversations 
- [ ] Create feature to choose the conversation on the interface
