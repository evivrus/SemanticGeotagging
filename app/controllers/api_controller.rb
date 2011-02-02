class ApiController < ApplicationController
#  before_filter :require_http_auth_user

  #return 10 most recent entities to a certain user
  #the id of certain user is store in the session[:current_user_id]
  def get_recent_entities
    user = User.find(session[:current_user_id])
    user_latest_accessed_entity_at = user.current_entity_time

    @entities = Entity.find :all,
#      :conditions => " created_at > 2010-10-08T07:59:46Z", :limit=>10
      :conditions => [" created_at > ? ", user_latest_accessed_entity_at]
#http://localhost:3000/entities_api/get_recent_entities.json?time=%222010-10-08T07:59:46Z%22

    session[:current_user_id] = nil

    respond_to do |format|
      format.xml  { render :xml => @entities }
      format.json { render :json => @entities }
    end
  end

  def get_comments_by_entity_and_category
    category_id = CommentCategory.find_by_name params[:category]
    comments = Comment.find_all_by_entity_id_and_category_id 1,1# params[:entity_id], category_id

    json_array = []
    comments.each do |comment|
        user = User.find comment.user_id
        json_array << {:comment=>{:created_at=>"#{comment.created_at}",:image_url=>"#{comment.image_url}",
            :username=>"#{user.login}", :user_image=>"#{user.user_image}", :description=>"#{comment.description}",
            :comment_id=>comment.id}}
    end

    json_string = ActiveSupport::JSON.encode(json_array)

    respond_to do |format|
      format.json { render :json => json_string }
    end
  end

  def get_comments_by_comment_id
    comments = Comment.find_all_by_comment_id_and_type

    json_array = []
    comments.each do |comment|
        user = User.find comment.user_id
        json_array << {:comment=>{:created_at=>"#{comment.created_at}",:image_url=>"#{comment.image_url}",
            :username=>"#{user.login}", :user_image=>"#{user.user_image}", :description=>"#{comment.description}",
            :comment_id=>comment.id}}
    end

    json_string = ActiveSupport::JSON.encode(json_array)

    respond_to do |format|
      format.json { render :json => json_string }
    end
  end


  #new defined api
  #Resource: Get list of entities
  #Method: Get
  #Url: http://geotagging.heroku.com/api/entities.[json|xml]
  #Parameters:
  #count (optonal) the number of entities return by the request. default 20
  #
  #	e.g. http://geotagging.heroku.com/api/entities.json?count=10
  #since_id (optional) return the entities that have id larger than this number
  #
  #	e.g. http://geotagging.heroku.com/api/entities.json?since_id=29332
  #max_id (optional) return the entities that have id smaller than this number
  def get_entities
    count = 20
    count = params[:count] if params[:count]
    since_id = params[:since_id] if params[:since_id]
#    max_id = params[:max_id] unless params[:max_id]
    if since_id.nil?
      @entities = Entity.find :all, :limit=>count
    else
      @entities = Entity.find :all,
        :conditions => [" id > ? ", since_id], :limit=>count
    end
    
    respond_to do |format|
      format.xml  { render :xml => @entities }
      format.json { render :json => @entities }
    end
  end

  #Resource: Get list of comments for an entity
  #Method: Get
  #Url: http://geotagging.heroku.com/api/comments.[json|xml]
  #Parameters:
  #entity_id (require)
  #category (require)
  #
  #e.g.http://geotagging.heroku.com/api/comments.json?entity_id=2343&category=”Request for Help”
  #count (optonal) the number of entities return by the request. default 20
  #since_id
  #max_id
  def get_comments
    count = 20
    count = params[:count] if params[:count]
    since_id = params[:since_id] if params[:since_id]
