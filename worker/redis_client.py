"""
Redis Client Module
Connects to Redis and provides BullMQ-compatible job consumption.

BullMQ stores jobs in Redis with this structure:
  - bull:<queue>:wait   → List of job IDs waiting to be processed
  - bull:<queue>:active → List of job IDs currently being processed
  - bull:<queue>:<id>   → Hash containing job data, name, opts, etc.

This module pops job IDs from the wait list, fetches the job payload
from the corresponding hash, and cleans up after processing.
"""

import json
import redis
from dotenv import load_dotenv
import os

load_dotenv()

# BullMQ key prefix for the task-processing queue
QUEUE_PREFIX = "bull:task-processing"


def create_redis_connection():
    """
    Create and return a Redis connection using environment variables.
    Raises an exception if the connection cannot be established.
    """
    host = os.getenv("REDIS_HOST", "localhost")
    port = int(os.getenv("REDIS_PORT", 6379))

    client = redis.Redis(
        host=host,
        port=port,
        decode_responses=True,  # Return strings instead of bytes
        socket_connect_timeout=5,
        retry_on_timeout=True,
    )

    # Verify the connection is alive
    client.ping()
    print(f"[Worker] ✅ Connected to Redis at {host}:{port}")

    return client


def wait_for_job(client, timeout=5):
    """
    Block until a job appears in the BullMQ wait list, then atomically
    move it to the active list and return the parsed job payload.

    Uses BRPOPLPUSH for atomic pop-and-push (prevents job loss if
    the worker crashes between pop and push).

    Args:
        client:  Active Redis connection.
        timeout: Seconds to block before returning None.

    Returns:
        dict with {"id": str, "data": dict} on success, or None on timeout.
    """
    # Atomically pop from wait → push to active
    job_id = client.brpoplpush(
        f"{QUEUE_PREFIX}:wait",
        f"{QUEUE_PREFIX}:active",
        timeout=timeout,
    )

    if job_id is None:
        return None

    # Fetch the job hash stored by BullMQ
    raw_data = client.hget(f"{QUEUE_PREFIX}:{job_id}", "data")

    if raw_data is None:
        # Job hash missing (possibly cleaned up) — remove from active and skip
        client.lrem(f"{QUEUE_PREFIX}:active", 1, job_id)
        return None

    try:
        payload = json.loads(raw_data)
    except json.JSONDecodeError:
        # Corrupt job data — remove from active and skip
        client.lrem(f"{QUEUE_PREFIX}:active", 1, job_id)
        print(f"[Worker] ⚠️  Skipping job {job_id}: corrupt JSON payload")
        return None

    return {"id": job_id, "data": payload}


def complete_job(client, job_id):
    """
    Mark a job as completed by removing it from the active list
    and cleaning up the job hash in Redis.
    """
    client.lrem(f"{QUEUE_PREFIX}:active", 1, job_id)
    client.delete(f"{QUEUE_PREFIX}:{job_id}")


def fail_job(client, job_id):
    """
    Mark a job as failed by removing it from the active list
    and cleaning up the job hash in Redis.
    """
    client.lrem(f"{QUEUE_PREFIX}:active", 1, job_id)
    client.delete(f"{QUEUE_PREFIX}:{job_id}")
