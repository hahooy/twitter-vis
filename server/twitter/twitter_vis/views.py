from collections import Counter
from datetime import date
import json
import psycopg2

from nltk.corpus import stopwords

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

stopWordsEn = stopwords.words("english")

def index(request):
    return HttpResponse(json.dumps('hello world!'))

@csrf_exempt
def tweets_summary(request):
    ret = {}

    with psycopg2.connect(host=settings.DATABASES['default']['HOST'], database=settings.DATABASES['default']['NAME'], user=settings.DATABASES['default']['USER'], password=settings.DATABASES['default']['PASSWORD']) as conn:
        with conn.cursor() as cur:
            SQL = "select count(*) from tweet_has_hashtag;"
            cur.execute(SQL)
            ret['num_tweets'] = cur.fetchone()[0]
            SQL = "select count(*) from hashtag;"
            cur.execute(SQL)
            ret['num_hashtags'] = cur.fetchone()[0]
            SQL = "select publish_date, count(*) from tweet group by publish_date;"
            cur.execute(SQL)
            ret['tweet_timeline'] = []
            for i in cur.fetchall():
                ret['tweet_timeline'].append({'date':i[0].strftime('%Y-%m-%d'), 'count':i[1]})
    return HttpResponse(json.dumps(ret))    

@csrf_exempt
def tweets_states(request):
    hashtag = request.GET.get('hashtag')
    d = request.GET.get('date')

    if hashtag is not None and d is not None:
        SQL = """
            with filtered_tweet as (
                select t.* from tweet as t join tweet_has_hashtag as thh on t.id = thh.id
                where thh.hashtag = %s and t.publish_date = %s
            )
            select s.name as name, 
                    s.abbreviation as abbreviation,
                    s.statefp as statefp, 
                    s.latitude as latitude, 
                    s.longitude as longitude, 
                    count(*) as num_tweet,
                    sum(case when t.sentiment = 0 then 1 else 0 end) as num_neg_tweet,
                    sum(case when t.sentiment = 2 then 1 else 0 end) as num_neu_tweet,
                    sum(case when t.sentiment = 4 then 1 else 0 end) as num_pos_tweet,                    
                    avg(t.sentiment) as avg_sentiment,
                    string_agg(hashtag, ' ') as hashtags  
            from filtered_tweet as t 
                join county as c on t.county_fips = c.county_fips
                join state as s on c.statefp = s.statefp
                join tweet_has_hashtag as thh on t.id = thh.id
                group by (s.name, s.abbreviation, s.statefp, s.latitude, s.longitude);"""
        params = [hashtag, d]
    elif hashtag is not None:
        SQL = """
            with filtered_tweet as (
                select t.* from tweet as t join tweet_has_hashtag as thh on t.id = thh.id
                where thh.hashtag = %s
            )
            select s.name as name, 
                    s.abbreviation as abbreviation,
                    s.statefp as statefp, 
                    s.latitude as latitude, 
                    s.longitude as longitude, 
                    count(*) as num_tweet,
                    sum(case when t.sentiment = 0 then 1 else 0 end) as num_neg_tweet,
                    sum(case when t.sentiment = 2 then 1 else 0 end) as num_neu_tweet,
                    sum(case when t.sentiment = 4 then 1 else 0 end) as num_pos_tweet,                    
                    avg(t.sentiment) as avg_sentiment,
                    string_agg(hashtag, ' ') as hashtags 
            from filtered_tweet as t 
                join county as c on t.county_fips = c.county_fips
                join state as s on c.statefp = s.statefp
                join tweet_has_hashtag as thh on t.id = thh.id
                group by (s.name, s.abbreviation, s.statefp, s.latitude, s.longitude);"""
        params = [hashtag]
    elif d is not None:
        SQL = """
            with filtered_tweet as (
                select t.* from tweet as t join tweet_has_hashtag as thh on t.id = thh.id
                where t.publish_date = %s
            )
            select s.name as name, 
                    s.abbreviation as abbreviation,
                    s.statefp as statefp, 
                    s.latitude as latitude, 
                    s.longitude as longitude, 
                    count(*) as num_tweet,
                    sum(case when t.sentiment = 0 then 1 else 0 end) as num_neg_tweet,
                    sum(case when t.sentiment = 2 then 1 else 0 end) as num_neu_tweet,
                    sum(case when t.sentiment = 4 then 1 else 0 end) as num_pos_tweet,                    
                    avg(t.sentiment) as avg_sentiment,
                    string_agg(hashtag, ' ') as hashtags
            from filtered_tweet as t 
                join county as c on t.county_fips = c.county_fips
                join state as s on c.statefp = s.statefp
                join tweet_has_hashtag as thh on t.id = thh.id
                group by (s.name, s.abbreviation, s.statefp, s.latitude, s.longitude);"""
        params = [d]
    else:
        SQL = """select s.name as name, 
                        s.abbreviation as abbreviation,
                        s.statefp as statefp, 
                        s.latitude as latitude, 
                        s.longitude as longitude, 
                        count(*) as num_tweet,
                        sum(case when t.sentiment = 0 then 1 else 0 end) as num_neg_tweet,
                        sum(case when t.sentiment = 2 then 1 else 0 end) as num_neu_tweet,
                        sum(case when t.sentiment = 4 then 1 else 0 end) as num_pos_tweet,                    
                        avg(t.sentiment) as avg_sentiment,
                        string_agg(hashtag, ' ') as hashtags
                from tweet as t 
                    join county as c on t.county_fips = c.county_fips
                    join state as s on c.statefp = s.statefp
                    join tweet_has_hashtag as thh on t.id = thh.id
                    group by (s.name, s.abbreviation, s.statefp, s.latitude, s.longitude);"""
        params = []
    ret = []
    with psycopg2.connect(host=settings.DATABASES['default']['HOST'], database=settings.DATABASES['default']['NAME'], user=settings.DATABASES['default']['USER'], password=settings.DATABASES['default']['PASSWORD']) as conn:
        with conn.cursor() as cur:
            print params
            cur.execute(SQL, params)
            for i in cur.fetchall():
                ret.append({'name':i[0],
                            'abbreviation':i[1],
                            'statefp':i[2],
                            'latitude':float(i[3]),
                            'longitude':float(i[4]),
                            'total_num_tweet':int(i[5]),
                            'total_neg_tweet':int(i[6]),
                            'total_neu_tweet':int(i[7]),
                            'total_pos_tweet':int(i[8]),                                                                                    
                            'avg_sentiment':float(i[9]),
                            'hashtags':[{'text': i[0], 'size': i[1]} for i in Counter(i[10].split()).most_common()[:20]]})

    return HttpResponse(json.dumps(ret))

