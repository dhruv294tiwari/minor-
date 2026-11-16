import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.main import app
from app.database import Base, get_db
from app.models.admin import Admin
from app.models.category import Category
from app.models.knowledge import KnowledgeEntry
from app.utils.security import get_password_hash

# In-memory or temporary SQLite test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_mait.db"

test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    settings.LLM_ENABLED = False
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    # Seed initial test admin
    db = TestingSessionLocal()
    admin = Admin(
        username="testadmin",
        email="testadmin@mait.ac.in",
        password_hash=get_password_hash("testpassword123")
    )
    db.add(admin)

    # Seed a category and verified knowledge
    cat = Category(name="Examinations", description="Exam schedules and datesheets")
    db.add(cat)
    db.commit()
    db.refresh(cat)

    entry = KnowledgeEntry(
        category_id=cat.id,
        title="Semester Exam Schedule 2026",
        question="When will semester exams begin?",
        answer="End-semester examinations begin on 10 December 2026 as per GGSIPU circular.",
        keywords="exam, semester, datesheet, schedule, december",
        source="GGSIPU Official Notice",
        source_url="http://ipu.ac.in",
        verified=True,
        created_by="testadmin"
    )
    db.add(entry)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    response = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "testpassword123"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
