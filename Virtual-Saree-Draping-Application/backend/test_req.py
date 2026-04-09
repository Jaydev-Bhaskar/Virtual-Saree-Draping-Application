import urllib.request, urllib.error, json

req = urllib.request.Request(
    'http://192.168.1.2:10000/api/v1/auth/signup', 
    data=json.dumps({'username':'testusr2', 'email':'test2@t.com', 'password':'password123', 'full_name':'Test User'}).encode('utf-8'), 
    headers={'Content-Type': 'application/json'}
)

try: 
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e: 
    print('ERROR:', e.code, e.read().decode())
