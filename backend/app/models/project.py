import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    youtube_url = Column(String, nullable=True)
    transcript = Column(Text, nullable=True)
    paraphrased_script = Column(Text, nullable=True)
    voiceover_text = Column(Text, nullable=True)
    scene_plan = Column(Text, nullable=True)
    audio_path = Column(String, nullable=True)
    audio_files = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="projects")
