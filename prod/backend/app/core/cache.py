import time

CACHE = {}

def cache_get(key):
    item = CACHE.get(key)
    if not item:
        return None

    value, expires = item

    if time.time() > expires:
        del CACHE[key]
        return None

    return value

def cache_set(key, value, ttl=600):
    CACHE[key] = (value, time.time() + ttl)
