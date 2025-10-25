# Llama3.1:8B model
# Run: chmod +x deepseek-r1.sh && ./deepseek-r1.sh

set -e  # Exit on any error

echo "Starting deepseek-r1 (7 billion params) deployment..."

# Pull and run Ollama container
echo "Pulling and starting deepseek-r1 container..."
docker run -d \
    --name deepseek.r1 \
    -p 11436:11436 \
    -v ollama_data:/root/.ollama \
    ollama/ollama

# Wait for the container to build
sleep 10

# Pull the TinyLlama model
echo "Pulling deepseek-r1 model... (Takes a few minutes)"
docker exec -it deepseek.r1 ollama pull deepseek-r1:7b

# Test the model
echo "Testing the model..."
docker exec -it deepseek.r1 ollama run deepseek-r1:7b

echo "deepseek-r1 up and running with 7 billion params"
echo "API available at: http://localhost:11436"