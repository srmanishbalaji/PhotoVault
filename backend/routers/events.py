from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/events", tags=["events"])

@router.post("/", response_model=schemas.EventOut)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db), current_user=Depends(auth.require_admin)):
    new_event = models.Event(
        name=event.name,
        description=event.description,
        admin_id=current_user.id
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.get("/", response_model=list[schemas.EventOut])
def get_events(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    if current_user.role == "admin":
        return db.query(models.Event).filter(models.Event.admin_id == current_user.id).all()
    memberships = db.query(models.EventMember).filter(models.EventMember.user_id == current_user.id).all()
    event_ids = [m.event_id for m in memberships]
    return db.query(models.Event).filter(models.Event.id.in_(event_ids)).all()

@router.post("/{event_id}/members")
def add_member(event_id: int, member: schemas.AddMember, db: Session = Depends(get_db), current_user=Depends(auth.require_admin)):
    user = db.query(models.User).filter(models.User.email == member.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    existing = db.query(models.EventMember).filter(
        models.EventMember.event_id == event_id,
        models.EventMember.user_id == user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Member already added")
    new_member = models.EventMember(event_id=event_id, user_id=user.id)
    db.add(new_member)
    db.commit()
    return {"message": "Member added successfully"}

@router.get("/{event_id}/members")
def get_members(event_id: int, db: Session = Depends(get_db), current_user=Depends(auth.require_admin)):
    members = db.query(models.EventMember).filter(models.EventMember.event_id == event_id).all()
    return [{"id": m.user.id, "name": m.user.name, "email": m.user.email} for m in members]