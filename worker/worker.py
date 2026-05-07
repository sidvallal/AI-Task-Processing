"""
Python Worker Service
Continuously listens to the BullMQ Redis queue "task-processing",
processes text operations, and updates results in MongoDB.

Flow for each job:
  1. Pop job from Redis wait list → move to active list
  2. Parse job payload (taskId, inputText, operation)
  3. Update MongoDB task status → "running"
  4. Process the text operation
  5. Store result and logs in MongoDB
  6. Update MongoDB task status → "success" (or "failed" on error)
  7. Clean up job from Redis

Usage:
  python worker.py
"""

import time
import sys
from redis_client import create_redis_connection, wait_for_job, complete_job, fail_job
from mongo_client import (
    create_mongo_connection,
    update_task_status,
    add_task_log,
    complete_task,
    fail_task,
)
from processor import process_task


def process_single_job(redis_client, db, job):
    """
    Process a single job from the queue.

    Args:
        redis_client: Active Redis connection.
        db:           MongoDB database instance.
        job:          Dict with {"id": str, "data": dict}.
    """
    job_id = job["id"]
    data = job["data"]

    task_id = str(data.get("taskId"))
    input_text = data.get("inputText", "")
    operation = data.get("operation", "")

    print(f"[Worker] 🔄 Processing task: {task_id} (operation: {operation})")

    try:
        # Step 1: Mark task as running in MongoDB
        update_task_status(db, task_id, "running")
        add_task_log(db, task_id, "Task processing started")

        # Step 2: Execute the text operation
        result, operation_log = process_task(input_text, operation)
        add_task_log(db, task_id, operation_log)

        # Step 3: Store result and mark as success (atomic update)
        complete_task(db, task_id, result, "Task completed successfully")

        # Step 4: Clean up the job from Redis
        complete_job(redis_client, job_id)

        print(f"[Worker] ✅ Task {task_id} completed — result: {result}")

    except Exception as e:
        # Mark task as failed in MongoDB with error details
        fail_task(db, task_id, str(e))

        # Clean up the job from Redis
        fail_job(redis_client, job_id)

        print(f"[Worker] ❌ Task {task_id} failed — {str(e)}")


def main():
    """
    Main worker loop.
    Connects to Redis and MongoDB, then continuously polls the
    BullMQ queue for new jobs.
    """
    print("[Worker] 🚀 Starting Python Worker Service...")
    print("=" * 50)

    # --- Establish Connections ---
    try:
        redis_client = create_redis_connection()
    except Exception as e:
        print(f"[Worker] ❌ Failed to connect to Redis: {e}")
        sys.exit(1)

    try:
        db = create_mongo_connection()
    except Exception as e:
        print(f"[Worker] ❌ Failed to connect to MongoDB: {e}")
        sys.exit(1)

    print("=" * 50)
    print("[Worker] 👂 Listening for jobs on queue: task-processing")
    print("[Worker] Press Ctrl+C to stop\n")

    # --- Main Processing Loop ---
    try:
        while True:
            # Block for up to 5 seconds waiting for a job
            job = wait_for_job(redis_client, timeout=5)

            if job is None:
                # No job available — continue polling
                continue

            process_single_job(redis_client, db, job)

    except KeyboardInterrupt:
        print("\n[Worker] 🛑 Shutting down gracefully...")
    except Exception as e:
        print(f"\n[Worker] ❌ Unexpected error: {e}")
        # Brief pause before the process exits to allow logs to flush
        time.sleep(1)
        sys.exit(1)


if __name__ == "__main__":
    main()
