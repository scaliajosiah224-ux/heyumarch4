from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import jwt, JWTError
import aiohttp
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'gummytext-secret-key-2026')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 days

# Twilio Configuration (will be mocked if not provided)
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')
TWILIO_ENABLED = bool(TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN)

# Stripe Configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')

# Create the main app
app = FastAPI(title="GummyText API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    credits: int = 25
    subscription_type: str = "free"
    trial_ends_at: Optional[str] = None
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PhoneNumberRequest(BaseModel):
    area_code: str
    country: str = "US"

class PhoneNumberResponse(BaseModel):
    phone_id: str
    phone_number: str
    friendly_name: str
    area_code: str
    country: str
    capabilities: Dict[str, bool]
    is_primary: bool
    created_at: str

class MessageCreate(BaseModel):
    to_number: str
    body: str
    media_url: Optional[str] = None

class MessageResponse(BaseModel):
    message_id: str
    from_number: str
    to_number: str
    body: str
    media_url: Optional[str] = None
    direction: str  # inbound/outbound
    status: str
    created_at: str
    credits_used: int = 1

class CallCreate(BaseModel):
    to_number: str

class CallResponse(BaseModel):
    call_id: str
    from_number: str
    to_number: str
    direction: str
    status: str
    duration: int = 0
    created_at: str

class VoicemailResponse(BaseModel):
    voicemail_id: str
    from_number: str
    to_number: str
    duration: int
    transcription: Optional[str] = None
    audio_url: str
    is_read: bool = False
    created_at: str

class PinSetup(BaseModel):
    pin: str

class PinVerify(BaseModel):
    pin: str

class CreditPackage(BaseModel):
    package_id: str
    name: str
    credits: int
    price: float
    popular: bool = False

class SubscriptionPlan(BaseModel):
    plan_id: str
    name: str
    price: float
    credits_per_month: int
    features: List[str]

# ===================== HELPER FUNCTIONS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None)
) -> dict:
    token = None
    
    # Try cookie first
    token = request.cookies.get("session_token")
    
    # Fall back to Authorization header
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        else:
            token = authorization
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        # Check if it's a session token from Google OAuth
        session = await db.user_sessions.find_one(
            {"session_token": token},
            {"_id": 0}
        )
        if not session:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        
        user_id = session.get("user_id")
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

def generate_mock_phone_number(area_code: str) -> str:
    import random
    return f"+1{area_code}{random.randint(1000000, 9999999)}"

