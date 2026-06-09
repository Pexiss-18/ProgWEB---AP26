from unittest.mock import MagicMock, patch
import pytest
from sqlalchemy.orm import Session
from app.database import get_db

def test_get_db_yields_session_and_closes():
    # Mock SessionLocal to return a mock session
    with patch("app.infrastructure.database.SessionLocal") as mock_session_local:
        mock_session = MagicMock(spec=Session)
        mock_session_local.return_value = mock_session
        
        # get_db is a generator
        db_gen = get_db()
        db = next(db_gen)
        
        # Verify it yielded the session
        assert db == mock_session
        
        # Finish the generator scope
        try:
            next(db_gen)
        except StopIteration:
            pass
            
        # Verify the session was closed
        mock_session.close.assert_called_once()

def test_database_components_exist():
    from app.database import engine, SessionLocal, Base
    assert engine is not None
    assert SessionLocal is not None
    assert issubclass(Base, object)
