from celery import Celery
from celery.schedules import crontab
import os
from dotenv import load_dotenv

load_dotenv()

app = Celery(
    'markethub',
    broker=os.getenv('CELERY_BROKER_URL', 'amqp://admin:admin123@rabbitmq:5672'),
    backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://redis:6379/0'),
    include=['tasks.price_tracker', 'tasks.analytics']
)

app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
)

app.conf.beat_schedule = {
    'check-prices-every-hour': {
        'task': 'tasks.price_tracker.check_all_prices',
        'schedule': crontab(minute=0),
    },
    'generate-analytics-daily': {
        'task': 'tasks.analytics.generate_daily_analytics',
        'schedule': crontab(hour=0, minute=0),
    },
    'cleanup-old-data': {
        'task': 'tasks.analytics.cleanup_old_data',
        'schedule': crontab(hour=2, minute=0, day_of_week=0),
    },
}

if __name__ == '__main__':
    app.start()