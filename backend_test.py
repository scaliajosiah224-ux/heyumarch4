#!/usr/bin/env python3
"""
GummyText API Testing Suite
Tests all backend endpoints for TextNow/Caddy clone app
"""

import requests
import sys
import json
from datetime import datetime
import uuid

# Public backend URL from frontend/.env
BASE_URL = "https://sweet-design-3.preview.emergentagent.com/api"

class GummyTextAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.user_token = None
        self.user_data = None
        self.test_user = {
            "email": "test@gummytext.com",
            "password": "password123",
            "name": "Test User"
        }
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.user_token:
            test_headers['Authorization'] = f'Bearer {self.user_token}'

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "endpoint": endpoint,
                    "response": response.text[:200] if response.text else ""
                })
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    self.log(f"   Response: {response.json()}")
                except:
                    self.log(f"   Response: {response.text[:100]}")
                return False, {}

        except Exception as e:
            self.failed_tests.append({
                "test": name,
                "expected": expected_status,
                "actual": "ERROR",
                "endpoint": endpoint,
                "response": str(e)
            })
            self.log(f"❌ {name} - Error: {str(e)}")
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        self.log("\n=== Testing Health Endpoints ===")
        
        self.run_test("Root endpoint", "GET", "/", 200)
        self.run_test("Health check", "GET", "/health", 200)

    def test_auth_registration(self):
        """Test user registration"""
        self.log("\n=== Testing User Registration ===")
        
        # Use unique email to avoid conflicts
        unique_email = f"testuser_{uuid.uuid4().hex[:8]}@gummytext.com"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "/auth/register",
            200,
            {
                "email": unique_email,
                "password": "password123",
                "name": "New Test User"
            }
        )
        
        if success:
            self.user_token = response.get('access_token')
            self.user_data = response.get('user')
            self.log(f"   Token received: {self.user_token[:20]}...")

    def test_auth_login(self):
        """Test user login"""
        self.log("\n=== Testing User Login ===")
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "/auth/login",
            200,
            {
                "email": self.test_user["email"],
                "password": self.test_user["password"]
            }
        )
        
        if success:
            self.user_token = response.get('access_token')
            self.user_data = response.get('user')
            self.log(f"   Token received: {self.user_token[:20] if self.user_token else 'None'}...")
            return True
        return False

    def test_auth_me(self):
        """Test get current user"""
        self.log("\n=== Testing Auth Me ===")
        
        if not self.user_token:
            self.log("❌ No token available, skipping auth/me test")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "/auth/me",
            200
        )
        
        if success:
            self.log(f"   User: {response.get('email')} - Credits: {response.get('credits')}")
        
        return success

    def test_pin_endpoints(self):
        """Test PIN lock functionality"""
        self.log("\n=== Testing PIN Lock Endpoints ===")
        
        if not self.user_token:
            self.log("❌ No token available, skipping PIN tests")
            return
        
        # Check PIN status
        self.run_test("PIN Status", "GET", "/auth/pin/status", 200)
        
        # Setup PIN
        success, _ = self.run_test(
            "Setup PIN",
            "POST",
            "/auth/pin/setup",
            200,
            {"pin": "1234"}
        )
        
        if success:
            # Verify PIN
            self.run_test(
                "Verify PIN",
                "POST",
                "/auth/pin/verify",
                200,
                {"pin": "1234"}
            )
            
            # Wrong PIN
            self.run_test(
                "Wrong PIN",
                "POST",
                "/auth/pin/verify",
                401,
                {"pin": "9999"}
            )
            
            # Remove PIN
            self.run_test("Remove PIN", "DELETE", "/auth/pin", 200)

    def test_phone_number_endpoints(self):
        """Test phone number management"""
        self.log("\n=== Testing Phone Number Endpoints ===")
        
        if not self.user_token:
            self.log("❌ No token available, skipping phone number tests")
            return None
        
        # Get available numbers
        success, response = self.run_test(
            "Available Numbers",
            "GET",
            "/phone-numbers/available?area_code=555",
            200
        )
        
        if success:
            numbers = response.get('numbers', [])
            self.log(f"   Found {len(numbers)} available numbers")
            
            # Purchase a number
            purchase_success, purchase_response = self.run_test(
                "Purchase Number",
                "POST",
                "/phone-numbers/purchase",
                200,
                {"area_code": "555", "country": "US"}
            )
            
            if purchase_success:
                phone_id = purchase_response.get('phone_id')
                self.log(f"   Purchased number: {purchase_response.get('phone_number')}")
                
                # Get user's numbers
                self.run_test("Get User Numbers", "GET", "/phone-numbers", 200)
                
                return phone_id
        
        return None

    def test_messaging_endpoints(self):
        """Test messaging functionality"""
        self.log("\n=== Testing Messaging Endpoints ===")
        
        if not self.user_token:
            self.log("❌ No token available, skipping messaging tests")
            return
        
        # Send message
        success, response = self.run_test(
            "Send Message",
            "POST",
            "/messages/send",
            200,
            {
                "to_number": "+15551234567",
                "body": "Test message from API test"
            }
        )
        
        if success:
            message_id = response.get('message_id')
            self.log(f"   Message sent: {message_id}")
            
            # Get messages
            self.run_test("Get Messages", "GET", "/messages", 200)
            
            # Get conversations
            self.run_test("Get Conversations", "GET", "/messages/conversations", 200)
            
            # Get thread
            self.run_test(
                "Get Message Thread",
                "GET",
                "/messages/thread/+15551234567",
                200
            )

    def test_calls_endpoints(self):
        """Test call functionality"""
        self.log("\n=== Testing Call Endpoints ===")
        
        if not self.user_token:
            self.log("❌ No token available, skipping call tests")
            return
        
        # Initiate call
        success, response = self.run_test(
            "Initiate Call",
            "POST",
            "/calls/initiate",
            200,
            {"to_number": "+15551234567"}
        )
        
        if success:
            call_id = response.get('call_id')
            self.log(f"   Call initiated: {call_id}")
            
            # Get call history
            self.run_test("Get Call History", "GET", "/calls", 200)
            
            # End call (simulate)
            if call_id:
                self.run_test(
                    "End Call",
                    "PUT",
                    f"/calls/{call_id}/end",
                    200,
                    {"duration": 30}
                )

    def test_voicemail_endpoints(self):
        """Test voicemail functionality"""
        self.log("\n=== Testing Voicemail Endpoints ===")
        
        if not self.user_token:
            self.log("❌ No token available, skipping voicemail tests")
            return
        
        self.run_test("Get Voicemails", "GET", "/voicemails", 200)

    def test_payment_endpoints(self):
        """Test payment functionality"""
        self.log("\n=== Testing Payment Endpoints ===")
        
        # Public endpoints - no auth required
        self.run_test("Credit Packages", "GET", "/payments/packages", 200)
        self.run_test("Subscription Plans", "GET", "/payments/subscriptions", 200)

    def test_logout(self):
        """Test logout functionality"""
        self.log("\n=== Testing Logout ===")
        
        if not self.user_token:
            self.log("❌ No token available, skipping logout test")
            return
        
        self.run_test("User Logout", "POST", "/auth/logout", 200)

    def run_all_tests(self):
        """Run all API tests"""
        self.log("🚀 Starting GummyText API Test Suite")
        self.log(f"Testing against: {self.base_url}")
        
        try:
            # Health checks first
            self.test_health_endpoints()
            
            # Auth flow
            if self.test_auth_login():
                self.test_auth_me()
                
                # Feature tests (require auth)
                self.test_pin_endpoints()
                phone_id = self.test_phone_number_endpoints()
                self.test_messaging_endpoints()
                self.test_calls_endpoints()
                self.test_voicemail_endpoints()
                
                # Logout
                self.test_logout()
            else:
                # Try registration if login fails
                self.test_auth_registration()
                if self.user_token:
                    self.test_auth_me()
            
            # Public endpoints
            self.test_payment_endpoints()
            
        except Exception as e:
            self.log(f"❌ Test suite error: {str(e)}")
        
        # Print results
        self.print_summary()

    def print_summary(self):
        """Print test results summary"""
        self.log(f"\n{'='*50}")
        self.log("📊 TEST RESULTS SUMMARY")
        self.log(f"{'='*50}")
        self.log(f"Tests Run: {self.tests_run}")
        self.log(f"Tests Passed: {self.tests_passed}")
        self.log(f"Tests Failed: {len(self.failed_tests)}")
        
        if self.tests_run > 0:
            success_rate = (self.tests_passed / self.tests_run) * 100
            self.log(f"Success Rate: {success_rate:.1f}%")
        
        if self.failed_tests:
            self.log(f"\n❌ FAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                self.log(f"{i}. {test['test']}")
                self.log(f"   Endpoint: {test['endpoint']}")
                self.log(f"   Expected: {test['expected']}, Got: {test['actual']}")
                if test['response']:
                    self.log(f"   Response: {test['response'][:100]}...")
        
        return len(self.failed_tests) == 0

def main():
    """Main test runner"""
    tester = GummyTextAPITester()
    success = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())