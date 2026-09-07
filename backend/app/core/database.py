from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("sqlite://"):
    db_url = db_url.replace("sqlite://", "sqlite+aiosqlite://")
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")

connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}

engine = create_async_engine(
    db_url,
    echo=False,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # SQLite schema migration helper for missing columns
        if "sqlite" in db_url:
            try:
                res = await conn.execute(text("PRAGMA table_info(users)"))
                user_cols = [row[1] for row in res.fetchall()]
                if "role" not in user_cols:
                    await conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'USER'"))
                if "status" not in user_cols:
                    await conn.execute(text("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active'"))
                if "last_login_at" not in user_cols:
                    await conn.execute(text("ALTER TABLE users ADD COLUMN last_login_at DATETIME"))

                res_j = await conn.execute(text("PRAGMA table_info(processing_jobs)"))
                job_cols = [row[1] for row in res_j.fetchall()]
                if "processing_time_ms" not in job_cols:
                    await conn.execute(text("ALTER TABLE processing_jobs ADD COLUMN processing_time_ms FLOAT DEFAULT 0.0"))
            except Exception:
                pass
