import httpx

def main():
    # Login
    print("Attempting login...")
    try:
        login_res = httpx.post("http://127.0.0.1:8000/auth/login", json={
            "email": "admin@scriptstudio.com",
            "password": "AdminPassword123"
        })
        print("Login status:", login_res.status_code)
        if login_res.status_code != 200:
            print("Login failed:", login_res.text)
            return
        
        token = login_res.json()["access_token"]
        print("Access token retrieved.")

        # Call paraphrase
        headers = {"Authorization": f"Bearer {token}"}
        print("Calling paraphrase endpoint...")
        paraphrase_res = httpx.post("http://127.0.0.1:8000/script/paraphrase", 
                                    json={"transcript": "Hello world! This is a test transcript for paraphrase."}, 
                                    headers=headers,
                                    timeout=60.0)
        print("Paraphrase status:", paraphrase_res.status_code)
        print("Paraphrase response body:")
        print(paraphrase_res.text)
    except Exception as e:
        print("Error during test:", e)

if __name__ == "__main__":
    main()
