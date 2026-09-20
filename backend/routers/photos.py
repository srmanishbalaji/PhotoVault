from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

router = APIRouter(prefix="/photos", tags=["photos"])

@router.post("/{event_id}/upload", response_model=schemas.PhotoOut)
async def upload_photo(event_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    membership = db.query(models.EventMember).filter(
        models.EventMember.event_id == event_id,
        models.EventMember.user_id == current_user.id
    ).first()
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not membership and (not event or event.admin_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized for this event")
    contents = await file.read()
    result = cloudinary.uploader.upload(contents, folder=f"photovault/event_{event_id}")
    new_photo = models.Photo(
        event_id=event_id,
        uploaded_by=current_user.id,
        filename=file.filename,
        storage_url=result["secure_url"],
        cloudinary_id=result["public_id"],
        file_size=len(contents)
    )
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)
    return new_photo

@router.get("/{event_id}", response_model=list[schemas.PhotoOut])
def get_photos(event_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user.role == "admin" and event.admin_id == current_user.id:
        return db.query(models.Photo).filter(models.Photo.event_id == event_id).all()
    membership = db.query(models.EventMember).filter(
        models.EventMember.event_id == event_id,
        models.EventMember.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(models.Photo).filter(
        models.Photo.event_id == event_id,
        models.Photo.uploaded_by == current_user.id
    ).all()

@router.patch("/{photo_id}/select")
def select_photo(photo_id: int, db: Session = Depends(get_db), current_user=Depends(auth.require_admin)):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    photo.is_selected = not photo.is_selected
    db.commit()
    return {"message": "Photo selection updated", "is_selected": photo.is_selected}