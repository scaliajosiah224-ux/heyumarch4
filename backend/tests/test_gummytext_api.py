"""
GummyText API Tests - Comprehensive Backend Testing
Tests for: Authentication, Twilio Webhooks, Messages, Calls, Voicemail, Payments
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials provided
TEST_EMAIL = "test2@gummytext.com"
TEST_PASSWORD = "Test123456"


class TestHealthAndRoot:
    """Basic health and root endpoint tests"""
    
    def test_api_root(self):
        """Test API root endpoint returns proper response"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "twilio_enabled" in data
        print(f"API Root: {data}")
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print(f"Health: {data}")


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        print(f"Login successful for: {TEST_EMAIL}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("Invalid credentials correctly rejected")
    
    def test_get_current_user(self):
        """Test getting current user info after login"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        session = requests.Session()
        session.cookies.update(login_response.cookies)
        
        # Get current user
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_EMAIL
        assert "credits" in data
        assert "subscription_type" in data
        print(f"Current user: {data['email']}, credits: {data.get('credits')}")
    
    def test_logout(self):
        """Test logout functionality"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        session = requests.Session()
        session.cookies.update(login_response.cookies)
        
        # Logout
        response = session.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 200
        print("Logout successful")


class TestPinLock:
    """PIN lock functionality tests"""
    
    @pytest.fixture(autouse=True)
    def setup_session(self):
        """Setup authenticated session"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.session = requests.Session()
        self.session.cookies.update(login_response.cookies)
    
    def test_pin_status(self):
        """Test getting PIN status"""
        response = self.session.get(f"{BASE_URL}/api/auth/pin/status")
        assert response.status_code == 200
        data = response.json()
        assert "has_pin" in data
        print(f"PIN status: has_pin={data['has_pin']}")


class TestTwilioWebhooks:
    """Twilio webhook endpoint tests"""
    
    def test_sms_webhook_endpoint(self):
        """Test incoming SMS webhook responds correctly"""
        # Twilio sends form data
        form_data = {
            "From": "+15551234567",
            "To": "+16812614963",  # Test Twilio number
            "Body": "Test incoming SMS",
            "MessageSid": f"SM{uuid.uuid4().hex[:32]}"
        }
        response = requests.post(f"{BASE_URL}/api/webhooks/twilio/sms", data=form_data)
        assert response.status_code == 200
        # Should return TwiML XML
        assert "application/xml" in response.headers.get("content-type", "")
        assert "Response" in response.text
        print(f"SMS webhook response: {response.text[:100]}")
    
    def test_voice_webhook_endpoint(self):
        """Test incoming voice call webhook responds with TwiML"""
        form_data = {
            "From": "+15551234567",
            "To": "+16812614963",
            "CallSid": f"CA{uuid.uuid4().hex[:32]}",
            "CallStatus": "ringing"
        }
        response = requests.post(f"{BASE_URL}/api/webhooks/twilio/voice", data=form_data)
        assert response.status_code == 200
        assert "application/xml" in response.headers.get("content-type", "")
        # Should contain voicemail TwiML
        assert "Response" in response.text
        assert "Record" in response.text or "Say" in response.text
        print(f"Voice webhook response: {response.text[:150]}")
    
    def test_transcription_webhook_endpoint(self):
        """Test voicemail transcription webhook"""
        form_data = {
            "TranscriptionText": "Hello, this is a test voicemail transcription.",
            "RecordingUrl": "https://api.twilio.com/recording/test.mp3",
            "CallSid": f"CA{uuid.uuid4().hex[:32]}",
            "From": "+15551234567",
            "To": "+16812614963"
        }
        response = requests.post(f"{BASE_URL}/api/webhooks/twilio/transcription", data=form_data)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") in ["ok", "error"]
        print(f"Transcription webhook response: {data}")
    
    def test_status_webhook_endpoint(self):
        """Test message/call status update webhook"""
        form_data = {
            "MessageSid": f"SM{uuid.uuid4().hex[:32]}",
            "MessageStatus": "delivered"
        }
        response = requests.post(f"{BASE_URL}/api/webhooks/twilio/status", data=form_data)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") in ["ok", "error"]
        print(f"Status webhook response: {data}")


class TestPhoneNumbers:
    """Phone number management tests"""
    
    @pytest.fixture(autouse=True)
    def setup_session(self):
        """Setup authenticated session"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.session = requests.Session()
        self.session.cookies.update(login_response.cookies)
    
    def test_get_user_phone_numbers(self):
        """Test getting user's phone numbers"""
        response = self.session.get(f"{BASE_URL}/api/phone-numbers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "phone_number" in data[0]
            assert "friendly_name" in data[0]
            print(f"User has {len(data)} phone number(s): {data[0].get('friendly_name')}")
        else:
            print("User has no phone numbers")
    
    def test_get_twilio_account_numbers(self):
        """Test getting Twilio account owned numbers"""
        response = self.session.get(f"{BASE_URL}/api/phone-numbers/twilio-account")
        assert response.status_code == 200
        data = response.json()
        assert "numbers" in data
        assert "twilio_enabled" in data
        print(f"Twilio account has {data.get('count', 0)} numbers, enabled: {data.get('twilio_enabled')}")
    
    def test_get_nearby_numbers(self):
        """Test getting nearby available numbers"""
        response = self.session.get(f"{BASE_URL}/api/phone-numbers/nearby?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert "numbers" in data
        assert "twilio_enabled" in data
        print(f"Found {data.get('count', 0)} nearby numbers")


class TestMessaging:
    """Messaging functionality tests"""
    
    @pytest.fixture(autouse=True)
    def setup_session(self):
        """Setup authenticated session"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.session = requests.Session()
        self.session.cookies.update(login_response.cookies)
    
    def test_get_conversations(self):
        """Test getting message conversations"""
        response = self.session.get(f"{BASE_URL}/api/messages/conversations")
        assert response.status_code == 200
        data = response.json()
        assert "conversations" in data
        print(f"Found {len(data.get('conversations', []))} conversations")
    
    def test_get_messages(self):
        """Test getting messages"""
        response = self.session.get(f"{BASE_URL}/api/messages?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} messages")
    
    def test_message_reaction_endpoint(self):
        """Test message reaction endpoint exists"""
        # This will fail with 404 if message doesn't exist, which is expected
        response = self.session.post(
            f"{BASE_URL}/api/messages/test_message_id/react",
            json={"emoji": "❤️"}
        )
        # Should return 404 (message not found) not 500 (server error)
        assert response.status_code in [200, 404]
        print(f"Message reaction endpoint responds with: {response.status_code}")


class TestCalls:
    """Call functionality tests"""
    
    @pytest.fixture(autouse=True)
    def setup_session(self):
        """Setup authenticated session"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.session = requests.Session()
        self.session.cookies.update(login_response.cookies)
    
    def test_get_call_history(self):
        """Test getting call history"""
        response = self.session.get(f"{BASE_URL}/api/calls?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} calls in history")


class TestVoicemail:
    """Voicemail functionality tests"""
    
    @pytest.fixture(autouse=True)
    def setup_session(self):
        """Setup authenticated session"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.session = requests.Session()
        self.session.cookies.update(login_response.cookies)
    
    def test_get_voicemails(self):
        """Test getting voicemails"""
        response = self.session.get(f"{BASE_URL}/api/voicemails?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} voicemails")


class TestPayments:
    """Payment and subscription tests"""
    
    @pytest.fixture(autouse=True)
    def setup_session(self):
        """Setup authenticated session"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.session = requests.Session()
        self.session.cookies.update(login_response.cookies)
    
    def test_get_credit_packages(self):
        """Test getting available credit packages"""
        response = self.session.get(f"{BASE_URL}/api/payments/packages")
        assert response.status_code == 200
        data = response.json()
        assert "packages" in data
        packages = data["packages"]
        assert len(packages) >= 1
        # Check for $4.99 pricing mentioned in requirements
        prices = [p["price"] for p in packages]
        assert 4.99 in prices, "Should have $4.99 package"
        print(f"Found {len(packages)} credit packages: {prices}")
    
    def test_get_subscription_plans(self):
        """Test getting subscription plans"""
        response = self.session.get(f"{BASE_URL}/api/payments/subscriptions")
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        plans = data["plans"]
        assert len(plans) >= 1
        # Check for Personal plan at $4.99/month
        personal_plan = next((p for p in plans if p["name"] == "Personal"), None)
        assert personal_plan is not None, "Should have Personal plan"
        assert personal_plan["price"] == 4.99, "Personal plan should be $4.99/month"
        print(f"Found {len(plans)} subscription plans")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