# ===================== AUTH ENDPOINTS =====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate, response: Response):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    trial_ends = now + timedelta(days=7)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hash_password(user_data.password),
        "picture": None,
        "credits": 25,
        "subscription_type": "free",
        "trial_ends_at": trial_ends.isoformat(),
        "pin_hash": None,
        "created_at": now.isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_HOURS * 3600
    )
    
    user_response = UserResponse(
        user_id=user_id,
        email=user_data.email,
        name=user_data.name,
        credits=25,
        subscription_type="free",
        trial_ends_at=trial_ends.isoformat(),
        created_at=now.isoformat()
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin, response: Response):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["user_id"])
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_HOURS * 3600
    )
    
    user_response = UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        picture=user.get("picture"),
        credits=user.get("credits", 25),
        subscription_type=user.get("subscription_type", "free"),
        trial_ends_at=user.get("trial_ends_at"),
        created_at=user["created_at"]
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/session")
async def process_google_session(request: Request, response: Response):
    """Process Google OAuth session from Emergent Auth"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    async with aiohttp.ClientSession() as http_session:
        async with http_session.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        ) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            session_data = await resp.json()
    
    email = session_data.get("email")
    name = session_data.get("name")
    picture = session_data.get("picture")
    session_token = session_data.get("session_token")
    
    # Check if user exists
    user = await db.users.find_one({"email": email}, {"_id": 0})
    now = datetime.now(timezone.utc)
    
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        trial_ends = now + timedelta(days=7)
        
        user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "password_hash": None,
            "credits": 25,
            "subscription_type": "free",
            "trial_ends_at": trial_ends.isoformat(),
            "pin_hash": None,
            "created_at": now.isoformat()
        }
        await db.users.insert_one(user)
    else:
        user_id = user["user_id"]
        # Update picture if changed
        if picture and picture != user.get("picture"):
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {"picture": picture}}
            )
            user["picture"] = picture
    
    # Store session
    expires_at = now + timedelta(days=7)
    await db.user_sessions.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "session_token": session_token,
                "expires_at": expires_at.isoformat(),
                "created_at": now.isoformat()
            }
        },
        upsert=True
    )
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 3600
    )
    
    return {
        "user_id": user.get("user_id", user_id),
        "email": email,
        "name": name,
        "picture": picture,
        "credits": user.get("credits", 25),
        "subscription_type": user.get("subscription_type", "free"),
        "trial_ends_at": user.get("trial_ends_at"),
        "created_at": user.get("created_at", now.isoformat())
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        picture=user.get("picture"),
        credits=user.get("credits", 25),
        subscription_type=user.get("subscription_type", "free"),
        trial_ends_at=user.get("trial_ends_at"),
        created_at=user["created_at"]
    )

@api_router.post("/auth/logout")
async def logout(response: Response, user: dict = Depends(get_current_user)):
    await db.user_sessions.delete_one({"user_id": user["user_id"]})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# ===================== PIN LOCK ENDPOINTS =====================

@api_router.post("/auth/pin/setup")
async def setup_pin(pin_data: PinSetup, user: dict = Depends(get_current_user)):
    if len(pin_data.pin) != 4 or not pin_data.pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be 4 digits")
    
    pin_hash = hash_password(pin_data.pin)
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"pin_hash": pin_hash}}
    )
    return {"message": "PIN set successfully"}

@api_router.post("/auth/pin/verify")
async def verify_pin(pin_data: PinVerify, user: dict = Depends(get_current_user)):
    if not user.get("pin_hash"):
        raise HTTPException(status_code=400, detail="No PIN set")
    
    if not verify_password(pin_data.pin, user["pin_hash"]):
        raise HTTPException(status_code=401, detail="Invalid PIN")
    
    return {"message": "PIN verified"}

@api_router.delete("/auth/pin")
async def remove_pin(user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"pin_hash": None}}
    )
    return {"message": "PIN removed"}

@api_router.get("/auth/pin/status")
async def pin_status(user: dict = Depends(get_current_user)):
    return {"has_pin": bool(user.get("pin_hash"))}

# ===================== PHONE NUMBER ENDPOINTS =====================

@api_router.get("/phone-numbers/available")
async def get_available_numbers(
    area_code: str,
    country: str = "US",
    user: dict = Depends(get_current_user)
):
    """Get available phone numbers for purchase (mocked if Twilio not configured)"""
    numbers = []
    
    if TWILIO_ENABLED:
        try:
            from twilio.rest import Client
            twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            
            available = twilio_client.available_phone_numbers(country).local.list(
                area_code=area_code,
                limit=10
            )
            
            for num in available:
                numbers.append({
                    "phone_number": num.phone_number,
                    "friendly_name": num.friendly_name,
                    "area_code": area_code,
                    "country": country,
                    "capabilities": {
                        "voice": num.capabilities.get("voice", False),
                        "sms": num.capabilities.get("sms", False),
                        "mms": num.capabilities.get("mms", False)
                    }
                })
        except Exception as e:
            logger.error(f"Twilio error: {e}")
    
    # Return mock numbers if Twilio not available or failed
    if not numbers:
        for i in range(10):
            mock_number = generate_mock_phone_number(area_code)
            numbers.append({
                "phone_number": mock_number,
                "friendly_name": f"({area_code}) {mock_number[5:8]}-{mock_number[8:]}",
                "area_code": area_code,
                "country": country,
                "capabilities": {
                    "voice": True,
                    "sms": True,
                    "mms": True
                },
                "is_mock": True
            })
    
    return {"numbers": numbers, "twilio_enabled": TWILIO_ENABLED}

@api_router.post("/phone-numbers/purchase", response_model=PhoneNumberResponse)
async def purchase_phone_number(
    request: PhoneNumberRequest,
    user: dict = Depends(get_current_user)
):
    """Purchase a phone number"""
    # Check user's phone number limit (max 10)
    user_numbers = await db.phone_numbers.count_documents({"user_id": user["user_id"]})
    if user_numbers >= 10:
        raise HTTPException(status_code=400, detail="Maximum 10 phone numbers allowed")
    
    phone_number = None
    
    if TWILIO_ENABLED:
        try:
            from twilio.rest import Client
            twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            
            # Find and purchase a number
            available = twilio_client.available_phone_numbers(request.country).local.list(
                area_code=request.area_code,
                limit=1
            )
            
            if available:
                purchased = twilio_client.incoming_phone_numbers.create(
                    phone_number=available[0].phone_number
                )
                phone_number = purchased.phone_number
        except Exception as e:
            logger.error(f"Twilio purchase error: {e}")
    
    # Use mock number if Twilio not available
    if not phone_number:
        phone_number = generate_mock_phone_number(request.area_code)
    
    phone_id = f"phone_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    is_primary = user_numbers == 0
    
    phone_doc = {
        "phone_id": phone_id,
        "user_id": user["user_id"],
        "phone_number": phone_number,
        "friendly_name": f"({request.area_code}) {phone_number[5:8]}-{phone_number[8:]}",
        "area_code": request.area_code,
        "country": request.country,
        "capabilities": {"voice": True, "sms": True, "mms": True},
        "is_primary": is_primary,
        "is_mock": not TWILIO_ENABLED,
        "created_at": now.isoformat()
    }
    
    await db.phone_numbers.insert_one(phone_doc)
    
    return PhoneNumberResponse(
        phone_id=phone_id,
        phone_number=phone_number,
        friendly_name=phone_doc["friendly_name"],
        area_code=request.area_code,
        country=request.country,
        capabilities=phone_doc["capabilities"],
        is_primary=is_primary,
        created_at=now.isoformat()
    )

@api_router.get("/phone-numbers", response_model=List[PhoneNumberResponse])
async def get_user_phone_numbers(user: dict = Depends(get_current_user)):
    """Get user's phone numbers"""
    numbers = await db.phone_numbers.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).to_list(100)
    
    return [PhoneNumberResponse(**n) for n in numbers]

