from celery_app import app
from pymongo import MongoClient
from datetime import datetime, timedelta
import os

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://admin:admin123@mongodb:27017/markethub?authSource=admin')

def get_db():
    client = MongoClient(MONGODB_URI)
    return client['markethub']

@app.task(name='tasks.analytics.generate_daily_analytics')
def generate_daily_analytics():
    """Generate daily analytics summary"""
    try:
        db = get_db()
        
        # Calculate statistics
        total_products = db.products.count_documents({})
        active_products = db.products.count_documents({'isActive': True})
        
        # Calculate average price
        pipeline = [
            {'$group': {
                '_id': None,
                'avgPrice': {'$avg': '$currentPrice'},
                'minPrice': {'$min': '$currentPrice'},
                'maxPrice': {'$max': '$currentPrice'}
            }}
        ]
        
        result = list(db.products.aggregate(pipeline))
        stats = result[0] if result else {}
        
        analytics_data = {
            'date': datetime.utcnow(),
            'total_products': total_products,
            'active_products': active_products,
            'avg_price': round(stats.get('avgPrice', 0), 2),
            'min_price': round(stats.get('minPrice', 0), 2),
            'max_price': round(stats.get('maxPrice', 0), 2),
            'generated_at': datetime.utcnow()
        }
        
        # Store analytics
        db.daily_analytics.insert_one(analytics_data)
        
        print(f"📊 Daily analytics generated: {analytics_data}")
        return {'status': 'success', 'data': analytics_data}
    except Exception as e:
        print(f"Error generating analytics: {str(e)}")
        return {'status': 'error', 'message': str(e)}

@app.task(name='tasks.analytics.cleanup_old_data')
def cleanup_old_data():
    """Clean up old price history data"""
    try:
        db = get_db()
        
        # Remove price history older than 90 days
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        
        result = db.products.update_many(
            {},
            {
                '$pull': {
                    'priceHistory': {
                        'date': {'$lt': cutoff_date}
                    }
                }
            }
        )
        
        # Remove old analytics
        db.daily_analytics.delete_many({'date': {'$lt': cutoff_date}})
        
        print(f"🧹 Cleanup completed. Modified {result.modified_count} products")
        return {
            'status': 'success',
            'modified_products': result.modified_count,
            'cutoff_date': cutoff_date.isoformat()
        }
    except Exception as e:
        print(f"Error cleaning up data: {str(e)}")
        return {'status': 'error', 'message': str(e)}

@app.task(name='tasks.analytics.aggregate_platform_stats')
def aggregate_platform_stats():
    """Aggregate statistics by platform"""
    try:
        db = get_db()
        
        pipeline = [
            {'$group': {
                '_id': '$platform',
                'count': {'$sum': 1},
                'avgPrice': {'$avg': '$currentPrice'},
                'minPrice': {'$min': '$currentPrice'},
                'maxPrice': {'$max': '$currentPrice'}
            }},
            {'$sort': {'count': -1}}
        ]
        
        stats = list(db.products.aggregate(pipeline))
        
        print(f"📈 Platform statistics generated: {len(stats)} platforms")
        return {'status': 'success', 'stats': stats}
    except Exception as e:
        print(f"Error aggregating platform stats: {str(e)}")
        return {'status': 'error', 'message': str(e)}