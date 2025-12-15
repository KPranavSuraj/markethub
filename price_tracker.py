from celery_app import app
from pymongo import MongoClient
import requests
import random
from datetime import datetime
import os

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://admin:admin123@mongodb:27017/markethub?authSource=admin')

def get_db():
    client = MongoClient(MONGODB_URI)
    return client['markethub']

@app.task(name='tasks.price_tracker.check_all_prices')
def check_all_prices():
    """Check prices for all active products"""
    try:
        db = get_db()
        products = db.products.find({'isActive': True})
        
        checked_count = 0
        updated_count = 0
        
        for product in products:
            try:
                result = check_single_price.delay(str(product['_id']))
                checked_count += 1
            except Exception as e:
                print(f"Error checking product {product['_id']}: {str(e)}")
        
        print(f"Price check task completed. Checked: {checked_count} products")
        return {
            'status': 'completed',
            'checked': checked_count,
            'timestamp': datetime.utcnow().isoformat()
        }
    except Exception as e:
        print(f"Error in check_all_prices: {str(e)}")
        return {'status': 'error', 'message': str(e)}

@app.task(name='tasks.price_tracker.check_single_price')
def check_single_price(product_id):
    """Check price for a single product"""
    try:
        from bson import ObjectId
        db = get_db()
        
        product = db.products.find_one({'_id': ObjectId(product_id)})
        if not product:
            return {'status': 'not_found'}
        
        # Simulate price scraping (replace with actual scraping logic)
        new_price = round(random.uniform(50, 200), 2)
        
        # Update product
        db.products.update_one(
            {'_id': ObjectId(product_id)},
            {
                '$set': {
                    'currentPrice': new_price,
                    'lastChecked': datetime.utcnow()
                },
                '$push': {
                    'priceHistory': {
                        'price': new_price,
                        'date': datetime.utcnow()
                    }
                },
                '$inc': {
                    'metadata.priceChecks': 1
                }
            }
        )
        
        # Check if price alert should be triggered
        if product.get('targetPrice') and new_price <= product['targetPrice']:
            trigger_price_alert.delay(product_id, new_price)
        
        return {
            'status': 'success',
            'product_id': product_id,
            'new_price': new_price,
            'old_price': product.get('currentPrice', 0)
        }
    except Exception as e:
        print(f"Error checking price for {product_id}: {str(e)}")
        return {'status': 'error', 'message': str(e)}

@app.task(name='tasks.price_tracker.trigger_price_alert')
def trigger_price_alert(product_id, current_price):
    """Trigger alert when target price is reached"""
    try:
        from bson import ObjectId
        db = get_db()
        
        product = db.products.find_one({'_id': ObjectId(product_id)})
        if not product:
            return {'status': 'not_found'}
        
        print(f"🎯 PRICE ALERT: {product['name']} reached target price!")
        print(f"   Current: ${current_price}, Target: ${product['targetPrice']}")
        
        # Here you would send email/notification to user
        # For now, just log it
        
        return {
            'status': 'alert_triggered',
            'product': product['name'],
            'current_price': current_price,
            'target_price': product['targetPrice']
        }
    except Exception as e:
        print(f"Error triggering alert: {str(e)}")
        return {'status': 'error', 'message': str(e)}