@api_router.put("/phone-numbers/{phone_id}/primary")
async def set_primary_number(phone_id: str, user: dict = Depends(get_current_user)):
    """Set a phone number as primary"""
    # Unset current primary
    await db.phone_numbers.update_many(
        {"user_id": user["user_id"]},
        {"$set": {"is_primary": False}}
    )
    
    # Set new primary
    result = await db.phone_numbers.update_one(
        {"phone_id": phone_id, "user_id": user["user_id"]},
        {"$set": {"is_primary": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Phone number not found")
    
    return {"message": "Primary number updated"}

@api_router.delete("/phone-numbers/{phone_id}")
async def release_phone_number(phone_id: str, user: dict = Depends(get_current_user)):
    """Release a phone number"""
    number = await db.phone_numbers.find_one(
        {"phone_id": phone_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not number:
        raise HTTPException(status_code=404, detail="Phone number not found")
    
    # Release from Twilio if real number
    if TWILIO_ENABLED and not number.get("is_mock"):
        try:
            from twilio.rest import Client
            twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            
            incoming_numbers = twilio_client.incoming_phone_numbers.list(
                phone_number=number["phone_number"]
            )
            for num in incoming_numbers:
                num.delete()
        except Exception as e:
            logger.error(f"Twilio release error: {e}")
    
    await db.phone_numbers.delete_one({"phone_id": phone_id})
    
    return {"message": "Phone number released"}

# ===================== MESSAGING ENDPOINTS =====================

@api_router.post("/messages/send", response_model=MessageResponse)
async def send_message(
    message: MessageCreate,
    user: dict = Depends(get_current_user)
):
    """Send SMS/MMS"""
    # Get user's primary number
    primary_number = await db.phone_numbers.find_one(
        {"user_id": user["user_id"], "is_primary": True},
        {"_id": 0}
    )
    
    if not primary_number:
        raise HTTPException(status_code=400, detail="No phone number configured")
    
    # Calculate credits needed
    credits_needed = 4 if message.media_url else 1
    
    # Check credits
    if user.get("credits", 0) < credits_needed and user.get("subscription_type") != "unlimited":
        raise HTTPException(status_code=402, detail="Insufficient credits")
    
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    status = "queued"
    
    # Send via Twilio if enabled
    if TWILIO_ENABLED and not primary_number.get("is_mock"):
        try:
            from twilio.rest import Client
            twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            
            msg_params = {
                "body": message.body,
                "from_": primary_number["phone_number"],
                "to": message.to_number
            }
            
            if message.media_url:
                msg_params["media_url"] = [message.media_url]
            
            twilio_msg = twilio_client.messages.create(**msg_params)
            status = twilio_msg.status
        except Exception as e:
            logger.error(f"Twilio send error: {e}")
            status = "mock_sent"
    else:
        status = "mock_sent"
    
    message_doc = {
        "message_id": message_id,
        "user_id": user["user_id"],
        "from_number": primary_number["phone_number"],
        "to_number": message.to_number,
        "body": message.body,
        "media_url": message.media_url,
        "direction": "outbound",
        "status": status,
        "credits_used": credits_needed,
        "created_at": now.isoformat()
    }
    
    await db.messages.insert_one(message_doc)
    
    # Deduct credits
    if user.get("subscription_type") != "unlimited":
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {"credits": -credits_needed}}
        )
    
    return MessageResponse(**{k: v for k, v in message_doc.items() if k != "user_id"})

@api_router.get("/messages", response_model=List[MessageResponse])
async def get_messages(
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    """Get user's messages"""
    messages = await db.messages.find(
        {"user_id": user["user_id"]},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return [MessageResponse(**m) for m in messages]

@api_router.get("/messages/conversations")
async def get_conversations(user: dict = Depends(get_current_user)):
    """Get message conversations grouped by contact"""
    pipeline = [
        {"$match": {"user_id": user["user_id"]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": {
                "$cond": [
                    {"$eq": ["$direction", "outbound"]},
                    "$to_number",
                    "$from_number"
                ]
            },
            "last_message": {"$first": "$$ROOT"},
            "unread_count": {
                "$sum": {"$cond": [
                    {"$and": [
                        {"$eq": ["$direction", "inbound"]},
                        {"$eq": ["$is_read", False]}
                    ]},
                    1, 0
                ]}
            }
        }},
        {"$project": {
            "_id": 0,
            "contact_number": "$_id",
            "last_message": {
                "message_id": "$last_message.message_id",
                "body": "$last_message.body",
                "direction": "$last_message.direction",
                "status": "$last_message.status",
                "created_at": "$last_message.created_at"
            },
            "unread_count": 1
        }},
        {"$sort": {"last_message.created_at": -1}}
    ]
    
    conversations = await db.messages.aggregate(pipeline).to_list(100)
    return {"conversations": conversations}

@api_router.get("/messages/thread/{contact_number}")
async def get_message_thread(
    contact_number: str,
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    """Get message thread with a specific contact"""
    messages = await db.messages.find(
        {
            "user_id": user["user_id"],
            "$or": [
                {"to_number": contact_number},
                {"from_number": contact_number}
            ]
        },
        {"_id": 0, "user_id": 0}
    ).sort("created_at", 1).limit(limit).to_list(limit)
    
    # Mark as read
    await db.messages.update_many(
        {
            "user_id": user["user_id"],
            "from_number": contact_number,
            "direction": "inbound"
        },
        {"$set": {"is_read": True}}
    )
    
    return {"messages": [MessageResponse(**m) for m in messages]}

@api_router.put("/messages/{message_id}/read")
async def mark_message_read(message_id: str, user: dict = Depends(get_current_user)):
    """Mark message as read"""
    result = await db.messages.update_one(
        {"message_id": message_id, "user_id": user["user_id"]},
        {"$set": {"is_read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"message": "Marked as read"}

# ===================== CALL ENDPOINTS =====================

@api_router.post("/calls/initiate", response_model=CallResponse)
async def initiate_call(
    call: CallCreate,
    user: dict = Depends(get_current_user)
):
    """Initiate a call (mocked - would use WebRTC in production)"""
    primary_number = await db.phone_numbers.find_one(
        {"user_id": user["user_id"], "is_primary": True},
        {"_id": 0}
    )
    
    if not primary_number:
        raise HTTPException(status_code=400, detail="No phone number configured")
    
    # Check credits (1 credit per minute)
    if user.get("credits", 0) < 1 and user.get("subscription_type") != "unlimited":
        raise HTTPException(status_code=402, detail="Insufficient credits")
    
    call_id = f"call_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    call_doc = {
        "call_id": call_id,
        "user_id": user["user_id"],
        "from_number": primary_number["phone_number"],
        "to_number": call.to_number,
        "direction": "outbound",
        "status": "initiated",
        "duration": 0,
        "created_at": now.isoformat()
    }
    
    await db.calls.insert_one(call_doc)
    
    return CallResponse(**{k: v for k, v in call_doc.items() if k != "user_id"})

@api_router.get("/calls", response_model=List[CallResponse])
async def get_call_history(
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    """Get call history"""
    calls = await db.calls.find(
        {"user_id": user["user_id"]},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return [CallResponse(**c) for c in calls]

@api_router.put("/calls/{call_id}/end")
async def end_call(
    call_id: str,
    duration: int = 0,
    user: dict = Depends(get_current_user)
):
    """End a call and deduct credits"""
    result = await db.calls.update_one(
        {"call_id": call_id, "user_id": user["user_id"]},
        {"$set": {"status": "completed", "duration": duration}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Call not found")
    
    # Deduct credits (1 per minute, minimum 1)
    minutes = max(1, (duration + 59) // 60)
    if user.get("subscription_type") != "unlimited":
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {"credits": -minutes}}
        )
    
    return {"message": "Call ended", "credits_used": minutes}

# ===================== VOICEMAIL ENDPOINTS =====================

@api_router.get("/voicemails", response_model=List[VoicemailResponse])
async def get_voicemails(
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    """Get user's voicemails"""
    voicemails = await db.voicemails.find(
        {"user_id": user["user_id"]},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return [VoicemailResponse(**v) for v in voicemails]

@api_router.put("/voicemails/{voicemail_id}/read")
async def mark_voicemail_read(voicemail_id: str, user: dict = Depends(get_current_user)):
    """Mark voicemail as read"""
    result = await db.voicemails.update_one(
        {"voicemail_id": voicemail_id, "user_id": user["user_id"]},
        {"$set": {"is_read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Voicemail not found")
    
    return {"message": "Marked as read"}

@api_router.delete("/voicemails/{voicemail_id}")
async def delete_voicemail(voicemail_id: str, user: dict = Depends(get_current_user)):
    """Delete a voicemail"""
    result = await db.voicemails.delete_one(
        {"voicemail_id": voicemail_id, "user_id": user["user_id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Voicemail not found")
    
    return {"message": "Voicemail deleted"}

# ===================== PAYMENT ENDPOINTS =====================

@api_router.get("/payments/packages")
async def get_credit_packages():
    """Get available credit packages"""
    packages = [
        {"package_id": "credits_50", "name": "Starter Pack", "credits": 50, "price": 4.99, "popular": False},
        {"package_id": "credits_150", "name": "Value Pack", "credits": 150, "price": 9.99, "popular": True},
        {"package_id": "credits_500", "name": "Power Pack", "credits": 500, "price": 24.99, "popular": False},
        {"package_id": "credits_1000", "name": "Pro Pack", "credits": 1000, "price": 39.99, "popular": False}
    ]
    return {"packages": packages}

@api_router.get("/payments/subscriptions")
async def get_subscription_plans():
    """Get subscription plans"""
    plans = [
        {
            "plan_id": "free",
            "name": "Free",
            "price": 0,
            "credits_per_month": 25,
            "features": ["1 Phone Number", "25 Credits/Month", "Basic Support"]
        },
        {
            "plan_id": "pro",
            "name": "Pro",
            "price": 9.99,
            "credits_per_month": 500,
            "features": ["5 Phone Numbers", "500 Credits/Month", "Priority Support", "Voicemail Transcription"]
        },
        {
            "plan_id": "unlimited",
            "name": "Unlimited",
            "price": 19.99,
            "credits_per_month": -1,
            "features": ["10 Phone Numbers", "Unlimited Usage", "24/7 Support", "All Features"]
        }
    ]
    return {"plans": plans}

@api_router.post("/payments/checkout")
async def create_checkout_session(
    request: Request,
    user: dict = Depends(get_current_user)
):
    """Create Stripe checkout session"""
    from emergentintegrations.payments.stripe.checkout import (
        StripeCheckout, CheckoutSessionRequest
    )
    
    body = await request.json()
    package_id = body.get("package_id")
    origin_url = body.get("origin_url")
    
    if not origin_url:
        raise HTTPException(status_code=400, detail="origin_url required")
    
    # Define packages server-side (security)
    PACKAGES = {
        "credits_50": {"credits": 50, "price": 4.99},
        "credits_150": {"credits": 150, "price": 9.99},
        "credits_500": {"credits": 500, "price": 24.99},
        "credits_1000": {"credits": 1000, "price": 39.99}
    }
    
    if package_id not in PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    package = PACKAGES[package_id]
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{origin_url}/dashboard?payment=success&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/dashboard?payment=cancelled"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(package["price"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["user_id"],
            "package_id": package_id,
            "credits": str(package["credits"])
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Store transaction
    now = datetime.now(timezone.utc)
    await db.payment_transactions.insert_one({
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "session_id": session.session_id,
        "user_id": user["user_id"],
        "package_id": package_id,
        "amount": package["price"],
        "currency": "usd",
        "credits": package["credits"],
        "status": "pending",
        "payment_status": "initiated",
        "created_at": now.isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(
    session_id: str,
    user: dict = Depends(get_current_user)
):
    """Check payment status and add credits if successful"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction
    transaction = await db.payment_transactions.find_one(
        {"session_id": session_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Only add credits once
    if status.payment_status == "paid" and transaction.get("status") != "completed":
        credits_to_add = transaction.get("credits", 0)
        
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {"credits": credits_to_add}}
        )
        
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"status": "completed", "payment_status": "paid"}}
        )
    elif status.status == "expired":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"status": "expired", "payment_status": "expired"}}
        )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount": status.amount_total / 100 if status.amount_total else 0
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    
    try:
        event = await stripe_checkout.handle_webhook(body, signature)
        
        if event.payment_status == "paid":
            transaction = await db.payment_transactions.find_one(
                {"session_id": event.session_id},
                {"_id": 0}
            )
            
            if transaction and transaction.get("status") != "completed":
                await db.users.update_one(
                    {"user_id": transaction["user_id"]},
                    {"$inc": {"credits": transaction.get("credits", 0)}}
                )
                
                await db.payment_transactions.update_one(
                    {"session_id": event.session_id},
                    {"$set": {"status": "completed", "payment_status": "paid"}}
                )
        
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"received": True}

# ===================== UTILITY ENDPOINTS =====================

@api_router.get("/")
async def root():
    return {"message": "GummyText API v1.0", "twilio_enabled": TWILIO_ENABLED}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
