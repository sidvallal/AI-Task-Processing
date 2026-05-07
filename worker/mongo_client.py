"""
MongoDB Client Module
Connects to MongoDB and provides helper functions to update task documents.

The tasks collection is managed by the Express backend (Mongoose).
This module only UPDATES existing documents — it never creates them.
"""

from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import os

load_dotenv()


def create_mongo_connection():
    """
    Create and return a MongoDB database connection using the MONGO_URI
    environment variable. The database name is extracted from the URI.
    """
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/ai_task_platform")

    client = MongoClient(uri, serverSelectionTimeoutMS=5000)

    # Force a connection attempt to verify connectivity
    client.admin.command("ping")

    # Extract the database name from the URI (last path segment)
    db_name = uri.rsplit("/", 1)[-1].split("?")[0]
    db = client[db_name]

    print(f"[Worker] ✅ Connected to MongoDB (database: {db_name})")

    return db


def update_task_status(db, task_id, status):
    """
    Update the status field of a task document.

    Args:
        db:      MongoDB database instance.
        task_id: Task ObjectId as a string.
        status:  New status value ('running', 'success', 'failed').
    """
    db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": status}},
    )


def add_task_log(db, task_id, log_message):
    """
    Append a log entry to the task's logs array.

    Args:
        db:          MongoDB database instance.
        task_id:     Task ObjectId as a string.
        log_message: String message to append.
    """
    db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$push": {"logs": log_message}},
    )


def store_task_result(db, task_id, result):
    """
    Store the processing result in the task document.

    Args:
        db:      MongoDB database instance.
        task_id: Task ObjectId as a string.
        result:  The processed output string.
    """
    db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"result": result}},
    )


def complete_task(db, task_id, result, final_log):
    """
    Atomically set the result, status, and append a final log entry.
    Uses a single update operation for efficiency and consistency.

    Args:
        db:        MongoDB database instance.
        task_id:   Task ObjectId as a string.
        result:    The processed output string.
        final_log: Final log message (e.g., "Task completed successfully").
    """
    db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {
            "$set": {"status": "success", "result": result},
            "$push": {"logs": final_log},
        },
    )


def fail_task(db, task_id, error_message):
    """
    Mark a task as failed and log the error message.
    Uses a single update operation for consistency.

    Args:
        db:            MongoDB database instance.
        task_id:       Task ObjectId as a string.
        error_message: Error description to log.
    """
    db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {
            "$set": {"status": "failed"},
            "$push": {"logs": f"Error: {error_message}"},
        },
    )
