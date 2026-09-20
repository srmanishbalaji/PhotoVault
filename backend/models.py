from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="member")  # admin or member
    created_at = Column(DateTime, default=datetime.utcnow)
    events = relationship("EventMember", back_populates="user")
    photos = relationship("Photo", back_populates="uploader")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    admin_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    members = relationship("EventMember", back_populates="event")
    photos = relationship("Photo", back_populates="event")
    gallery = relationship("Gallery", back_populates="event", uselist=False)

class EventMember(Base):
    __tablename__ = "event_members"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    event = relationship("Event", back_populates="members")
    user = relationship("User", back_populates="events")

class Photo(Base):
    __tablename__ = "photos"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    storage_url = Column(String)
    cloudinary_id = Column(String)
    file_size = Column(Integer)
    is_selected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    event = relationship("Event", back_populates="photos")
    uploader = relationship("User", back_populates="photos")

class Gallery(Base):
    __tablename__ = "galleries"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), unique=True)
    pin = Column(String, nullable=False)
    share_link = Column(String, unique=True)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    event = relationship("Event", back_populates="gallery")