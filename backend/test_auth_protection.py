import requests
import sys

# This script tests that your API endpoints are correctly protected
# and reject unauthenticated requests with a 401 status code.
#
# Prerequisite: pip install requests
# Usage: python test_auth_protection.py

BASE_URL = 'http://localhost:5000/api'

def check_endpoint(method, endpoint):
    url = f"{BASE_URL}{endpoint}"
    print(f"Checking {method} {endpoint}...", end=" ")
    
    try:
        if method == 'GET':
            response = requests.get(url)
        elif method == 'POST':
            response = requests.post(url, json={})
        elif method == 'PUT':
            response = requests.put(url, json={})
        elif method == 'DELETE':
            response = requests.delete(url)
            
        if response.status_code == 401:
            print("✅ Protected (401 Unauthorized)")
        else:
            print(f"❌ FAILED (Got status: {response.status_code})")
            
    except requests.exceptions.ConnectionError:
        print("\nError: Backend is not running at http://localhost:5000")
        sys.exit(1)

if __name__ == "__main__":
    print("--- Testing API Route Protection ---\n")
    
    check_endpoint('GET', '/colleges')
    check_endpoint('POST', '/colleges')
    check_endpoint('GET', '/programs')
    check_endpoint('GET', '/students')
    check_endpoint('GET', '/statistics')
    
    print("\nDone.")