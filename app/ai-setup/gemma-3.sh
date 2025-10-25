# Llama3.1:8B model
# bash run: chmod +x gemma-3.sh && ./gemma-3.sh

set -e  # Exit on any error

echo "Starting gemma-3 (1 billion params) deployment..."

# Pull and run Ollama container
echo "Pulling and starting gemma-3 container..."
docker run -d \
    --name gemma.3 \
    -p 11437:11437 \
    -v ollama_data:/root/.ollama \
    ollama/ollama

# Wait for the container to build
sleep 10

# Pull the TinyLlama model
echo "Pulling gemma-3 model... (Takes a few minutes)"
docker exec -it gemma.3 ollama pull gemma3:1b

# Test the model
echo "Testing the model..."
docker exec -it gemma.3 ollama run gemma3:1b

echo "gemma-3 up and running with 1 billion params"
echo "API available at: http://localhost:11437"