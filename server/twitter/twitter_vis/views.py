from datetime import date
import json
import psycopg2

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

def index(request):
    return HttpResponse(json.dumps('hello world!'))



@csrf_exempt
def tweets_states(request):
    SQL = """select s.name as name, 
                    s.abbreviation as abbreviation,
                    s.statefp as statefp, 
                    s.latitude as latitude, 
                    s.longitude as longitude, 
                    count(*) as num_tweet, 
                    avg(t.sentiment) as avg_sentiment 
            from tweet as t 
                join county as c on t.county_fips = c.county_fips
                join state as s on c.statefp = s.statefp 
                group by (s.name, s.abbreviation, s.statefp, s.latitude, s.longitude);"""
    ret = []
    with psycopg2.connect(database=settings.DATABASES['default']['NAME'], user=settings.DATABASES['default']['USER']) as conn:
        with conn.cursor() as cur:
            cur.execute(SQL)
            for i in cur.fetchall():
                ret.append([i[0],i[1],i[2],float(i[3]),float(i[4]),int(i[5]),float(i[6])])

    return HttpResponse(json.dumps(ret))

