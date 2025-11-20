#!/usr/bin/env python3
"""
Simple script to test API endpoints and diagnose issues.
"""
import requests
import sys
import os
from urllib.parse import urljoin

# Configuration
BASE_URL = "http://localhost:8000"
API_PREFIX = "/api/v1/"

def test_endpoint(endpoint, headers=None):
    """Test a specific endpoint and return the response."""
    url = urljoin(BASE_URL + "/", API_PREFIX + endpoint.lstrip("/"))
    try:
        response = requests.get(url, headers=headers, timeout=10)
        return {
            'url': url,
            'status_code': response.status_code,
            'success': response.status_code == 200,
            'response': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:200]
        }
    except requests.exceptions.ConnectionError:
        return {
            'url': url,
            'status_code': None,
            'success': False,
            'response': 'Connection error - server may not be running'
        }
    except requests.exceptions.Timeout:
        return {
            'url': url,
            'status_code': None,
            'success': False,
            'response': 'Timeout - server may be unresponsive'
        }
    except Exception as e:
        return {
            'url': url,
            'status_code': None,
            'success': False,
            'response': f'Error: {str(e)}'
        }

def main():
    print("🔍 Testing NumerAI API Endpoints")
    print("=" * 50)
    
    # Test basic endpoints
    endpoints = [
        "",  # Health check
        "health/",  # Health check
        "auth/login/",  # Auth endpoint
        "users/profile/",  # User profile
    ]
    
    # Test person-related endpoints (these might fail if no data exists)
    person_endpoints = [
        "people/",
        "people/00000000-0000-0000-0000-000000000000/",  # Non-existent person
        "people/00000000-0000-0000-0000-000000000000/profile/",  # Non-existent profile
    ]
    
    print("Testing basic endpoints:")
    for endpoint in endpoints:
        result = test_endpoint(endpoint)
        status = "✅" if result['success'] else "❌"
        print(f"  {status} {result['url']}")
        if not result['success']:
            print(f"     Status: {result['status_code'] or 'N/A'}")
            print(f"     Response: {result['response']}")
        print()
    
    print("Testing person-related endpoints (may fail if no data exists):")
    for endpoint in person_endpoints:
        result = test_endpoint(endpoint)
        status = "✅" if result['success'] else "❌"
        print(f"  {status} {result['url']}")
        if not result['success']:
            print(f"     Status: {result['status_code'] or 'N/A'}")
            print(f"     Response: {result['response']}")
        print()
    
    print("💡 Tips:")
    print("  - If you see 404 errors for person endpoints, it's expected if no data exists")
    print("  - If you see connection errors, make sure the backend server is running")
    print("  - If you see 401/403 errors, you may need to authenticate first")
    print("  - Run 'python manage.py runserver' to start the backend server")

if __name__ == "__main__":
    main()