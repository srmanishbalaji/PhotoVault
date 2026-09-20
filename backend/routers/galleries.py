from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
import uuid

router = APIRouter(prefix="/galleries", tags=["galleries"])

@router.post("/", response_model=schemas.GalleryOut)
def create_gallery(gallery: schemas.GalleryCreate, db: Session = Depends(get_db), current_user=Depends(auth.require_admin)):
    existing = db.query(models.Gallery).filter(models.Gallery.event_id == gallery.event_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Gallery already exists for this event")
    share_link = str(uuid.uuid4())
    new_gallery = models.Gallery(
        event_id=gallery.event_id,
        pin=gallery.pin,
        share_link=share_link,
        is_published=True
    )
    db.add(new_gallery)
    db.commit()
    db.refresh(new_gallery)
    return new_gallery

@router.get("/admin", response_model=list[schemas.GalleryOut])
def get_admin_galleries(db: Session = Depends(get_db), current_user=Depends(auth.require_admin)):
    events = db.query(models.Event).filter(models.Event.admin_id == current_user.id).all()
    event_ids = [e.id for e in events]
    return db.query(models.Gallery).filter(models.Gallery.event_id.in_(event_ids)).all()

@router.post("/access/{share_link}")
def access_gallery(share_link: str, access: schemas.GalleryAccess, db: Session = Depends(get_db)):
    gallery = db.query(models.Gallery).filter(models.Gallery.share_link == share_link).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    if not gallery.is_published:
        raise HTTPException(status_code=403, detail="Gallery not published")
    if gallery.pin != access.pin:
        raise HTTPException(status_code=401, detail="Incorrect PIN")
    photos = db.query(models.Photo).filter(
        models.Photo.event_id == gallery.event_id,
        models.Photo.is_selected == True
    ).all()
    return {
        "gallery_id": gallery.id,
        "event_id": gallery.event_id,
        "photos": [{"id": p.id, "url": p.storage_url, "filename": p.filename} for p in photos]
    }

@router.get("/{share_link}/info")
def get_gallery_info(share_link: str, db: Session = Depends(get_db)):
    gallery = db.query(models.Gallery).filter(models.Gallery.share_link == share_link).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    event = db.query(models.Event).filter(models.Event.id == gallery.event_id).first()
    return {
        "event_name": event.name,
        "is_published": gallery.is_published,
        "photo_count": db.query(models.Photo).filter(
            models.Photo.event_id == gallery.event_id,
            models.Photo.is_selected == True
        ).count()
    }