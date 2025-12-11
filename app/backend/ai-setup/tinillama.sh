# TinyLlama model
# Run: chmod +x tinyllama.sh && ./tinyllama.sh

set -e  # Exit on any error

echo "Starting TinyLlama deployment..."

# Pull and run Ollama container
echo "Pulling and starting TinyLlama container..."
docker run -d \
    --name TinyLlama \
    -p 11434:11434 \
    -v ollama_data:/root/.ollama \
    ollama/ollama

# Pull the TinyLlama model
echo "Pulling TinyLlama model..."
docker exec -it TinyLlama ollama pull tinyllama

# Test the model
echo "Testing the model..."
docker exec -it TinyLlama ollama run tinyllama

echo "TinyLlama up and running"
echo "API available at: http://localhost:11434"