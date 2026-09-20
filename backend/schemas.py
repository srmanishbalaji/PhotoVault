from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "member"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None

class EventOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    admin_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class AddMember(BaseModel):
    email: str

class PhotoOut(BaseModel):
    id: int
    filename: str
    storage_url: str
    is_selected: bool
    created_at: datetime
    class Config:
        from_attributes = True

class GalleryCreate(BaseModel):
    event_id: int
    pin: str

class GalleryOut(BaseModel):
    id: int
    event_id: int
    pin: str
    share_link: str
    is_published: bool
    class Config:
        from_attributes = True

class GalleryAccess(BaseModel):
    pin: str