import time
from qdrant_client import QdrantClient
from main import settings

def init_qdrant():
    client = QdrantClient(url=settings.qdrant_url)
    
    # Wait for Qdrant to be ready
    while True:
        try:
            if not client.collection_exists("memories"):
                client.create_collection(
                    collection_name="memories",
                    vectors_config={"size": 384, "distance": "Cosine"}
                )
                print("Collection 'memories' created.")
            else:
                print("Collection 'memories' already exists.")
            break
        except Exception as e:
            print(f"Waiting for Qdrant: {e}")
            time.sleep(2)

if __name__ == "__main__":
    init_qdrant()
