
# Facebook Messenger Chatbot Demo 

#### 1. Create Facebook Messenger App And Page

> [Facebook Messenger Docs](https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start)

#### 2. Set Up Heroku Node Server

> [Heroku](https://devcenter.heroku.com/)

    $ cd /your_chatbot
    
    > On Heroku CLI
    
    $ heroku create
        
    $ heroku config:set APP_URL='https://{URL_TO_HEROKU_APP}'
        
    $ heroku config:set WEBHOOK_TOKEN='your_token']
        
    $ heroku config:set PAGE_ACCESS_TOKEN='your_page_access_token'
    
### 3. Deploy
    
    $ git push heroku master


