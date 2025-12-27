"""
Migration script to add S3-related columns to existing documents table.
Run this script if you have an existing database and want to add S3 support.
"""

from sqlalchemy import create_engine, text
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)


def migrate_documents_table():
    """Add S3-related columns to documents table if they don't exist"""
    settings = get_settings()
    engine = create_engine(settings.database_url)
    
    try:
        with engine.connect() as conn:
            # Check if columns already exist
            if "sqlite" in settings.database_url:
                # SQLite approach
                result = conn.execute(text("PRAGMA table_info(documents)"))
                columns = [row[1] for row in result.fetchall()]
                
                if 's3_key' not in columns:
                    conn.execute(text("ALTER TABLE documents ADD COLUMN s3_key TEXT"))
                    logger.info("Added s3_key column to documents table")
                
                if 'storage_type' not in columns:
                    conn.execute(text("ALTER TABLE documents ADD COLUMN storage_type TEXT DEFAULT 'local'"))
                    logger.info("Added storage_type column to documents table")
                
                # Update existing records to have storage_type = 'local'
                conn.execute(text("UPDATE documents SET storage_type = 'local' WHERE storage_type IS NULL"))
                conn.commit()
                
            else:
                # PostgreSQL/MySQL approach
                try:
                    conn.execute(text("ALTER TABLE documents ADD COLUMN s3_key TEXT"))
                    logger.info("Added s3_key column to documents table")
                except Exception as e:
                    if "already exists" in str(e).lower():
                        logger.info("s3_key column already exists")
                    else:
                        raise
                
                try:
                    conn.execute(text("ALTER TABLE documents ADD COLUMN storage_type TEXT DEFAULT 'local'"))
                    logger.info("Added storage_type column to documents table")
                except Exception as e:
                    if "already exists" in str(e).lower():
                        logger.info("storage_type column already exists")
                    else:
                        raise
                
                # Update existing records
                conn.execute(text("UPDATE documents SET storage_type = 'local' WHERE storage_type IS NULL"))
                conn.commit()
        
        logger.info("Migration completed successfully")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    migrate_documents_table()