#    max_id = params[:max_id] unless params[:max_id]
    if since_id.nil?
      @comments = Comment.find :all,
        :conditions=>["comment_id = -1"],
        :limit=>count
    else
      @comments = Comment.find :all,
        :conditions => [" id > ? and comment_id = -1", since_id], :limit=>count
    end

    respond_to do |format|
      format.xml  { render :xml => @comments }
      format.json { render :json => @comments }
    end
  end

  def get_comment_categories
    @categories = CommentCategory.all

    respond_to do |format|
      format.xml  { render :xml => @categories }
      format.json { render :json => @categories }
    end
  end

  #Resource: Get list of responses for a comment
  #Method: Get
  #Url: http://geotagging.heroku.com/api/responses.[json|xml]
  #Parameters:
  #comment_id (require)
  #category (require)
  #e.g. http://geotagging.heroku.com/api/responses.json?comment_id=2343&category=”Big Picture”
  #count (optonal) the number of entities return by the request. default 20
  #since_id
  #max_id
  def get_responses
    count = 20
    count = params[:count] if params[:count]

    comment_id = params[:comment_id]

    since_id = params[:since_id] if params[:since_id]
#    max_id = params[:max_id] unless params[:max_id]
    if since_id.nil?
      @responses = Comment.find :all,
        :conditions => ["comment_id = ?", comment_id],
        :limit=>count
    else
      @responses = Comment.find :all,
        :conditions => [" id > ? and comment_id = ?", since_id, comment_id],
        :limit=>count
    end

    respond_to do |format|
      format.xml  { render :xml => @responses }
      format.json { render :json => @responses }
    end
  end

  def get_response_categories
    @categories = ResponseCategory.all

    respond_to do |format|
      format.xml  { render :xml => @categories }
      format.json { render :json => @categories }
    end
  end

  def create_entity
    @entity = Entity.new(params[:entity])

    respond_to do |format|
      if @entity.save
        format.xml  { render :xml => @entity, :status => :created, :location => @entity }
        format.json { render :json => @entity, :status => :created, :location => @entity }
      else
        format.xml  { render :xml => @entity.errors, :status => :unprocessable_entity }
        format.json { render :json => @entity.errors, :status => :unprocessable_entity }
      end
    end
  end

  def create_comment
    @comment = Comment.new(params[:comment])

    respond_to do |format|
      if @comment.save
        format.json { render :json => @comment, :status => :created, :location => @comment }
        format.xml  { render :xml => @comment, :status => :created, :location => @comment }
      else
        format.json { render :json => @comment.errors, :status => :unprocessable_entity }
        format.xml  { render :xml => @comment.errors, :status => :unprocessable_entity }
      end
    end
  end

  #Generate georss stuff
  def georss
    rss = %{<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#"
      xmlns:georss="http://www.georss.org/georss"
      xmlns:woe="http://where.yahooapis.com/v1/schema.rng"
      xmlns:flickr="urn:flickr:"
      xmlns:media="http://search.yahoo.com/mrss/">

  <title>The faulkner_usa Pool, with geodata</title>
  <link rel="self" href="http://api.flickr.com/services/feeds/geo/?g=322338@N20&amp;lang=en-us&amp;format=feed-georss" />
  <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/"/>
  <id>tag:flickr.com,2005:/photos/public/group/322338@N20/geo/</id>
  <icon>http://l.yimg.com/g/images/buddyicon.jpg#322338@N20</icon>
  <subtitle>Pictures of my dog in a variety of locations</subtitle>
  <updated>2006-08-29T15:42:35Z</updated>
  <generator uri="http://www.flickr.com/">Flickr</generator>

  <entry>
    <title>Manhattan, NY</title>
    <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/shreck/228310988/"/>
    <id>tag:flickr.com,2005:/photo/228310988</id>
    <published>2006-08-29T15:42:35Z</published>
    <updated>2006-08-29T15:42:35Z</updated>
    <dc:date.Taken>2005-10-02T17:35:35-08:00</dc:date.Taken>
    <content type="html">			&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/people/shreck/&quot;&gt;manshreck&lt;/a&gt; posted a photo:&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/photos/shreck/228310988/&quot; title=&quot;Manhattan, NY&quot;&gt;&lt;img src=&quot;http://farm1.static.flickr.com/74/228310988_33a56d0108_m.jpg&quot; width=&quot;240&quot; height=&quot;179&quot; alt=&quot;Manhattan, NY&quot; /&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Faulkner rests after the journey ends, Midtown Manhattan&lt;/p&gt;</content>
    <author>
      <name>manshreck</name>
      <uri>http://www.flickr.com/people/shreck/</uri>
      <flickr:nsid>51296622@N00</flickr:nsid>
      <flickr:buddyicon>http://farm1.static.flickr.com/29/buddyicons/51296622@N00.jpg?1130103303#51296622@N00</flickr:buddyicon>
    </author>
    <link rel="enclosure" type="image/jpeg" href="http://farm1.static.flickr.com/74/228310988_33a56d0108_o.jpg" />
    <georss:point>40.746029 -73.979165</georss:point>
    <geo:lat>40.746029</geo:lat>
    <geo:long>-73.979165</geo:long>
    <woe:woeid>23511899</woe:woeid>
  </entry>

  <entry>
    <title>Hoover Dam, AZ</title>
    <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/shreck/228310097/"/>
    <id>tag:flickr.com,2005:/photo/228310097</id>
    <published>2006-08-29T15:41:19Z</published>
    <updated>2006-08-29T15:41:19Z</updated>
    <dc:date.Taken>2005-08-29T14:38:52-08:00</dc:date.Taken>
    <content type="html">			&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/people/shreck/&quot;&gt;manshreck&lt;/a&gt; posted a photo:&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/photos/shreck/228310097/&quot; title=&quot;Hoover Dam, AZ&quot;&gt;&lt;img src=&quot;http://farm1.static.flickr.com/98/228310097_8202e98ba4_m.jpg&quot; width=&quot;240&quot; height=&quot;179&quot; alt=&quot;Hoover Dam, AZ&quot; /&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Faulkner at Hoover Dam&lt;/p&gt;</content>
    <author>
      <name>manshreck</name>
      <uri>http://www.flickr.com/people/shreck/</uri>
      <flickr:nsid>51296622@N00</flickr:nsid>
      <flickr:buddyicon>http://farm1.static.flickr.com/29/buddyicons/51296622@N00.jpg?1130103303#51296622@N00</flickr:buddyicon>
    </author>
    <link rel="enclosure" type="image/jpeg" href="http://farm1.static.flickr.com/98/228310097_8202e98ba4_o.jpg" />
    <georss:point>36.015851 -114.734086</georss:point>
    <geo:lat>36.015851</geo:lat>
    <geo:long>-114.734086</geo:long>
    <woe:woeid>12589233</woe:woeid>
  </entry>

  <entry>
    <title>Los Angeles, CA</title>
    <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/shreck/228310017/"/>
    <id>tag:flickr.com,2005:/photo/228310017</id>
    <published>2006-08-29T15:41:12Z</published>
    <updated>2006-08-29T15:41:12Z</updated>
    <dc:date.Taken>2005-08-26T12:01:46-08:00</dc:date.Taken>
    <content type="html">			&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/people/shreck/&quot;&gt;manshreck&lt;/a&gt; posted a photo:&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/photos/shreck/228310017/&quot; title=&quot;Los Angeles, CA&quot;&gt;&lt;img src=&quot;http://farm1.static.flickr.com/95/228310017_59aa7fb709_m.jpg&quot; width=&quot;240&quot; height=&quot;179&quot; alt=&quot;Los Angeles, CA&quot; /&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Faulkner at Echo Lake, Los Angeles. I slept in the car that morning.&lt;/p&gt;</content>
    <author>
      <name>manshreck</name>
      <uri>http://www.flickr.com/people/shreck/</uri>
      <flickr:nsid>51296622@N00</flickr:nsid>
      <flickr:buddyicon>http://farm1.static.flickr.com/29/buddyicons/51296622@N00.jpg?1130103303#51296622@N00</flickr:buddyicon>
    </author>
    <link rel="enclosure" type="image/jpeg" href="http://farm1.static.flickr.com/95/228310017_59aa7fb709_o.jpg" />
    <georss:point>34.074381 -118.259367</georss:point>
    <geo:lat>34.074381</geo:lat>
    <geo:long>-118.259367</geo:long>
    <woe:woeid>2442047</woe:woeid>
  </entry>

  <entry>
    <title>Yosemite National Park, CA</title>
    <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/shreck/102826599/"/>
    <id>tag:flickr.com,2005:/photo/102826599</id>
    <published>2006-02-22T01:32:47Z</published>
    <updated>2006-02-22T01:32:47Z</updated>
    <dc:date.Taken>2005-08-23T18:54:55-08:00</dc:date.Taken>
    <content type="html">			&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/people/shreck/&quot;&gt;manshreck&lt;/a&gt; posted a photo:&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/photos/shreck/102826599/&quot; title=&quot;Yosemite National Park, CA&quot;&gt;&lt;img src=&quot;http://farm1.static.flickr.com/36/102826599_48c478a390_m.jpg&quot; width=&quot;240&quot; height=&quot;180&quot; alt=&quot;Yosemite National Park, CA&quot; /&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;John Muir Point, Yosemite National Park&lt;/p&gt;</content>
    <author>
      <name>manshreck</name>
      <uri>http://www.flickr.com/people/shreck/</uri>
      <flickr:nsid>51296622@N00</flickr:nsid>
      <flickr:buddyicon>http://farm1.static.flickr.com/29/buddyicons/51296622@N00.jpg?1130103303#51296622@N00</flickr:buddyicon>
    </author>
    <link rel="enclosure" type="image/jpeg" href="http://farm1.static.flickr.com/36/102826599_48c478a390_o.jpg" />
    <georss:point>37.810597 -119.508504</georss:point>
    <geo:lat>37.810597</geo:lat>
    <geo:long>-119.508504</geo:long>
    <woe:woeid>12587691</woe:woeid>
  </entry>

  <entry>
    <title>Ptarmigan Lake, AK</title>
    <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/shreck/102817499/"/>
    <id>tag:flickr.com,2005:/photo/102817499</id>
    <published>2006-02-22T01:08:21Z</published>
    <updated>2006-02-22T01:08:21Z</updated>
    <dc:date.Taken>2005-06-29T21:52:39-08:00</dc:date.Taken>
    <content type="html">			&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/people/shreck/&quot;&gt;manshreck&lt;/a&gt; posted a photo:&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/photos/shreck/102817499/&quot; title=&quot;Ptarmigan Lake, AK&quot;&gt;&lt;img src=&quot;http://farm1.static.flickr.com/19/102817499_e2132802e0_m.jpg&quot; width=&quot;240&quot; height=&quot;180&quot; alt=&quot;Ptarmigan Lake, AK&quot; /&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Faulkner enjoys a swim&lt;/p&gt;</content>
    <author>
      <name>manshreck</name>
      <uri>http://www.flickr.com/people/shreck/</uri>
      <flickr:nsid>51296622@N00</flickr:nsid>
      <flickr:buddyicon>http://farm1.static.flickr.com/29/buddyicons/51296622@N00.jpg?1130103303#51296622@N00</flickr:buddyicon>
    </author>
    <link rel="enclosure" type="image/jpeg" href="http://farm1.static.flickr.com/19/102817499_e2132802e0_o.jpg" />
    <georss:point>60.396049 -149.26712</georss:point>
    <geo:lat>60.396049</geo:lat>
    <geo:long>-149.26712</geo:long>
    <woe:woeid>23417030</woe:woeid>
  </entry>

  <entry>
    <title>Glacier National Park, MT</title>
    <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/shreck/76405907/"/>
    <id>tag:flickr.com,2005:/photo/76405907</id>
    <published>2005-12-23T00:25:28Z</published>
    <updated>2005-12-23T00:25:28Z</updated>
    <dc:date.Taken>2005-08-04T22:56:52-08:00</dc:date.Taken>
    <content type="html">			&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/people/shreck/&quot;&gt;manshreck&lt;/a&gt; posted a photo:&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/photos/shreck/76405907/&quot; title=&quot;Glacier National Park, MT&quot;&gt;&lt;img src=&quot;http://farm1.static.flickr.com/40/76405907_431f6ba72b_m.jpg&quot; width=&quot;240&quot; height=&quot;180&quot; alt=&quot;Glacier National Park, MT&quot; /&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Faulkner spots a deer&lt;/p&gt;</content>
    <author>
      <name>manshreck</name>
      <uri>http://www.flickr.com/people/shreck/</uri>
      <flickr:nsid>51296622@N00</flickr:nsid>
      <flickr:buddyicon>http://farm1.static.flickr.com/29/buddyicons/51296622@N00.jpg?1130103303#51296622@N00</flickr:buddyicon>
    </author>
    <link rel="enclosure" type="image/jpeg" href="http://farm1.static.flickr.com/40/76405907_431f6ba72b_o.jpg" />
    <georss:point>48.67736 -113.638458</georss:point>
    <geo:lat>48.67736</geo:lat>
    <geo:long>-113.638458</geo:long>
    <woe:woeid>12589098</woe:woeid>
  </entry>

  <entry>
    <title>Banff, AB</title>
    <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/shreck/76405904/"/>
    <id>tag:flickr.com,2005:/photo/76405904</id>
    <published>2005-12-23T00:25:28Z</published>
    <updated>2005-12-23T00:25:28Z</updated>
    <dc:date.Taken>2005-08-01T23:00:37-08:00</dc:date.Taken>
    <content type="html">			&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/people/shreck/&quot;&gt;manshreck&lt;/a&gt; posted a photo:&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/photos/shreck/76405904/&quot; title=&quot;Banff, AB&quot;&gt;&lt;img src=&quot;http://farm1.static.flickr.com/43/76405904_47fe06e727_m.jpg&quot; width=&quot;240&quot; height=&quot;160&quot; alt=&quot;Banff, AB&quot; /&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Looking towards Banff&lt;/p&gt;</content>
    <author>
      <name>manshreck</name>
      <uri>http://www.flickr.com/people/shreck/</uri>
      <flickr:nsid>51296622@N00</flickr:nsid>
      <flickr:buddyicon>http://farm1.static.flickr.com/29/buddyicons/51296622@N00.jpg?1130103303#51296622@N00</flickr:buddyicon>
    </author>
    <link rel="enclosure" type="image/jpeg" href="http://farm1.static.flickr.com/43/76405904_47fe06e727_o.jpg" />
    <georss:point>52.85918 -119.203033</georss:point>
    <geo:lat>52.85918</geo:lat>
    <geo:long>-119.203033</geo:long>
    <woe:woeid>2344916</woe:woeid>
  </entry>

  <entry>
    <title>Denali Highway, AK</title>
    <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/shreck/76405583/"/>
    <id>tag:flickr.com,2005:/photo/76405583</id>
    <published>2005-12-23T00:24:07Z</published>
    <updated>2005-12-23T00:24:07Z</updated>
    <dc:date.Taken>2005-07-01T19:20:31-08:00</dc:date.Taken>
    <content type="html">			&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/people/shreck/&quot;&gt;manshreck&lt;/a&gt; posted a photo:&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/photos/shreck/76405583/&quot; title=&quot;Denali Highway, AK&quot;&gt;&lt;img src=&quot;http://farm1.static.flickr.com/37/76405583_cf87f9cc23_m.jpg&quot; width=&quot;240&quot; height=&quot;160&quot; alt=&quot;Denali Highway, AK&quot; /&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Faulkner in the mountains along the Denali Highway&lt;/p&gt;</content>
    <author>
      <name>manshreck</name>
      <uri>http://www.flickr.com/people/shreck/</uri>
      <flickr:nsid>51296622@N00</flickr:nsid>
      <flickr:buddyicon>http://farm1.static.flickr.com/29/buddyicons/51296622@N00.jpg?1130103303#51296622@N00</flickr:buddyicon>
    </author>
    <link rel="enclosure" type="image/jpeg" href="http://farm1.static.flickr.com/37/76405583_cf87f9cc23_o.jpg" />
    <category term="alaska" scheme="http://www.flickr.com/photos/tags/" />
    <georss:point>61.763703 -149.445304</georss:point>
    <geo:lat>61.763703</geo:lat>
    <geo:long>-149.445304</geo:long>
    <woe:woeid>12587568</woe:woeid>
  </entry>

  <entry>
    <title>Fairbanks, AK</title>
    <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/shreck/76405588/"/>
    <id>tag:flickr.com,2005:/photo/76405588</id>
    <published>2005-12-23T00:24:08Z</published>
    <updated>2005-12-23T00:24:08Z</updated>
    <dc:date.Taken>2005-07-21T01:05:56-08:00</dc:date.Taken>
    <content type="html">			&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/people/shreck/&quot;&gt;manshreck&lt;/a&gt; posted a photo:&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/photos/shreck/76405588/&quot; title=&quot;Fairbanks, AK&quot;&gt;&lt;img src=&quot;http://farm1.static.flickr.com/36/76405588_4a9f2b17ee_m.jpg&quot; width=&quot;160&quot; height=&quot;240&quot; alt=&quot;Fairbanks, AK&quot; /&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Faulkner under sedation&lt;/p&gt;</content>
    <author>
      <name>manshreck</name>
      <uri>http://www.flickr.com/people/shreck/</uri>
      <flickr:nsid>51296622@N00</flickr:nsid>
      <flickr:buddyicon>http://farm1.static.flickr.com/29/buddyicons/51296622@N00.jpg?1130103303#51296622@N00</flickr:buddyicon>
    </author>
    <link rel="enclosure" type="image/jpeg" href="http://farm1.static.flickr.com/36/76405588_4a9f2b17ee_o.jpg" />
    <category term="alaska" scheme="http://www.flickr.com/photos/tags/" />
    <georss:point>64.859404 -147.787055</georss:point>
    <geo:lat>64.859404</geo:lat>
    <geo:long>-147.787055</geo:long>
    <woe:woeid>2507302</woe:woeid>
  </entry>

  <entry>
    <title>Rochester, NY</title>
    <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/shreck/56104498/"/>
    <id>tag:flickr.com,2005:/photo/56104498</id>
    <published>2005-10-25T22:42:32Z</published>
    <updated>2005-10-25T22:42:32Z</updated>
    <dc:date.Taken>2005-10-22T21:37:17-08:00</dc:date.Taken>
    <content type="html">			&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/people/shreck/&quot;&gt;manshreck&lt;/a&gt; posted a photo:&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/photos/shreck/56104498/&quot; title=&quot;Rochester, NY&quot;&gt;&lt;img src=&quot;http://farm1.static.flickr.com/30/56104498_ea4f4d0e9c_m.jpg&quot; width=&quot;240&quot; height=&quot;175&quot; alt=&quot;Rochester, NY&quot; /&gt;&lt;/a&gt;&lt;/p&gt;

</content>
    <author>
      <name>manshreck</name>
      <uri>http://www.flickr.com/people/shreck/</uri>
      <flickr:nsid>51296622@N00</flickr:nsid>
      <flickr:buddyicon>http://farm1.static.flickr.com/29/buddyicons/51296622@N00.jpg?1130103303#51296622@N00</flickr:buddyicon>
    </author>
    <link rel="enclosure" type="image/jpeg" href="http://farm1.static.flickr.com/30/56104498_ea4f4d0e9c_o.jpg" />
    <category term="faulkner" scheme="http://www.flickr.com/photos/tags/" />
    <georss:point>43.127697 -77.573776</georss:point>
    <geo:lat>43.127697</geo:lat>
    <geo:long>-77.573776</geo:long>
    <woe:woeid>2482949</woe:woeid>
  </entry>

  <entry>
    <title>North Bay, ONT</title>
    <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/shreck/54107454/"/>
    <id>tag:flickr.com,2005:/photo/54107454</id>
    <published>2005-10-19T20:08:37Z</published>
    <updated>2005-10-19T20:08:37Z</updated>
    <dc:date.Taken>2005-06-08T17:40:13-08:00</dc:date.Taken>
    <content type="html">			&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/people/shreck/&quot;&gt;manshreck&lt;/a&gt; posted a photo:&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/photos/shreck/54107454/&quot; title=&quot;North Bay, ONT&quot;&gt;&lt;img src=&quot;http://farm1.static.flickr.com/27/54107454_b629dee37f_m.jpg&quot; width=&quot;240&quot; height=&quot;180&quot; alt=&quot;North Bay, ONT&quot; /&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Faulkner liked this barbell tennis ball toy. I would end up leaving it at a campsite near Denali. It might still be there.&lt;/p&gt;</content>
    <author>
      <name>manshreck</name>
      <uri>http://www.flickr.com/people/shreck/</uri>
      <flickr:nsid>51296622@N00</flickr:nsid>
      <flickr:buddyicon>http://farm1.static.flickr.com/29/buddyicons/51296622@N00.jpg?1130103303#51296622@N00</flickr:buddyicon>
    </author>
    <link rel="enclosure" type="image/jpeg" href="http://farm1.static.flickr.com/27/54107454_b629dee37f_o.jpg" />
    <georss:point>46.304252 -79.453125</georss:point>
    <geo:lat>46.304252</geo:lat>
    <geo:long>-79.453125</geo:long>
    <woe:woeid>3303</woe:woeid>
  </entry>

  <entry>
    <title>Adirondack State Park, NY</title>
    <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/shreck/54107176/"/>
    <id>tag:flickr.com,2005:/photo/54107176</id>
    <published>2005-10-19T20:07:46Z</published>
    <updated>2005-10-19T20:07:46Z</updated>
    <dc:date.Taken>2005-06-06T18:42:22-08:00</dc:date.Taken>
    <content type="html">			&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/people/shreck/&quot;&gt;manshreck&lt;/a&gt; posted a photo:&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/photos/shreck/54107176/&quot; title=&quot;Adirondack State Park, NY&quot;&gt;&lt;img src=&quot;http://farm1.static.flickr.com/32/54107176_3b8cdd09ef_m.jpg&quot; width=&quot;240&quot; height=&quot;180&quot; alt=&quot;Adirondack State Park, NY&quot; /&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Faulkner in the Adirondacks. The thunderstorm would start soon and we would spend the night at a shelter listening to the rain.&lt;/p&gt;</content>
    <author>
      <name>manshreck</name>
      <uri>http://www.flickr.com/people/shreck/</uri>
      <flickr:nsid>51296622@N00</flickr:nsid>
      <flickr:buddyicon>http://farm1.static.flickr.com/29/buddyicons/51296622@N00.jpg?1130103303#51296622@N00</flickr:buddyicon>
    </author>
    <link rel="enclosure" type="image/jpeg" href="http://farm1.static.flickr.com/32/54107176_3b8cdd09ef_o.jpg" />
    <georss:point>44.084625 -73.786926</georss:point>
    <geo:lat>44.084625</geo:lat>
    <geo:long>-73.786926</geo:long>
    <woe:woeid>12589327</woe:woeid>
  </entry>

  <entry>
    <title>Superior, WI</title>
    <link rel="alternate" type="text/html" href="http://www.flickr.com/photos/shreck/53746581/"/>
    <id>tag:flickr.com,2005:/photo/53746581</id>
    <published>2005-10-18T15:37:57Z</published>
    <updated>2005-10-18T15:37:57Z</updated>
    <dc:date.Taken>2005-06-09T22:33:19-08:00</dc:date.Taken>
    <content type="html">			&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/people/shreck/&quot;&gt;manshreck&lt;/a&gt; posted a photo:&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;http://www.flickr.com/photos/shreck/53746581/&quot; title=&quot;Superior, WI&quot;&gt;&lt;img src=&quot;http://farm1.static.flickr.com/31/53746581_9a2b889248_m.jpg&quot; width=&quot;240&quot; height=&quot;180&quot; alt=&quot;Superior, WI&quot; /&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;I camped out on Lake Superior next to a guy who listened to classic rock for far too long. Nice sunset, though.&lt;/p&gt;</content>
    <author>
      <name>manshreck</name>
      <uri>http://www.flickr.com/people/shreck/</uri>
      <flickr:nsid>51296622@N00</flickr:nsid>
      <flickr:buddyicon>http://farm1.static.flickr.com/29/buddyicons/51296622@N00.jpg?1130103303#51296622@N00</flickr:buddyicon>
    </author>
    <link rel="enclosure" type="image/jpeg" href="http://farm1.static.flickr.com/31/53746581_9a2b889248_o.jpg" />
    <georss:point>46.561575 -90.441169</georss:point>
    <geo:lat>46.561575</geo:lat>
    <geo:long>-90.441169</geo:long>
    <woe:woeid>12590559</woe:woeid>
  </entry>


</feed>}

    render :text => rss
  end

end
