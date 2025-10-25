# Llama3.1:8B model
# Run: chmod +x llama3-2.sh && ./llama3-2.sh

set -e  # Exit on any error

echo "Starting llama3.2 (3 billion params) deployment..."

# Pull and run Ollama container
echo "Pulling and starting llama3.2:3b container..."
docker run -d \
    --name llama3.2 \
    -p 11435:11435 \
    -v ollama_data:/root/.ollama \
    ollama/ollama

# Wait for the container to build
sleep 10

# Pull the TinyLlama model
echo "Pulling llama3.2 model... (Takes a few minutes)"
docker exec -it llama3.2 ollama pull llama3.2:3b

# Test the model
echo "Testing the model..."
docker exec -it llama3.2 ollama run llama3.2:3b

echo "Ollama up and running with llama3.2:3b model."
echo "API available at: http://localhost:11435"