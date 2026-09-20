import os
import sys
from types import SimpleNamespace

import pytest
from jose import jwt

# Add the backend folder to Python's import path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import auth
import models
from routers.events import get_events
from routers.photos import get_photos
from routers.galleries import create_gallery, access_gallery


# ---------------------------------------------------------
# Fake database/query helpers
# ---------------------------------------------------------

class FakeQuery:
    def __init__(self, result=None, results=None, count_value=0):
        self.result = result
        self.results = results if results is not None else []
        self.count_value = count_value

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.result

    def all(self):
        return self.results

    def count(self):
        return self.count_value


class FakeDB:
    def __init__(self):
        self.queries = {}
        self.added = []
        self.committed = False

    def query(self, model):
        return self.queries.get(model, FakeQuery())

    def add(self, obj):
        self.added.append(obj)

    def commit(self):
        self.committed = True

    def refresh(self, obj):
        if getattr(obj, "id", None) is None:
            obj.id = 1


# ---------------------------------------------------------
# Authentication
# ---------------------------------------------------------

def test_password_hash_and_verify():
    password = "TestPassword123!"

    hashed = auth.hash_password(password)

    assert hashed != password
    assert auth.verify_password(password, hashed)
    assert not auth.verify_password("WrongPassword", hashed)


def test_access_token_contains_user_identity():
    email = "member@photovault.com"

    token = auth.create_access_token({"sub": email})

    payload = jwt.decode(
        token,
        auth.SECRET_KEY,
        algorithms=[auth.ALGORITHM]
    )

    assert payload["sub"] == email
    assert "exp" in payload


# ---------------------------------------------------------
# Authorization
# ---------------------------------------------------------

def test_admin_authorization_accepts_admin():
    admin = SimpleNamespace(
        id=1,
        email="admin@photovault.com",
        role="admin"
    )

    result = auth.require_admin(admin)

    assert result == admin


def test_admin_authorization_rejects_member():
    member = SimpleNamespace(
        id=2,
        email="member@photovault.com",
        role="member"
    )

    with pytest.raises(Exception) as exc_info:
        auth.require_admin(member)

    assert exc_info.value.status_code == 403


# ---------------------------------------------------------
# Event access control
# ---------------------------------------------------------

def test_member_only_sees_assigned_events():
    member = SimpleNamespace(
        id=2,
        role="member"
    )

    membership = SimpleNamespace(
        event_id=1,
        user_id=2
    )

    event = SimpleNamespace(
        id=1,
        name="Arjun & Priya Wedding"
    )

    db = FakeDB()

    db.queries[models.EventMember] = FakeQuery(
        results=[membership]
    )

    db.queries[models.Event] = FakeQuery(
        results=[event]
    )

    result = get_events(
        db=db,
        current_user=member
    )

    assert result == [event]


# ---------------------------------------------------------
# Photo access control
# ---------------------------------------------------------

def test_member_only_sees_their_own_uploaded_photos():
    member = SimpleNamespace(
        id=2,
        role="member"
    )

    event = SimpleNamespace(
        id=1,
        admin_id=1
    )

    own_photo = SimpleNamespace(
        id=10,
        event_id=1,
        uploaded_by=2
    )

    db = FakeDB()

    db.queries[models.Event] = FakeQuery(
        result=event
    )

    db.queries[models.EventMember] = FakeQuery(
        result=SimpleNamespace(
            event_id=1,
            user_id=2
        )
    )

    db.queries[models.Photo] = FakeQuery(
        results=[own_photo]
    )

    result = get_photos(
        event_id=1,
        db=db,
        current_user=member
    )

    assert result == [own_photo]


def test_member_cannot_perform_admin_selection():
    member = SimpleNamespace(
        id=2,
        email="member@photovault.com",
        role="member"
    )

    with pytest.raises(Exception) as exc_info:
        auth.require_admin(member)

    assert exc_info.value.status_code == 403


# ---------------------------------------------------------
# Gallery publishing
# ---------------------------------------------------------

def test_admin_can_publish_gallery():
    admin = SimpleNamespace(
        id=1,
        role="admin"
    )

    gallery_data = SimpleNamespace(
        event_id=1,
        pin="123456"
    )

    db = FakeDB()

    db.queries[models.Gallery] = FakeQuery(
        result=None
    )

    result = create_gallery(
        gallery=gallery_data,
        db=db,
        current_user=admin
    )

    assert result.event_id == 1
    assert result.pin == "123456"
    assert result.is_published is True
    assert result.share_link is not None
    assert db.committed is True


# ---------------------------------------------------------
# Gallery PIN protection
# ---------------------------------------------------------

def test_correct_gallery_pin_returns_selected_photos():
    gallery = SimpleNamespace(
        id=1,
        event_id=1,
        pin="123456",
        share_link="demo-gallery",
        is_published=True
    )

    selected_photo = SimpleNamespace(
        id=10,
        storage_url="https://example.com/photo.jpg",
        filename="photo.jpg",
        is_selected=True
    )

    db = FakeDB()

    db.queries[models.Gallery] = FakeQuery(
        result=gallery
    )

    db.queries[models.Photo] = FakeQuery(
        results=[selected_photo]
    )

    access = SimpleNamespace(
        pin="123456"
    )

    result = access_gallery(
        share_link="demo-gallery",
        access=access,
        db=db
    )

    assert result["gallery_id"] == 1
    assert result["event_id"] == 1
    assert len(result["photos"]) == 1
    assert result["photos"][0]["id"] == 10


def test_incorrect_gallery_pin_is_rejected():
    gallery = SimpleNamespace(
        id=1,
        event_id=1,
        pin="123456",
        share_link="demo-gallery",
        is_published=True
    )

    db = FakeDB()

    db.queries[models.Gallery] = FakeQuery(
        result=gallery
    )

    access = SimpleNamespace(
        pin="111111"
    )

    with pytest.raises(Exception) as exc_info:
        access_gallery(
            share_link="demo-gallery",
            access=access,
            db=db
        )

    assert exc_info.value.status_code == 401