import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Plus, Check, Video, Loader2, Sparkles, Send, Smartphone, Heart, MessageCircle, Share2, Repeat2, Bookmark, Globe, Film, HelpCircle, AlignLeft, CheckCircle2, AlertCircle, X, Hash, CalendarClock, Save, Clock, ChevronLeft, ChevronRight, ChevronDown, Calendar, ThumbsUp, ThumbsDown, Volume2, VolumeX, MoreVertical, Play, Lock, EyeOff } from 'lucide-react';
import { InstagramIcon, FacebookIcon, YoutubeIcon, TwitterIcon, LinkedinIcon, PinterestIcon, WhatsappIcon, TelegramIcon, SnapchatIcon, RedditIcon, ThreadsIcon } from '../components/Icons';
import { db } from '../firebase';
import { dbService } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { isFacebookTokenError, disconnectFacebookAndInstagram, isGoogleTokenError, disconnectYouTube } from '../services/tokenHelper';

const platformDefinitions = [
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: '#1877F2', supportsPolls: true, limit: 63206 },
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: '#E1306C', supportsPolls: false, limit: 2200 },
  { id: 'threads', name: 'Threads', icon: ThreadsIcon, color: '#000000', supportsPolls: false, limit: 500 },
  { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: '#FF0000', supportsPolls: true, limit: 5000 },
  { id: 'x', name: 'X (Twitter)', icon: TwitterIcon, color: '#000000', supportsPolls: true, limit: 280 }
];

const hashtagRepository = [
  // --- BUSINESS & WORK ---
  { label: 'Business', keywords: ['business', 'corp', 'office', 'work', 'job', 'corporate'], tags: '#business #entrepreneur #success #mindset #motivation #corporate #growth #networking #strategy' },
  { label: 'Startup', keywords: ['startup', 'founder', 'funding', 'pitch', 'venture', 'seed', 'innovation'], tags: '#startup #entrepreneurship #innovation #pitchdeck #venturecapital #founderlife #buildinpublic' },
  { label: 'Small Business', keywords: ['small business', 'local business', 'shop', 'boutique', 'supportlocal'], tags: '#smallbusiness #supportlocal #shoplocal #shopsmall #handmade #localbusiness #entrepreneur' },
  { label: 'Entrepreneurship', keywords: ['entrepreneur', 'entrepreneurship', 'solopreneur', 'hustle', 'boss'], tags: '#entrepreneur #solopreneur #sidehustle #entrepreneurship #businessowner #mindset #hustle' },
  { label: 'Marketing', keywords: ['marketing', 'seo', 'ads', 'branding', 'growth'], tags: '#marketing #digitalmarketing #branding #socialmediamarketing #seo #contentmarketing #growthhacking' },
  { label: 'Sales', keywords: ['sales', 'sell', 'deal', 'closing', 'retail', 'revenue'], tags: '#sales #selling #salestips #leads #conversion #revenue #closingsales #negotiation' },
  { label: 'Finance', keywords: ['finance', 'money', 'wealth', 'budget', 'personal finance'], tags: '#finance #personalfinance #wealth #budgeting #savingmoney #financialfreedom #moneytips' },
  { label: 'Consulting', keywords: ['consulting', 'consultant', 'advisor', 'coaching', 'expert'], tags: '#consulting #consultant #businesscoaching #mentorship #advisor #strategy #expertadvice' },
  { label: 'E-commerce', keywords: ['e-commerce', 'ecommerce', 'shopify', 'woocommerce', 'online store'], tags: '#ecommerce #shopify #onlineshopping #dropshipping #onlinestore #retail #amazonfba' },
  { label: 'B2B', keywords: ['b2b', 'enterprise', 'saas', 'wholesale'], tags: '#b2b #saas #b2bmarketing #leadgeneration #wholesale #enterprise #networking #corporate' },
  { label: 'B2C', keywords: ['b2c', 'consumer', 'retail', 'customer'], tags: '#b2c #consumer #retail #customerservice #onlineshopping #brandloyalty #directtoconsumer' },
  { label: 'Freelancing', keywords: ['freelance', 'freelancing', 'fiverr', 'upwork', 'gig'], tags: '#freelance #freelancer #remotework #workfromhome #upwork #fiverr #gigeconomy #solopreneur' },
  
  // --- TECHNOLOGY ---
  { label: 'Technology', keywords: ['tech', 'technology', 'gadget', 'future', 'hardware'], tags: '#technology #tech #innovation #futuretech #gadgets #geek #smarttech #newtech' },
  { label: 'Software Development', keywords: ['software', 'dev', 'software engineering', 'programming', 'developer'], tags: '#softwaredevelopment #softwareengineer #coding #programmer #developer #coder #engineer' },
  { label: 'Programming', keywords: ['programming', 'code', 'coding', 'python', 'javascript', 'java', 'c++'], tags: '#programming #coding #coder #javascript #python #webdev #code #developer' },
  { label: 'AI', keywords: ['ai', 'artificial intelligence', 'chatgpt', 'openai', 'llm'], tags: '#ai #artificialintelligence #chatgpt #openai #llm #neuralnetworks #deeplearning' },
  { label: 'Machine Learning', keywords: ['machine learning', 'ml', 'deep learning', 'algorithms', 'data science'], tags: '#machinelearning #ml #deeplearning #datascience #algorithms #dataanalysis' },
  { label: 'Cybersecurity', keywords: ['cybersecurity', 'security', 'hacker', 'phishing', 'firewall'], tags: '#cybersecurity #security #infosec #ethicalhacking #hacker #firewall #dataprotection #vpn' },
  { label: 'Cloud Computing', keywords: ['cloud', 'aws', 'azure', 'devops', 'server'], tags: '#cloudcomputing #aws #azure #devops #cloud #serverless #kubernetes #docker #infrastructure' },
  { label: 'Web Development', keywords: ['web dev', 'web development', 'html', 'css', 'react', 'node'], tags: '#webdevelopment #webdev #reactjs #nodejs #html5 #css3 #frontend #backend #fullstack' },
  { label: 'Mobile Apps', keywords: ['mobile app', 'ios', 'android', 'flutter', 'swift'], tags: '#mobileapps #ios #android #appdevelopment #flutter #reactnative #swift #kotlin #appstore' },
  { label: 'Data Science', keywords: ['data science', 'analytics', 'statistics', 'sql', 'big data'], tags: '#datascience #dataanalytics #bigdata #statistics #sql #datavisualization #python #bi' },
  { label: 'Blockchain', keywords: ['blockchain', 'web3', 'ethereum', 'nft', 'crypto'], tags: '#blockchain #web3 #ethereum #nft #crypto #smartcontracts #decentralized' },
  { label: 'IoT', keywords: ['iot', 'internet of things', 'smart devices', 'connected'], tags: '#iot #internetofthings #smartdevices #arduino #raspberrypi #automation #connectivity' },
  { label: 'Robotics', keywords: ['robotics', 'robot', 'automation', 'mechanics'], tags: '#robotics #robots #automation #engineering #mechatronics #ai #tech' },

  // --- SOCIAL MEDIA ---
  { label: 'Social Media', keywords: ['social media', 'facebook', 'instagram', 'twitter', 'linkedin'], tags: '#socialmedia #instagram #facebook #twitter #linkedin #socialmediamarketing #marketing' },
  { label: 'Instagram Growth', keywords: ['instagram growth', 'reels', 'followers', 'engagement'], tags: '#instagramgrowth #reelsmarketing #followers #engagement #instagramtips #algorithm' },
  { label: 'Content Creation', keywords: ['content creation', 'content creator', 'video editing', 'blogging'], tags: '#contentcreation #contentcreator #videoeditor #blogger #youtube #creativity' },
  { label: 'Influencer Marketing', keywords: ['influencer', 'sponsor', 'brand deal', 'collab'], tags: '#influencermarketing #influencer #brandcollab #sponsorship #digitalcreator #microinfluencer' },
  { label: 'Personal Branding', keywords: ['personal branding', 'branding', 'authority', 'reputation'], tags: '#personalbranding #branding #selfmarketing #influence #career #authority #authenticity' },
  { label: 'Digital Marketing', keywords: ['digital marketing', 'online marketing', 'ppc', 'email marketing'], tags: '#digitalmarketing #onlinemarketing #ppc #emailmarketing #leadgeneration #marketingagency' },
  { label: 'Social Media Tips', keywords: ['social media tips', 'hashtags', 'posting time', 'strategy'], tags: '#socialmediatips #marketingtips #socialmediastrategy #hashtags #postinghacks #growthtips' },

  // --- HOME & LIVING ---
  { label: 'Home & Living', keywords: ['home', 'living', 'lifestyle', 'decor', 'house'], tags: '#homeliving #homedecor #lifestyle #house #cozyliving #interior #modernhome' },
  { label: 'Interior Design', keywords: ['interior design', 'architecture', 'room makeover', 'renovation'], tags: '#interiordesign #decor #architecture #renovation #homestyle #roommakeover #minimalist' },
  { label: 'Smart Home', keywords: ['smart home', 'alexa', 'google home', 'automation', 'smart appliances'], tags: '#smarthome #homeautomation #alexa #googlehome #smartappliances #connectedhome' },
  { label: 'Furniture', keywords: ['furniture', 'sofa', 'table', 'chair', 'woodwork'], tags: '#furniture #sofa #homedecor #interiorfurniture #woodworking #chair #modernfurniture' },
  { label: 'Home Decor', keywords: ['home decor', 'wall art', 'lighting', 'plants'], tags: '#homedecor #decor #wallart #lighting #houseplants #decoration #styling' },
  { label: 'DIY', keywords: ['diy', 'craft', 'handmade', 'do it yourself'], tags: '#diy #crafts #handmade #doityourself #upcycling #hacks #creativeproject' },
  { label: 'Gardening', keywords: ['gardening', 'garden', 'plants', 'flowers', 'organic'], tags: '#gardening #garden #plants #flowers #organicgardening #houseplants #greenhouse' },
  { label: 'Home Security', keywords: ['home security', 'smart lock', 'alarm', 'safety'], tags: '#homesecurity #securitysystem #smartlock #alarmsystem #homesafety #surveillance' },

  // --- SECURITY & CCTV ---
  { label: 'Security & CCTV', keywords: ['security & cctv', 'security', 'cctv', 'surveillance', 'monitoring'], tags: '#securitysystem #cctvcamera #surveillance #securitytech #monitoring #safety' },
  { label: 'CCTV', keywords: ['cctv', 'security camera', 'ip camera', 'dvr', 'nvr'], tags: '#cctv #ipcamera #securitycamera #dvr #nvr #cctvinstallation #surveillancecamera' },
  { label: 'Surveillance', keywords: ['surveillance', 'monitoring', 'spy camera', 'security'], tags: '#surveillance #monitoring #securitymonitoring #spycamera #surveillancecamera #safety' },
  { label: 'Access Control', keywords: ['access control', 'smart card', 'keypad', 'rfid'], tags: '#accesscontrol #rfid #smartlock #entrysystem #doorsecurity #gateautomation' },
  { label: 'Biometrics', keywords: ['biometrics', 'fingerprint', 'face recognition', 'attendance'], tags: '#biometrics #fingerprintscanner #facerecognition #attendancesystem #securitytech' },
  { label: 'Smart Security', keywords: ['smart security', 'iot security', 'app control', 'notifications'], tags: '#smartsecurity #iotsecurity #homeautomation #securityapps #alarm #smarthome' },
  { label: 'Video Monitoring', keywords: ['video monitoring', 'live stream', 'cloud recording', 'vms'], tags: '#videomonitoring #livestream #cloudcctv #vms #videorecording #remotemonitoring' },
  { label: 'Alarm Systems', keywords: ['alarm', 'burglar alarm', 'siren', 'motion sensor'], tags: '#alarmsystem #burglaralarm #siren #motionsensor #intruderalert #firesafety' },
  { label: 'Office Security', keywords: ['office security', 'commercial security', 'guard', 'lock'], tags: '#officesecurity #commercialsecurity #businesssafety #accesscontrol #corporatesecurity' },

  // --- AUTOMOTIVE ---
  { label: 'Automotive', keywords: ['automotive', 'car', 'bike', 'vehicle', 'drive'], tags: '#automotive #cars #bikes #vehicles #driving #supercars #carlovers' },
  { label: 'Cars', keywords: ['cars', 'supercar', 'sedan', 'suv', 'sports car'], tags: '#cars #carsofinstagram #supercars #suv #sportscar #sedan #luxurycars' },
  { label: 'Bikes', keywords: ['bikes', 'motorcycle', 'superbike', 'scooter'], tags: '#bikes #motorcycle #superbike #bikerlife #instabike #rideout #twowheels' },
  { label: 'EVs', keywords: ['ev', 'evs', 'electric vehicle', 'tesla', 'battery', 'charging'], tags: '#ev #electricvehicle #tesla #chargingstation #batterypower #gogreen #electriccar' },
  { label: 'Car Accessories', keywords: ['car accessories', 'mods', 'alloys', 'seat cover', 'perfume'], tags: '#caraccessories #carmods #alloywheels #seatcovers #carperfume #styling' },
  { label: 'Car Reviews', keywords: ['car reviews', 'test drive', 'rating', 'specs'], tags: '#carreviews #testdrive #carspecs #automotivereview #carcomparison #buyerguide' },
  { label: 'Vehicle Security', keywords: ['vehicle security', 'gps tracker', 'car alarm', 'immobilizer'], tags: '#vehiclesecurity #gpstracker #caralarm #dashcam #anti-theft #gps' },
  { label: 'Auto Repair', keywords: ['auto repair', 'car service', 'engine', 'mechanic', 'tyre'], tags: '#autorepair #carservice #mechanic #enginefix #tyrechange #maintenance' },

  // --- FITNESS & HEALTH ---
  { label: 'Fitness & Health', keywords: ['fitness & health', 'fitness', 'health', 'wellness', 'exercise'], tags: '#fitness #health #wellness #exercise #workout #healthylifestyle #fitlife' },
  { label: 'Gym', keywords: ['gym', 'workout', 'weights', 'training', 'cardio'], tags: '#gym #workout #weightlifting #training #cardio #gymmotivation #fitspo' },
  { label: 'Weight Loss', keywords: ['weight loss', 'fat burn', 'diet', 'slimming'], tags: '#weightloss #diet #fatburn #slimming #keto #caloriedeficit #weightlossjourney' },
  { label: 'Bodybuilding', keywords: ['bodybuilding', 'muscle', 'bulk', 'shredded', 'protein'], tags: '#bodybuilding #muscle #bulking #shredded #physique #protein #powerlifting' },
  { label: 'Yoga', keywords: ['yoga', 'meditation', 'stretching', 'flexibility'], tags: '#yoga #meditation #stretching #flexibility #mindfulness #yogapractice #peace' },
  { label: 'Running', keywords: ['running', 'marathon', 'jogging', 'sprint'], tags: '#running #marathon #jogging #sprint #runner #cardio #trackandfield' },
  { label: 'Nutrition', keywords: ['nutrition', 'diet', 'calories', 'vitamins', 'protein shake'], tags: '#nutrition #dietplan #calories #vitamins #mealprep #healthyfood #macros' },
  { label: 'Mental Health', keywords: ['mental health', 'therapy', 'stress', 'anxiety', 'selfcare'], tags: '#mentalhealth #selfcare #therapy #stressrelief #mindfulness #positivity' },
  { label: 'Wellness', keywords: ['wellness', 'spa', 'selfcare', 'detox'], tags: '#wellness #selfcare #spa #detox #healthyhabits #relax #holistichealth' },

  // --- FOOD & DRINKS ---
  { label: 'Food & Drinks', keywords: ['food & drinks', 'food', 'drinks', 'cooking', 'recipe', 'beverage'], tags: '#food #drinks #foodie #cooking #recipes #instafood #yummy' },
  { label: 'Recipes', keywords: ['recipes', 'cooking guide', 'ingredients', 'homemade'], tags: '#recipes #cooking #homemade #easyrecipes #quickmeals #chefsecret' },
  { label: 'Restaurants', keywords: ['restaurants', 'dining', 'cafe', 'bistro', 'food review'], tags: '#restaurants #diningout #cafe #bistro #foodreviews #menu #foodiegram' },
  { label: 'Street Food', keywords: ['street food', 'fast food', 'food truck', 'chaat'], tags: '#streetfood #foodtruck #fastfood #chaat #localfood #spicyfood #foodtravel' },
  { label: 'Healthy Food', keywords: ['healthy food', 'salad', 'organic', 'low carb', 'vegan'], tags: '#healthyfood #salad #organic #vegan #lowcarb #keto #plantbased' },
  { label: 'Baking', keywords: ['baking', 'cake', 'bread', 'pastry', 'oven'], tags: '#baking #cake #bread #pastries #cookies #desserts #ovenbaked' },
  { label: 'Coffee', keywords: ['coffee', 'tea', 'latte', 'espresso', 'cafe'], tags: '#coffee #latteart #espresso #caffeine #coffeelover #cafeculture #tea' },
  { label: 'Desserts', keywords: ['desserts', 'sweet', 'ice cream', 'chocolate'], tags: '#desserts #sweets #icecream #chocolate #sweettooth #pastrychef' },

  // --- TRAVEL ---
  { label: 'Travel', keywords: ['travel', 'tourism', 'trip', 'explore', 'vacation'], tags: '#travel #tourism #trip #explore #vacation #wanderlust #travelgram' },
  { label: 'Adventure Travel', keywords: ['adventure travel', 'trekking', 'camping', 'hiking', 'rafting'], tags: '#adventuretravel #trekking #camping #hiking #riverrafting #adrenaline' },
  { label: 'Luxury Travel', keywords: ['luxury travel', 'resort', 'first class', 'villas'], tags: '#luxurytravel #resort #firstclass #luxuryvilla #travelinstyle #jetset' },
  { label: 'Budget Travel', keywords: ['budget travel', 'hostel', 'backpacking', 'cheap trip'], tags: '#budgettravel #hostelworld #backpacking #cheaptravel #backpackerlife #travelhacks' },
  { label: 'Hotels', keywords: ['hotels', 'resorts', 'homestay', 'airbnb'], tags: '#hotels #resorts #homestays #airbnb #booking #hospitality #vacationstay' },
  { label: 'Tourism', keywords: ['tourism', 'sightseeing', 'guided tour', 'monuments'], tags: '#tourism #sightseeing #monuments #travelguide #culturetrip #exploring' },
  { label: 'Road Trips', keywords: ['road trips', 'driving trip', 'highway', 'caravan'], tags: '#roadtrip #highwaydrive #travelbycar #exploreroads #wanderer #scenicroute' },
  { label: 'Backpacking', keywords: ['backpacking', 'backpacker', 'hiking trip'], tags: '#backpacking #backpacker #hike #mountains #travelsolo #natureexplore' },

  // --- FASHION & BEAUTY ---
  { label: 'Fashion', keywords: ['fashion', 'style', 'clothing', 'designer'], tags: '#fashion #style #clothing #ootd #fashionblogger #instafashion' },
  { label: 'Men\'s Fashion', keywords: ['men\'s fashion', 'menswear', 'suits', 'streetwear'], tags: '#mensfashion #menswear #suits #gentlemanstyle #streetwearmen #menstyle' },
  { label: 'Women\'s Fashion', keywords: ['women\'s fashion', 'dresses', 'skirts', 'handbags'], tags: '#womensfashion #dresses #handbags #chicstyle #outfitinspiration #womenstyle' },
  { label: 'Streetwear', keywords: ['streetwear', 'sneakers', 'hoodie', 'caps'], tags: '#streetwear #sneakers #hoodies #urbanfashion #hypebeast #casualstyle' },
  { label: 'Luxury Fashion', keywords: ['luxury fashion', 'couture', 'designer brands', 'runway'], tags: '#luxuryfashion #runway #haute #designerbrands #exclusiveoutfits' },
  { label: 'Accessories', keywords: ['accessories', 'watches', 'sunglasses', 'jewelry', 'belts'], tags: '#accessories #watches #sunglasses #jewelry #belts #fashiondetails' },
  { label: 'Footwear', keywords: ['footwear', 'shoes', 'sneakers', 'boots', 'heels'], tags: '#footwear #shoes #sneakers #boots #heels #shoelover #instashoes' },
  { label: 'Beauty', keywords: ['beauty', 'grooming', 'makeup', 'skincare'], tags: '#beauty #grooming #skincare #makeup #beautycare #glam' },
  { label: 'Makeup', keywords: ['makeup', 'lipstick', 'eyeliner', 'foundation'], tags: '#makeup #makeupartist #lipstick #eyeshadow #glamlook #makeupaddict' },
  { label: 'Skincare', keywords: ['skincare', 'serum', 'cream', 'facewash', 'glow'], tags: '#skincare #serum #healthyskin #glowingskin #skincareroutine #selfcare' },
  { label: 'Haircare', keywords: ['haircare', 'shampoo', 'haircut', 'salon', 'oil'], tags: '#haircare #shampoo #haircut #salon #hairstyles #hairgoals #scalpcare' },
  { label: 'Cosmetics', keywords: ['cosmetics', 'perfume', 'makeup kits', 'beauty products'], tags: '#cosmetics #perfume #beautyproducts #makeupkit #organiccosmetics' },
  { label: 'Grooming', keywords: ['grooming', 'beard oil', 'shaving', 'men\'s care'], tags: '#grooming #beardoil #shaving #mensgrooming #selfcareformen #beardcare' },
  { label: 'Nail Art', keywords: ['nail art', 'manicure', 'nail polish', 'acrylic'], tags: '#nailart #manicure #nailpolish #acrylicnails #naildesigns #nailtech' },

  // --- EDUCATION ---
  { label: 'Education', keywords: ['education', 'school', 'college', 'study', 'learn'], tags: '#education #learning #study #school #college #knowledge #student' },
  { label: 'School', keywords: ['school', 'homework', 'exams', 'teachers'], tags: '#school #homework #exams #teachers #studentlife #education' },
  { label: 'College', keywords: ['college', 'university', 'campus', 'degree'], tags: '#college #university #campuslife #degree #collegelife #highereducation' },
  { label: 'Competitive Exams', keywords: ['competitive exams', 'jee', 'neet', 'upsc', 'gate', 'exams'], tags: '#competitiveexams #upsc #jee #neet #gate #ias #aspirants #studytips' },
  { label: 'Online Learning', keywords: ['online learning', 'coursera', 'udemy', 'e-learning'], tags: '#onlinelearning #elearning #udemy #coursera #webinar #virtualclass' },
  { label: 'Coding Education', keywords: ['coding education', 'learn code', 'stem', 'scratch'], tags: '#codingeducation #learncode #stemeducation #kidscoding #codeclasses' },
  { label: 'Language Learning', keywords: ['language learning', 'english', 'french', 'spanish', 'grammar'], tags: '#languagelearning #learnenglish #spanishclass #vocabulary #duolingo' },
  { label: 'Career Guidance', keywords: ['career guidance', 'resume', 'interview tips', 'jobs'], tags: '#careerguidance #interviewtips #resume #careergoals #placement #jobs' },

  // --- GAMING & ENTERTAINMENT ---
  { label: 'Gaming', keywords: ['gaming', 'game', 'gamer', 'play'], tags: '#gaming #gamer #videogames #play #streamer #gamingcommunity' },
  { label: 'PC Gaming', keywords: ['pc gaming', 'steam', 'graphics card', 'rgb'], tags: '#pcgaming #steam #rtx #gamingpc #rgbsetup #pcbuild' },
  { label: 'Mobile Gaming', keywords: ['mobile gaming', 'pubg', 'free fire', 'cod mobile'], tags: '#mobilegaming #pubgmobile #freefire #codmobile #gamingonphone' },
  { label: 'Console Gaming', keywords: ['console gaming', 'playstation', 'ps5', 'xbox', 'nintendo'], tags: '#consolegaming #ps5 #playstation #xbox #nintendo #switch' },
  { label: 'Esports', keywords: ['esports', 'tournament', 'championship', 'clan'], tags: '#esports #gamingtournament #proplayer #championship #gamingteam' },
  { label: 'Game Reviews', keywords: ['game reviews', 'walkthrough', 'gameplay', 'rating'], tags: '#gamereviews #gameplay #walkthrough #ign #gamersopinion' },
  { label: 'Streaming', keywords: ['streaming', 'twitch', 'live stream', 'youtube gaming'], tags: '#streaming #twitchstreamer #livegaming #youtubegaming #obs' },
  { label: 'Music', keywords: ['music', 'song', 'sing', 'instruments'], tags: '#music #song #musician #singing #melody #instamusic' },
  { label: 'Singers', keywords: ['singers', 'vocals', 'cover song', 'soloist'], tags: '#singers #vocals #coversong #vocalist #singer-songwriter' },
  { label: 'Bands', keywords: ['bands', 'rock band', 'orchestra', 'group'], tags: '#bands #rockband #livemusic #bandlife #orchestra #musiciangroup' },
  { label: 'Instruments', keywords: ['instruments', 'guitar', 'piano', 'drums', 'violin'], tags: '#instruments #guitar #piano #drums #violin #instrumental' },
  { label: 'Music Production', keywords: ['music production', 'beats', 'studio', 'daw', 'mixing'], tags: '#musicproduction #beatmaker #studioflow #mixingandmastering #daw #producer' },
  { label: 'DJ', keywords: ['dj', 'edm', 'club', 'mix', 'party'], tags: '#dj #edm #clubdj #musicmix #partyvibes #electronicmusic' },
  { label: 'Concerts', keywords: ['concerts', 'live concert', 'gig', 'music festival'], tags: '#concert #livemusic #gig #musicfestival #stageperformance' },
  { label: 'Entertainment', keywords: ['entertainment', 'movies', 'series', 'celebs'], tags: '#entertainment #movies #tvshows #popculture #celebnews' },
  { label: 'Movies', keywords: ['movies', 'cinema', 'hollywood', 'bollywood', 'reviews'], tags: '#movies #cinema #hollywood #bollywood #filmreview #movietrailer' },
  { label: 'TV Shows', keywords: ['tv shows', 'sitcom', 'drama', 'episodes'], tags: '#tvshows #sitcom #series #drama #episode #television' },
  { label: 'Web Series', keywords: ['web series', 'netflix', 'amazon prime', 'hotstar'], tags: '#webseries #netflix #bingewatch #primevideo #originalseries' },
  { label: 'Celebrities', keywords: ['celebrities', 'gossip', 'actors', 'red carpet'], tags: '#celebrities #gossip #hollywoodstars #bollywoodcelebs #redcarpet' },
  { label: 'OTT', keywords: ['ott', 'streaming apps', 'netflix', 'subscriptions'], tags: '#ott #streamingapps #netflixindia #bingewatching #primevideo' },
  { label: 'Anime', keywords: ['anime', 'manga', 'naruto', 'otaku'], tags: '#anime #manga #otaku #naruto #onepiece #demonslayer' },

  // --- PHOTOGRAPHY & ART ---
  { label: 'Photography', keywords: ['photography', 'photo', 'camera', 'shoot'], tags: '#photography #photooftheday #camera #instaphoto #capture' },
  { label: 'Portrait', keywords: ['portrait', 'model shoot', 'close up'], tags: '#portrait #portraitphotography #modelshoot #headshot #faces' },
  { label: 'Wildlife', keywords: ['wildlife', 'animals', 'forest photography'], tags: '#wildlife #wildlifephotography #naturelovers #animalsinwild #safari' },
  { label: 'Nature', keywords: ['nature', 'landscape', 'forest', 'mountains'], tags: '#nature #naturephotography #landscapes #mountains #forest' },
  { label: 'Street Photography', keywords: ['street photography', 'urban', 'candid'], tags: '#streetphotography #urbanphoto #candidphotography #streetstyle #citylife' },
  { label: 'Drone Photography', keywords: ['drone photography', 'aerial view', 'quadcopter'], tags: '#dronephotography #aerialphotography #dji #quadcopter #mavic' },
  { label: 'Product Photography', keywords: ['product photography', 'commercial shoot', 'branding'], tags: '#productphotography #commercialphotography #productshoot #adphotography' },
  { label: 'Art & Design', keywords: ['art & design', 'art', 'design', 'drawing', 'illustration'], tags: '#art #design #illustration #drawing #artwork #creativity' },
  { label: 'Graphic Design', keywords: ['graphic design', 'photoshop', 'illustrator', 'posters'], tags: '#graphicdesign #photoshop #illustrator #posterdesign #vectors' },
  { label: 'Logo Design', keywords: ['logo design', 'branding', 'vector logo'], tags: '#logodesign #logo #branding #brandidentity #vectorlogo' },
  { label: 'UI/UX', keywords: ['ui/ux', 'web design', 'figma', 'wireframe'], tags: '#uiux #webdesign #figma #userexperience #userinterface #wireframing' },
  { label: 'Illustration', keywords: ['illustration', 'character design', 'doodle'], tags: '#illustration #characterdesign #doodleart #vectorillustration #digitaldrawing' },
  { label: 'Digital Art', keywords: ['digital art', 'procreate', 'photoshop art'], tags: '#digitalart #procreate #digitalpainting #photoshopart #conceptart' },
  { label: 'Branding', keywords: ['branding', 'corporate identity', 'logo'], tags: '#branding #brandidentity #corporatebranding #logo #marketing' },

  // --- OTHERS & SPECIALIZED ---
  { label: 'Pets & Animals', keywords: ['pets & animals', 'pets', 'animals', 'rescue'], tags: '#pets #animals #cuteanimals #petcare #lovepets' },
  { label: 'Dogs', keywords: ['dogs', 'puppy', 'dog care'], tags: '#dogs #dogsofinstagram #puppy #doglovers #dogtraining' },
  { label: 'Cats', keywords: ['cats', 'kitten', 'cat care'], tags: '#cats #catsofinstagram #kitten #catlovers #meow' },
  { label: 'Pet Care', keywords: ['pet care', 'vet', 'pet food'], tags: '#petcare #veterinarian #petfood #groomingforpets #healthypets' },
  { label: 'Animal Rescue', keywords: ['animal rescue', 'adopt', 'shelter'], tags: '#animalrescue #adoptdontshop #animalshelter #rescueanimals #savepets' },
  { label: 'Environment', keywords: ['environment', 'eco', 'earth', 'green'], tags: '#environment #gogreen #earth #naturelovers #ecofriendly' },
  { label: 'Sustainability', keywords: ['sustainability', 'eco friendly', 'zero waste'], tags: '#sustainability #ecofriendly #zerowaste #sustainableliving #reduce' },
  { label: 'Renewable Energy', keywords: ['renewable energy', 'solar', 'wind energy', 'clean power'], tags: '#renewableenergy #solar #windenergy #cleanenergy #greenpower' },
  { label: 'Climate Change', keywords: ['climate change', 'global warming', 'save earth'], tags: '#climatechange #globalwarming #saveearth #gogreen #actnow' },
  { label: 'Recycling', keywords: ['recycling', 'waste management', 'upcycling'], tags: '#recycling #upcycling #wastemanagement #gogreen #reducewaste' },
  { label: 'Sports', keywords: ['sports', 'game', 'play', 'athlete'], tags: '#sports #athletics #game #fitness #gameday' },
  { label: 'Football', keywords: ['football', 'soccer', 'fifa', 'match'], tags: '#football #soccer #fifa #matchday #championsleague #goal' },
  { label: 'Cricket', keywords: ['cricket', 'ipl', 't20', 'test match', 'dhoni', 'kohli'], tags: '#cricket #ipl #t20 #matchday #cricketlovers #dhoni #kohli' },
  { label: 'Basketball', keywords: ['basketball', 'nba', 'dunk'], tags: '#basketball #nba #dunk #court #baller #lebron #jordan' },
  { label: 'Tennis', keywords: ['tennis', 'grand slam', 'wimbledon'], tags: '#tennis #grandslam #wimbledon #racket #atp #nadal #federer' },
  { label: 'Badminton', keywords: ['badminton', 'racket', 'smash', 'shuttlecock'], tags: '#badminton #shuttlecock #smash #shuttler #sports' },
  { label: 'Kabaddi', keywords: ['kabaddi', 'pro kabaddi', 'raid'], tags: '#kabaddi #prokabaddi #raid #sports #kabaddilovers' },
  { label: 'Olympics', keywords: ['olympics', 'gold medal', 'games'], tags: '#olympics #goldmedal #olympians #sportschampionship #games' },
  { label: 'Shopping', keywords: ['shopping', 'mall', 'buy', 'online shopping'], tags: '#shopping #onlineshopping #retailtherapy #deals #mall' },
  { label: 'Electronics', keywords: ['electronics', 'gadgets', 'mobiles', 'appliances'], tags: '#electronics #gadgets #appliances #hometech #smartdevices' },
  { label: 'Fashion Shopping', keywords: ['fashion shopping', 'clothes haul', 'sale'], tags: '#fashionshopping #clothesstore #haul #sale #styling' },
  { label: 'Deals', keywords: ['deals', 'coupons', 'discounts', 'offers'], tags: '#deals #discounts #coupons #offers #savemoney #sales' },
  { label: 'Product Reviews', keywords: ['product reviews', 'unboxing', 'rating'], tags: '#productreviews #unboxing #ratings #honestreview #gadgetreview' },
  { label: 'Relationships', keywords: ['relationships', 'love', 'friends', 'marriage'], tags: '#relationships #love #friends #marriage #communication #trust' },
  { label: 'Friendship', keywords: ['friendship', 'best friend', 'bff'], tags: '#friendship #bestfriends #bff #friendshipgoals #memories' },
  { label: 'Family', keywords: ['family', 'parents', 'reunion'], tags: '#family #lovefamily #familytime #parents #home' },
  { label: 'Parenting', keywords: ['parenting', 'child care', 'kids education'], tags: '#parenting #childcare #parentinglife #momlife #dadlife' },
  { label: 'Marriage', keywords: ['marriage', 'husband wife', 'wedding life'], tags: '#marriage #husbandwife #marriedlife #love #weddinganniversary' },
  { label: 'Kids & Parenting', keywords: ['kids & parenting', 'kids', 'baby', 'parenting tips'], tags: '#parenting #kids #babycare #parentingtips #motherhood' },
  { label: 'Parenting Tips', keywords: ['parenting tips', 'advice', 'raising kids'], tags: '#parentingtips #adviceforparents #raisingkids #childpsychology' },
  { label: 'Child Education', keywords: ['child education', 'nursery', 'early learning'], tags: '#childeducation #earlylearning #preschool #homeschooling #nursery' },
  { label: 'Baby Care', keywords: ['baby care', 'diapers', 'infant', 'nutrition for kids'], tags: '#babycare #infantcare #diapers #newborn #babyfood' },
  { label: 'Real Estate', keywords: ['real estate', 'property', 'flat', 'house', 'agent'], tags: '#realestate #property #housing #investment #newhome #realtor' },
  { label: 'Property', keywords: ['property', 'land', 'plots', 'investment'], tags: '#property #investment #plots #commercialrealestate #assets' },
  { label: 'Construction', keywords: ['construction', 'building', 'materials', 'civil'], tags: '#construction #building #civilengineering #sitevisit #architecture' },
  { label: 'Architecture', keywords: ['architecture', 'design', 'blueprints'], tags: '#architecture #design #blueprints #structure #historicbuildings' },
  { label: 'Home Buying', keywords: ['home buying', 'home loan', 'emi'], tags: '#homebuying #homeloan #mortgage #newhomeowner #emi' },
  { label: 'Rentals', keywords: ['rentals', 'flat for rent', 'pg', 'lease'], tags: '#rentals #flatforrent #lease #pg #accommodation' },
  { label: 'Government & Politics', keywords: ['government & politics', 'government', 'politics', 'elections', 'policy'], tags: '#government #politics #elections #policy #governance #democracy' },
  { label: 'Elections', keywords: ['elections', 'voting', 'campaign', 'candidate'], tags: '#elections #voting #politicalcampaign #democracy #results' },
  { label: 'Policies', keywords: ['policies', 'schemes', 'laws'], tags: '#policies #government-schemes #laws #publicwelfare #reforms' },
  { label: 'Governance', keywords: ['governance', 'administration', 'transparency'], tags: '#governance #administration #publicservice #transparency #reforms' },
  { label: 'Public Services', keywords: ['public services', 'infrastructure', 'sanitation'], tags: '#publicservices #infrastructure #welfare #communitysupport' },
  { label: 'Stock Market', keywords: ['stock market', 'shares', 'nifty', 'sensex', 'trading'], tags: '#stockmarket #trading #shares #nifty #sensex #investing #daytrading' },
  { label: 'Cryptocurrency', keywords: ['cryptocurrency', 'bitcoin', 'crypto', 'blockchain'], tags: '#cryptocurrency #bitcoin #crypto #trading #altcoins' },
  { label: 'Mutual Funds', keywords: ['mutual funds', 'sip', 'elss', 'investing'], tags: '#mutualfunds #sip #investing #elss #wealthcreation' },
  { label: 'Personal Finance', keywords: ['personal finance', 'savings', 'budgeting', 'financial planning'], tags: '#personalfinance #savings #budgeting #financialplanning #moneytips' },
  { label: 'Investing', keywords: ['investing', 'portfolio', 'long term', 'assets'], tags: '#investing #portfolio #longterminvesting #wealth #assets' },
  { label: 'Religion & Spirituality', keywords: ['religion & spirituality', 'religion', 'spirituality', 'meditation', 'yoga'], tags: '#religion #spirituality #meditation #innerpeace #faith' },
  { label: 'Meditation', keywords: ['meditation', 'mindfulness', 'calm', 'breathing'], tags: '#meditation #mindfulness #calm #zen #innerpeace' },
  { label: 'Spiritual Growth', keywords: ['spiritual growth', 'awakening', 'enlightenment'], tags: '#spiritualgrowth #awakening #mindfulness #enlightenment #soul' },
  { label: 'Religious Events', keywords: ['religious events', 'festivals', 'rituals'], tags: '#religious #festivals #rituals #prayer #community' },
  { label: 'Events', keywords: ['events', 'festivals', 'conferences', 'weddings'], tags: '#events #festivals #conferences #weddings #celebrations' },
  { label: 'Festivals', keywords: ['festivals', 'celebrations', 'holidays'], tags: '#festivals #celebrations #cultural #holidays #vibes' },
  { label: 'Conferences', keywords: ['conferences', 'seminar', 'summit', 'webinar'], tags: '#conferences #seminar #summit #keynote #businessnetworking' },
  { label: 'Weddings', keywords: ['weddings', 'marriage', 'bride', 'groom', 'decorator'], tags: '#wedding #marriage #bride #groom #weddingdecor #shaadi' },
  { label: 'Exhibitions', keywords: ['exhibitions', 'art gallery', 'tradeshow'], tags: '#exhibitions #artgallery #tradeshow #expo #display' },
  { label: 'Trade Shows', keywords: ['trade shows', 'expo', 'business display'], tags: '#tradeshow #expo #businessnetworking #b2bexpo' },
  { label: 'Location-Based', keywords: ['location', 'country', 'state', 'city'], tags: '#location #citylife #travelindia #localbusiness #explorelocal' },
  { label: 'Tourism Spot', keywords: ['tourism spot', 'sightseeing', 'vacation destination'], tags: '#tourismspot #sightseeing #hiddengem #vacationdestination #naturebeauty' }
];

function PremiumDatePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const selectedDate = value ? new Date(value) : null;
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const daysGrid = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push(new Date(year, month, i));
  }

  const formatDisplayDate = (d) => {
    if (!d) return 'Select Date';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  return (
    <div ref={datePickerRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0.75rem',
          borderRadius: '10px',
          background: 'var(--bg-dark)',
          border: '1px solid var(--panel-border)',
          color: value ? '#fff' : 'var(--text-secondary)',
          outline: 'none',
          fontSize: '0.9rem',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s',
          fontFamily: 'inherit'
        }}
      >
        <span>{formatDisplayDate(selectedDate)}</span>
        <Calendar size={16} color="var(--text-secondary)" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transitionEnd={{ overflow: 'visible' }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              marginBottom: '0.5rem',
              background: 'var(--panel-bg)',
              backdropFilter: 'blur(25px)',
              border: '1px solid var(--panel-border)',
              borderRadius: '16px',
              padding: '1rem',
              width: '280px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              zIndex: 99999
            }}
          >
            {/* Month Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <button type="button" onClick={handlePrevMonth} style={{ background: 'var(--sidebar-active-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.25rem', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button type="button" onClick={handleNextMonth} style={{ background: 'var(--sidebar-active-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.25rem', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekdays */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '0.5rem' }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(w => (
                <span key={w} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{w}</span>
              ))}
            </div>

            {/* Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {daysGrid.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const todayCompare = new Date();
                todayCompare.setHours(0,0,0,0);
                const isPast = day < todayCompare;
                
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={isPast}
                    onClick={() => {
                      if (isPast) return;
                      const yyyy = day.getFullYear();
                      const mm = String(day.getMonth() + 1).padStart(2, '0');
                      const dd = String(day.getDate()).padStart(2, '0');
                      onChange(`${yyyy}-${mm}-${dd}`);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '0.4rem 0',
                      borderRadius: '8px',
                      border: 'none',
                      background: isSelected ? 'var(--accent-blue)' : isToday ? 'rgba(0, 210, 255, 0.15)' : 'transparent',
                      color: isSelected ? '#000' : isPast ? 'rgba(255,255,255,0.2)' : '#fff',
                      fontSize: '0.8rem',
                      fontWeight: isSelected || isToday ? 700 : 500,
                      cursor: isPast ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: isPast ? 0.4 : 1
                    }}
                    onMouseEnter={e => {
                      if (!isSelected && !isPast) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected && !isPast) e.currentTarget.style.background = isToday ? 'rgba(0, 210, 255, 0.15)' : 'transparent';
                    }}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PremiumTimePicker({ value, onChange, isToday }) {
  const [isOpen, setIsOpen] = useState(false);
  const timePickerRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (timePickerRef.current && !timePickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const generateTimeOptions = () => {
    const options = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 === 0 ? 12 : h % 12;
        const isPast = isToday && (h < currentHour || (h === currentHour && m < currentMinute));
        
        if (!isPast) {
          options.push({
            value: `${hh}:${mm}`,
            label: `${displayHour}:${mm} ${ampm}`
          });
        }
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();
  const activeOption = timeOptions.find(o => o.value === value);

  return (
    <div ref={timePickerRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0.75rem',
          borderRadius: '10px',
          background: 'var(--bg-dark)',
          border: '1px solid var(--panel-border)',
          color: value ? '#fff' : 'var(--text-secondary)',
          outline: 'none',
          fontSize: '0.9rem',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s',
          fontFamily: 'inherit'
        }}
      >
        <span>{activeOption ? activeOption.label : 'Select Time'}</span>
        <Clock size={16} color="var(--text-secondary)" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              marginBottom: '0.5rem',
              background: 'rgba(18, 18, 18, 0.98)',
              backdropFilter: 'blur(25px)',
              border: '1px solid var(--panel-border)',
              borderRadius: '16px',
              padding: '0.5rem',
              width: '200px',
              maxHeight: '200px',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}
          >
            {timeOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSelected ? 'var(--accent-purple)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 600 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChipItem({ tag, isAdded, onToggle }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        userSelect: 'none',
        background: isAdded 
          ? 'rgba(0, 210, 255, 0.12)' 
          : 'rgba(255, 255, 255, 0.03)',
        border: isAdded 
          ? '1px solid rgba(0, 210, 255, 0.3)' 
          : '1px solid rgba(255, 255, 255, 0.06)',
        color: isAdded ? 'var(--accent-blue)' : 'var(--text-secondary)'
      }}
      onClick={() => onToggle(tag)}
    >
      <span>{tag}</span>
      <motion.div
        animate={{ scale: isHovered ? 1.15 : 1 }}
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: isAdded 
            ? (isHovered ? 'rgba(255, 61, 0, 0.15)' : 'rgba(0, 230, 118, 0.15)')
            : 'rgba(255, 255, 255, 0.08)',
          color: isAdded 
            ? (isHovered ? 'var(--error)' : 'var(--success)')
            : 'var(--text-secondary)',
          transition: 'all 0.15s ease'
        }}
      >
        {isAdded ? (
          isHovered ? <X size={10} strokeWidth={3} /> : <Check size={10} strokeWidth={3} />
        ) : (
          <Plus size={10} strokeWidth={3} />
        )}
      </motion.div>
    </motion.div>
  );
}

const devices = [
  { id: 'iphone15promax', name: 'iPhone 15 Pro Max', width: '330px', height: '670px', borderRadius: '44px', border: '8px solid #2f3032', notchType: 'dynamic-island', notchWidth: '85px', notchHeight: '24px', notchRadius: '16px' },
  { id: 'iphone15pro', name: 'iPhone 15 Pro', width: '310px', height: '630px', borderRadius: '40px', border: '7.5px solid #2f3032', notchType: 'dynamic-island', notchWidth: '78px', notchHeight: '23px', notchRadius: '15px' },
  { id: 'iphone14pro', name: 'iPhone 14 Pro', width: '310px', height: '630px', borderRadius: '40px', border: '8px solid #1c1c1e', notchType: 'dynamic-island', notchWidth: '78px', notchHeight: '23px', notchRadius: '15px' },
  { id: 's24ultra', name: 'Galaxy S24 Ultra', width: '330px', height: '670px', borderRadius: '12px', border: '9px solid #1f2022', notchType: 'punch-hole', notchWidth: '11px', notchHeight: '11px', notchRadius: '50%' },
  { id: 's23ultra', name: 'Galaxy S23 Ultra', width: '330px', height: '670px', borderRadius: '16px', border: '8px solid #1c1c1e', notchType: 'punch-hole', notchWidth: '11px', notchHeight: '11px', notchRadius: '50%' },
  { id: 'pixel8pro', name: 'Pixel 8 Pro', width: '320px', height: '650px', borderRadius: '34px', border: '8px solid #2d2e30', notchType: 'punch-hole', notchWidth: '11px', notchHeight: '11px', notchRadius: '50%' },
  { id: 'oneplus12', name: 'OnePlus 12', width: '320px', height: '650px', borderRadius: '30px', border: '8px solid #1c1c1e', notchType: 'punch-hole', notchWidth: '10px', notchHeight: '10px', notchRadius: '50%' },
  { id: 'nothing2', name: 'Nothing Phone (2)', width: '325px', height: '660px', borderRadius: '34px', border: '8px solid #2a2a2a', notchType: 'punch-hole', notchWidth: '10px', notchHeight: '10px', notchRadius: '50%' },
  { id: 'xiaomi14pro', name: 'Xiaomi 14 Pro', width: '320px', height: '650px', borderRadius: '28px', border: '8px solid #1c1c1e', notchType: 'punch-hole', notchWidth: '10px', notchHeight: '10px', notchRadius: '50%' },
  { id: 'iphone13', name: 'iPhone 13', width: '310px', height: '630px', borderRadius: '38px', border: '8px solid #1c1c1e', notchType: 'notch', notchWidth: '100px', notchHeight: '20px', notchRadius: '0 0 12px 12px' }
];

export default function CreatePost() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const editPost = location.state?.editPost;

  const [selectedDevice, setSelectedDevice] = useState(devices[0]);
  

  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);
  const deviceDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deviceDropdownRef.current && !deviceDropdownRef.current.contains(event.target)) {
        setShowDeviceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getPreviewUsername = () => {
    const savedUsername = localStorage.getItem(`${previewPlatform}_username`);
    if (savedUsername) return savedUsername;

    const fbPageName = localStorage.getItem('fb_page_name');
    if (previewPlatform === 'facebook' && fbPageName) {
      return fbPageName;
    }
    if (previewPlatform === 'instagram' && fbPageName) {
      return fbPageName.toLowerCase().replace(/\s+/g, '_');
    }

    if (currentUser) {
      const baseName = currentUser.displayName || currentUser.email.split('@')[0];
      if (previewPlatform === 'instagram' || previewPlatform === 'x' || previewPlatform === 'threads') {
        return baseName.toLowerCase().replace(/\s+/g, '_');
      }
      return baseName;
    }

    if (previewPlatform === 'instagram' || previewPlatform === 'x' || previewPlatform === 'threads') {
      return 'your_username';
    }
    return 'Your Page Name';
  };

  const renderPlatformPreview = () => {
    const isLightTheme = document.body.classList.contains('light-theme');
    const username = getPreviewUsername();
    const handle = `@${username.toLowerCase().replace(/\s+/g, '')}`;
    const title = previewData?.title || '';
    const description = previewData?.description || '';
    
    // Get media specifically for the preview platform
    const media = platformMedia[previewPlatform] !== undefined 
      ? platformMedia[previewPlatform] 
      : (platformMedia.universal || []);
      
    const hasMedia = media.length > 0;
    
    const renderMediaContent = (height = '300px', borderRadius = '0px') => {
      if (!hasMedia) {
        return (
          <div style={{ height, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0a0', fontSize: '0.9rem', borderRadius }}>
            No Media Selected
          </div>
        );
      }
      return (
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{ width: '100%', display: 'flex', overflowX: 'auto', snapType: 'x mandatory', scrollbarWidth: 'none', borderRadius }} onScroll={(e) => setCurrentImageIndex(Math.round(e.target.scrollLeft / e.target.offsetWidth))}>
            {media.map((file, i) => (
              <div key={i} style={{ width: '100%', flexShrink: 0, scrollSnapAlign: 'start', position: 'relative', height }}>
                {file.type.startsWith('video') ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <video 
                      src={file.url} 
                      autoPlay 
                      loop 
                      muted={isMuted} 
                      playsInline 
                      onClick={handleVideoClick} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
                    />
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }} 
                      style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {isMuted ? <VolumeX size={14} color="#fff" /> : <Volume2 size={14} color="#fff" />}
                    </div>
                  </div>
                ) : (
                  <img src={file.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            ))}
          </div>
          {media.length > 1 && (
            <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px', zIndex: 5 }}>
              {media.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === currentImageIndex ? 'var(--accent-blue)' : 'rgba(255,255,255,0.5)' }}></div>
              ))}
            </div>
          )}
        </div>
      );
    };

    if (previewPlatform === 'instagram') {
      if (contentType === 'reel') {
        return (
          <div style={{ position: 'relative', flex: 1, background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', color: '#fff' }}>
            {hasMedia ? (
               media[0].type.startsWith('video') ? (
                <video 
                  src={media[0].url} 
                  autoPlay 
                  loop 
                  muted={isMuted} 
                  playsInline 
                  onClick={handleVideoClick}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9, cursor: 'pointer' }} 
                />
              ) : (
                <img src={media[0].url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
              )
            ) : (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', background: '#111' }}>Instagram Reel Area</div>
            )}
            
            {/* Top volume button overlay */}
            <div 
              onClick={() => setIsMuted(!isMuted)}
              style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10, background: 'rgba(0,0,0,0.5)', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isMuted ? <VolumeX size={16} color="#fff" /> : <Volume2 size={16} color="#fff" />}
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', zIndex: 1 }} />
            
            <div style={{ position: 'relative', zIndex: 2, padding: '1rem', paddingRight: '4.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)' }}></div>
                <span>{username.toLowerCase().replace(/\s+/g, '_')}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '4px' }}>Follow</span>
              </div>
              {title && <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>{title}</div>}
              {description && <div style={{ fontSize: '0.85rem', color: '#eee', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</div>}
            </div>
            
            {/* Instagram Reels sidebar */}
            <div style={{ position: 'absolute', right: '0.75rem', bottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', zIndex: 2 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <Heart size={26} color="#fff" />
                <span style={{ fontSize: '0.75rem', color: '#fff', marginTop: '2px' }}>286K</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <MessageCircle size={26} color="#fff" />
                <span style={{ fontSize: '0.75rem', color: '#fff', marginTop: '2px' }}>1,827</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <Repeat2 size={24} color="#fff" />
                <span style={{ fontSize: '0.75rem', color: '#fff', marginTop: '2px' }}>8,889</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <Send size={26} color="#fff" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <Bookmark size={26} color="#fff" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', opacity: 0.8 }}>
                <MoreVertical size={22} color="#fff" />
              </div>
              {/* Music cover / avatar thumbnail spinner */}
              <div style={{ width: '26px', height: '26px', borderRadius: '6px', border: '2px solid #fff', background: '#333', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #bc1888, #dc2743)' }}></div>
              </div>
            </div>
          </div>
        );
      }
      if (contentType === 'quiz') {
        return (
          <div style={{ flex: 1, background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', height: '100%' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', width: '100%', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#bc1888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Instagram Poll</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a', textAlign: 'center' }}>{title || "Ask a question..."}</div>
                {description && <div style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>{description}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {quizOptions.map((opt, i) => (
                  <div key={i} style={{ 
                    padding: '0.85rem 1rem', borderRadius: '12px', border: '2px solid #efefef', fontSize: '0.95rem', fontWeight: 600, color: '#bc1888',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(188, 24, 136, 0.03)'
                  }}>
                    <span>{opt || `Option ${i+1}`}</span>
                    <span style={{ fontSize: '0.8rem', color: '#999' }}>0%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', background: isLightTheme ? '#fff' : '#000', height: '100%', color: isLightTheme ? '#000' : '#fff' }}>
          {/* Header */}
          <div style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', padding: '2px' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: isLightTheme ? '#fff' : '#000' }}></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isLightTheme ? '#000' : '#fff' }}>{username.toLowerCase().replace(/\s+/g, '_')}</span>
                <CheckCircle2 size={13} color="#0095f6" fill="#0095f6" />
                <span style={{ color: isLightTheme ? '#606060' : '#a8a8a8', fontSize: '0.75rem' }}>· 2 d</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button type="button" style={{ background: isLightTheme ? '#efefef' : '#363636', color: isLightTheme ? '#000' : '#fff', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>Follow</button>
              <MoreVertical size={18} color={isLightTheme ? '#000' : '#fff'} />
            </div>
          </div>
          {renderMediaContent('320px')}
          <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1.25rem', color: isLightTheme ? '#000' : '#fff', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <Heart size={24} color={isLightTheme ? '#000' : '#fff'} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>2.4M</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <MessageCircle size={24} color={isLightTheme ? '#000' : '#fff'} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>9.6K</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <Repeat2 size={22} color={isLightTheme ? '#000' : '#fff'} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>106.8K</span>
              </div>
              <Send size={24} color={isLightTheme ? '#000' : '#fff'} style={{ cursor: 'pointer' }} />
            </div>
            <Bookmark size={24} color={isLightTheme ? '#000' : '#fff'} style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ padding: '0 0.75rem 0.75rem', fontSize: '0.85rem', color: isLightTheme ? '#000' : '#fff', lineHeight: '1.4' }}>
            <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>{username.toLowerCase().replace(/\s+/g, '_')}</span>
            {title && <span style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>{title}</span>}
            <span style={{ whiteSpace: 'pre-wrap', color: isLightTheme ? '#262626' : '#f5f5f5' }}>{description}</span>
          </div>
        </div>
      );
    }

    if (previewPlatform === 'facebook') {
      if (contentType === 'reel') {
        return (
          <div style={{ position: 'relative', flex: 1, background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', color: '#fff' }}>
            {hasMedia ? (
              media[0].type.startsWith('video') ? (
                <video 
                  src={media[0].url} 
                  autoPlay 
                  loop 
                  muted={isMuted} 
                  playsInline 
                  onClick={handleVideoClick}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9, cursor: 'pointer' }} 
                />
              ) : (
                <img src={media[0].url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
              )
            ) : (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', background: '#111' }}>Facebook Reel Area</div>
            )}
            
            {/* Top Mute overlay button */}
            <div 
              onClick={() => setIsMuted(!isMuted)}
              style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10, background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isMuted ? <VolumeX size={18} color="#fff" /> : <Volume2 size={18} color="#fff" />}
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', zIndex: 1 }} />
            
            {/* Left Description overlay */}
            <div style={{ position: 'relative', zIndex: 2, padding: '1rem', paddingRight: '4.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1877F2' }}></div>
                <span>{username}</span>
                <Globe size={13} color="rgba(255,255,255,0.7)" />
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>· Following</span>
              </div>
              
              {/* Music info row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#ccc', marginBottom: '0.5rem' }}>
                <span>🎵</span>
                <span>Adam Griffith · Knockout</span>
              </div>

              {title && <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>{title}</div>}
              {description && <div style={{ fontSize: '0.85rem', color: '#eee', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</div>}
            </div>
            
            {/* Facebook Reels sidebar */}
            <div style={{ position: 'absolute', right: '0.75rem', bottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', zIndex: 2 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <ThumbsUp size={26} color="#fff" />
                <span style={{ fontSize: '0.75rem', color: '#fff', marginTop: '2px' }}>7</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <MessageCircle size={26} color="#fff" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <Share2 size={26} color="#fff" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', opacity: 0.8 }}>
                <MoreVertical size={22} color="#fff" />
              </div>
            </div>
          </div>
        );
      }
      if (contentType === 'quiz') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', background: '#f0f2f5', height: '100%', padding: '0.75rem' }}>
            <div style={{ background: '#fff', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1877F2' }}></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#050505' }}>{username}</div>
                  <div style={{ fontSize: '0.75rem', color: '#65676b' }}>Poll · Just now</div>
                </div>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#050505' }}>{title || "Question"}</div>
              {description && <div style={{ fontSize: '0.85rem', color: '#65676b' }}>{description}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                {quizOptions.map((opt, i) => (
                  <div key={i} style={{ 
                    padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ced0d4', fontSize: '0.9rem', color: '#050505',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: '#f0f2f5', fontWeight: 500
                  }}>
                    <span>{opt || `Option ${i+1}`}</span>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #65676b' }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', background: '#f0f2f5', height: '100%' }}>
          <div style={{ background: '#fff', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#555', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#1877F2' }}></div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#050505' }}>{username}</span>
                    <CheckCircle2 size={13} color="#1877F2" fill="#1877F2" />
                    <span style={{ fontSize: '0.85rem', color: '#1877F2', fontWeight: 600, cursor: 'pointer' }}>· Follow</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#65676b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span>9h</span>
                    <span>·</span>
                    <Globe size={12} color="#65676b" />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#65676b' }}>
                <span style={{ fontWeight: 'bold', cursor: 'pointer' }}>...</span>
                <X size={18} style={{ cursor: 'pointer' }} />
              </div>
            </div>
            
            {/* Caption */}
            <div style={{ fontSize: '0.9rem', color: '#050505', marginTop: '0.25rem' }}>
              {title && <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{title}</strong>}
              <div style={{ whiteSpace: 'pre-wrap' }}>{description}</div>
            </div>
          </div>

          {/* Media */}
          {hasMedia && (
            <div style={{ background: '#fff' }}>
              {renderMediaContent('260px')}
            </div>
          )}
          
          {/* Bottom counts and reaction bubble row */}
          <div style={{ background: '#fff', padding: '0.65rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e5e5' }}>
            <div style={{ display: 'flex', gap: '0.75rem', color: '#65676b', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <ThumbsUp size={16} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>1K</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <MessageCircle size={16} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>14</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <Share2 size={16} style={{ transform: 'scaleX(-1)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>91</span>
              </div>
            </div>
            {/* Reaction icons mockup */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '-2px' }}>
              <span style={{ fontSize: '14px', zIndex: 3 }}>😆</span>
              <span style={{ fontSize: '14px', zIndex: 2, marginLeft: '-4px' }}>👍</span>
              <span style={{ fontSize: '14px', zIndex: 1, marginLeft: '-4px' }}>❤️</span>
            </div>
          </div>
        </div>
      );
    }

    if (previewPlatform === 'x') {
      const renderXActions = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: isLightTheme ? '#536471' : '#71767b', padding: '0.5rem 0.5rem 0 0.5rem', borderTop: isLightTheme ? '1px solid #eff3f4' : '1px solid #2f3336', marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><MessageCircle size={16} /> <span style={{ fontSize: '0.75rem' }}>0</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><Repeat2 size={16} /> <span style={{ fontSize: '0.75rem' }}>0</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><Heart size={16} /> <span style={{ fontSize: '0.75rem' }}>0</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><Share2 size={16} /></div>
        </div>
      );
      if (contentType === 'quiz') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', background: isLightTheme ? '#fff' : '#000', height: '100%', padding: '0.75rem', color: isLightTheme ? '#0f172a' : '#e7e9ea' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isLightTheme ? '#cfd9de' : '#555', flexShrink: 0 }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 700, color: isLightTheme ? '#0f172a' : '#fff', fontSize: '0.9rem' }}>{username}</span>
                  <CheckCircle2 size={14} color="#1d9bf0" />
                  <span style={{ color: isLightTheme ? '#536471' : '#71767b', fontSize: '0.85rem' }}>{handle} · 1m</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: isLightTheme ? '#0f172a' : '#e7e9ea', marginTop: '0.25rem', fontWeight: 600 }}>{title || "Question"}</div>
                {description && <div style={{ fontSize: '0.85rem', color: isLightTheme ? '#536471' : '#71767b', marginTop: '0.25rem' }}>{description}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {quizOptions.map((opt, i) => (
                    <div key={i} style={{ 
                      padding: '0.65rem 0.85rem', borderRadius: '20px', border: isLightTheme ? '1px solid #cfd9de' : '1px solid #333639', fontSize: '0.85rem', color: '#1d9bf0',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'transparent', fontWeight: 700
                    }}>
                      <span>{opt || `Option ${i+1}`}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '0.8rem', color: isLightTheme ? '#536471' : '#71767b', marginTop: '0.5rem' }}>0 votes · 24 hours left</div>
                {renderXActions()}
              </div>
            </div>
          </div>
        );
      }
      if (contentType === 'reel' || contentType === 'video') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', background: isLightTheme ? '#fff' : '#000', height: '100%', padding: '0.75rem', color: isLightTheme ? '#0f172a' : '#e7e9ea' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isLightTheme ? '#cfd9de' : '#555', flexShrink: 0 }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 700, color: isLightTheme ? '#0f172a' : '#fff', fontSize: '0.9rem' }}>{username}</span>
                  <CheckCircle2 size={14} color="#1d9bf0" />
                  <span style={{ color: isLightTheme ? '#536471' : '#71767b', fontSize: '0.85rem' }}>{handle} · 1m</span>
                </div>
                {title && <div style={{ fontSize: '0.9rem', color: isLightTheme ? '#0f172a' : '#fff', fontWeight: 700, marginTop: '0.25rem' }}>{title}</div>}
                {description && <div style={{ fontSize: '0.85rem', color: isLightTheme ? '#0f172a' : '#e7e9ea', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{description}</div>}
                <div style={{ marginTop: '0.75rem', borderRadius: '16px', overflow: 'hidden', border: isLightTheme ? '1px solid #cfd9de' : '1px solid #2f3336', position: 'relative', height: '200px' }}>
                  {hasMedia ? (
                    media[0].type.startsWith('video') ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <video 
                          src={media[0].url} 
                          autoPlay 
                          loop 
                          muted={isMuted} 
                          playsInline 
                          onClick={handleVideoClick} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
                        />
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMuted(!isMuted);
                          }} 
                          style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {isMuted ? <VolumeX size={14} color="#fff" /> : <Volume2 size={14} color="#fff" />}
                        </div>
                      </div>
                    ) : (
                      <img src={media[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', background: isLightTheme ? '#f7f9f9' : '#111' }}>X Video Player</div>
                  )}
                  <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#fff', zIndex: 5 }}>0:15</div>
                </div>
                {renderXActions()}
              </div>
            </div>
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', background: isLightTheme ? '#fff' : '#000', height: '100%', padding: '0.75rem', color: isLightTheme ? '#0f172a' : '#e7e9ea' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isLightTheme ? '#cfd9de' : '#555', flexShrink: 0 }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: 700, color: isLightTheme ? '#0f172a' : '#fff', fontSize: '0.9rem' }}>{username}</span>
                <CheckCircle2 size={14} color="#1d9bf0" />
                <span style={{ color: isLightTheme ? '#536471' : '#71767b', fontSize: '0.85rem' }}>{handle} · 1m</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: isLightTheme ? '#0f172a' : '#e7e9ea', marginTop: '0.25rem' }}>
                {title && <strong style={{ display: 'block', color: isLightTheme ? '#0f172a' : '#fff', marginBottom: '0.25rem' }}>{title}</strong>}
                <div style={{ whiteSpace: 'pre-wrap' }}>{description}</div>
              </div>
              {hasMedia && (
                <div style={{ marginTop: '0.75rem' }}>
                  {renderMediaContent('200px', '16px')}
                </div>
              )}
              {renderXActions()}
            </div>
          </div>
        </div>
      );
    }

    if (previewPlatform === 'youtube') {
      if (contentType === 'reel') {
        return (
          <div style={{ position: 'relative', flex: 1, background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', color: '#fff' }}>
            {hasMedia ? (
              media[0].type.startsWith('video') ? (
                <video 
                  src={media[0].url} 
                  autoPlay 
                  loop 
                  muted={isMuted} 
                  playsInline 
                  onClick={handleVideoClick}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9, cursor: 'pointer' }} 
                />
              ) : (
                <img src={media[0].url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
              )
            ) : (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', background: '#111' }}>YouTube Short Area</div>
            )}
            
            {/* Top controls overlay */}
            <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={16} fill="#fff" color="#fff" /></div>
                <div 
                  onClick={() => setIsMuted(!isMuted)}
                  style={{ background: 'rgba(0,0,0,0.5)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {isMuted ? <VolumeX size={16} color="#fff" /> : <Volume2 size={16} color="#fff" />}
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MoreVertical size={16} color="#fff" />
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', zIndex: 1 }} />
            
            {/* Bottom Left Channel + Title Overlay */}
            <div style={{ position: 'relative', zIndex: 2, padding: '1rem', paddingRight: '4.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#ff0000', flexShrink: 0 }}></div>
                <span style={{ fontSize: '0.85rem' }}>@{username.toLowerCase().replace(/\s+/g, '')}</span>
                <button type="button" style={{ background: '#fff', color: '#000', border: 'none', padding: '4px 12px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Subscribe</button>
              </div>
              {title && <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>{title}</div>}
              {description && <div style={{ fontSize: '0.85rem', color: '#eee', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</div>}
            </div>
            
            {/* Right Sidebar buttons */}
            <div style={{ position: 'absolute', right: '0.75rem', bottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', zIndex: 2 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%' }}><ThumbsUp size={22} color="#fff" /></div>
                <span style={{ fontSize: '0.75rem', color: '#fff', marginTop: '4px' }}>117k</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%' }}><ThumbsDown size={22} color="#fff" /></div>
                <span style={{ fontSize: '0.75rem', color: '#fff', marginTop: '4px' }}>Dislike</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%' }}><MessageCircle size={22} color="#fff" /></div>
                <span style={{ fontSize: '0.75rem', color: '#fff', marginTop: '4px' }}>643</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%', transform: 'scaleX(-1)' }}><Share2 size={22} color="#fff" /></div>
                <span style={{ fontSize: '0.75rem', color: '#fff', marginTop: '4px' }}>Share</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%' }}><Repeat2 size={22} color="#fff" /></div>
                <span style={{ fontSize: '0.75rem', color: '#fff', marginTop: '4px' }}>Remix</span>
              </div>
              {/* Profile icon spinner */}
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', border: '2px solid #fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
                <div style={{ width: '100%', height: '100%', background: '#ff0000' }}></div>
              </div>
            </div>
          </div>
        );
      }
      if (contentType === 'video') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', background: isLightTheme ? '#fff' : '#0f0f0f', height: '100%', color: isLightTheme ? '#0f0f0f' : '#fff', overflowY: 'auto' }}>
            <div style={{ position: 'relative', width: '100%', height: '180px', background: '#000', flexShrink: 0 }}>
              {thumbnail ? (
                <img src={thumbnail.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : hasMedia ? (
                media[0].type.startsWith('video') ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <video 
                      src={media[0].url} 
                      autoPlay 
                      loop 
                      muted={isMuted} 
                      playsInline 
                      onClick={handleVideoClick} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
                    />
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }} 
                      style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {isMuted ? <VolumeX size={14} color="#fff" /> : <Volume2 size={14} color="#fff" />}
                    </div>
                  </div>
                ) : (
                  <img src={media[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>YouTube Player</div>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.2)' }}>
                <div style={{ width: '30%', height: '100%', background: '#ff0000' }}></div>
              </div>
            </div>
            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: isLightTheme ? '#0f0f0f' : '#fff', lineHeight: '1.3' }}>{title || "Video Title"}</div>
              <div style={{ fontSize: '0.75rem', color: isLightTheme ? '#606060' : '#aaa' }}>12 views · 1 minute ago</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ff0000' }}></div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isLightTheme ? '#0f0f0f' : '#fff' }}>{username}</div>
                    <div style={{ fontSize: '0.7rem', color: isLightTheme ? '#606060' : '#aaa' }}>1.2k subscribers</div>
                  </div>
                </div>
                <button type="button" style={{ background: isLightTheme ? '#0f0f0f' : '#fff', color: isLightTheme ? '#fff' : '#0f0f0f', border: 'none', padding: '6px 12px', borderRadius: '18px', fontSize: '0.8rem', fontWeight: 600 }}>Subscribe</button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '0.25rem' }}>
                <div style={{ background: isLightTheme ? '#f2f2f2' : 'rgba(255,255,255,0.1)', color: isLightTheme ? '#0f0f0f' : '#fff', padding: '6px 12px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>👍 12</div>
                <div style={{ background: isLightTheme ? '#f2f2f2' : 'rgba(255,255,255,0.1)', color: isLightTheme ? '#0f0f0f' : '#fff', padding: '6px 12px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>Share</div>
                <div style={{ background: isLightTheme ? '#f2f2f2' : 'rgba(255,255,255,0.1)', color: isLightTheme ? '#0f0f0f' : '#fff', padding: '6px 12px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>Download</div>
              </div>
              <div style={{ background: isLightTheme ? '#f2f2f2' : 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontWeight: 600, color: isLightTheme ? '#0f0f0f' : '#fff' }}>Description</span>
                <span style={{ color: isLightTheme ? '#4a4a4a' : '#eee', whiteSpace: 'pre-wrap' }}>{description || "No description provided."}</span>
              </div>
            </div>
          </div>
        );
      }
      if (contentType === 'quiz') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', background: isLightTheme ? '#fff' : '#0f0f0f', height: '100%', color: isLightTheme ? '#0f0f0f' : '#fff', padding: '0.75rem' }}>
            <div style={{ background: isLightTheme ? '#f9f9f9' : '#212121', border: isLightTheme ? '1px solid #e5e5e5' : 'none', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ff0000' }}></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isLightTheme ? '#0f0f0f' : '#fff' }}>{username}</div>
                  <div style={{ fontSize: '0.7rem', color: isLightTheme ? '#606060' : '#aaa' }}>1 hour ago</div>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: isLightTheme ? '#0f0f0f' : '#fff' }}>{title || "Question"}</div>
              {description && <div style={{ fontSize: '0.8rem', color: isLightTheme ? '#606060' : '#aaa' }}>{description}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {quizOptions.map((opt, i) => (
                  <div key={i} style={{ 
                    padding: '0.75rem 1rem', borderRadius: '4px', border: isLightTheme ? '1px solid #ccc' : '1px solid #3d3d3d', fontSize: '0.85rem', color: isLightTheme ? '#0f0f0f' : '#fff',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'transparent'
                  }}>
                    <span>{opt || `Option ${i+1}`}</span>
                    <span style={{ color: isLightTheme ? '#606060' : '#aaa', fontSize: '0.75rem' }}>0%</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', color: isLightTheme ? '#606060' : '#aaa' }}>0 votes</div>
            </div>
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', background: isLightTheme ? '#fff' : '#0f0f0f', height: '100%', color: isLightTheme ? '#0f0f0f' : '#fff', padding: '0.75rem' }}>
          <div style={{ background: isLightTheme ? '#fff' : '#0f0f0f', border: isLightTheme ? '1px solid #e5e5e5' : '1px solid #272727', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#555', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#ff0000' }}></div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isLightTheme ? '#0f0f0f' : '#fff', textTransform: 'uppercase' }}>{username}</div>
                  <div style={{ fontSize: '0.75rem', color: isLightTheme ? '#606060' : '#aaa', marginTop: '2px' }}>1 second ago</div>
                </div>
              </div>
              <MoreVertical size={16} color={isLightTheme ? '#606060' : '#aaa'} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ fontSize: '0.9rem', color: isLightTheme ? '#0f0f0f' : '#fff', marginTop: '0.25rem' }}>
              {title && <strong style={{ display: 'block', color: isLightTheme ? '#0f0f0f' : '#fff', marginBottom: '0.25rem' }}>{title}</strong>}
              <div style={{ whiteSpace: 'pre-wrap' }}>{description}</div>
            </div>
            {hasMedia && (
              <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '0.5rem' }}>
                {renderMediaContent('220px')}
              </div>
            )}
            {/* Bottom Actions matching Image 3 */}
            <div style={{ display: 'flex', gap: '1.75rem', color: isLightTheme ? '#606060' : '#fff', fontSize: '0.95rem', borderTop: isLightTheme ? '1px solid #e5e5e5' : '1px solid #272727', paddingTop: '0.75rem', marginTop: '0.5rem', paddingLeft: '0.25rem' }}>
              <ThumbsUp size={18} style={{ cursor: 'pointer' }} />
              <ThumbsDown size={18} style={{ cursor: 'pointer' }} />
              <Share2 size={18} style={{ cursor: 'pointer' }} />
              <MessageCircle size={18} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', color: '#000', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#555' }}></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{username}</div>
            <div style={{ fontSize: '0.7rem', color: '#666' }}>{previewPlatform.toUpperCase()} Preview</div>
          </div>
        </div>
        {title && <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{title}</div>}
        {description && <div style={{ fontSize: '0.9rem', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{description}</div>}
        {hasMedia && renderMediaContent('200px', '8px')}
      </div>
    );
  };

  const [platformContents, setPlatformContents] = useState(() => {
    if (editPost) {
      return { universal: { title: '', description: editPost.content || '' } };
    }
    return { universal: { title: '', description: '' } };
  });
  const [activeTab, setActiveTab] = useState('universal');
  const [platformMedia, setPlatformMedia] = useState(() => {
    if (editPost) {
      if (editPost.platformMedia) return editPost.platformMedia;
      if (editPost.media) return { universal: editPost.media };
    }
    return { universal: [] };
  });
  
  const media = platformMedia[activeTab] !== undefined 
    ? platformMedia[activeTab] 
    : (platformMedia.universal || []);
  
  const [thumbnail, setThumbnail] = useState(() => {
    if (editPost && editPost.thumbnail) {
      return editPost.thumbnail;
    }
    return null;
  });

  const handleThumbnailUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail({
        url: URL.createObjectURL(file),
        type: file.type,
        rawFile: file
      });
      e.target.value = '';
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
  };
  
  const [allAccounts, setAllAccounts] = useState([]);
  useEffect(() => {
    const loadConnections = () => {
      const savedConnections = JSON.parse(localStorage.getItem('connectedAccounts') || '[]');
      setAllAccounts(platformDefinitions.map(def => ({ ...def, connected: savedConnections.includes(def.id) })));
      setSelectedTargets(prev => prev.filter(pId => savedConnections.includes(pId)));
    };
    loadConnections();
    window.addEventListener('accounts-updated', loadConnections);
    return () => window.removeEventListener('accounts-updated', loadConnections);
  }, []);

  const connectedAccounts = allAccounts.filter(a => a.connected);
  
  const [selectedTargets, setSelectedTargets] = useState(() => {
    if (editPost) return editPost.platforms || [];
    return JSON.parse(localStorage.getItem('connectedAccounts') || '[]');
  });
  
  const [contentType, setContentType] = useState(() => {
    if (editPost) return editPost.type || 'post';
    return 'post';
  }); 
  const [quizOptions, setQuizOptions] = useState(['Option 1', 'Option 2']);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [visibility, setVisibility] = useState(() => {
    if (editPost && editPost.visibility) return editPost.visibility;
    return 'public';
  });

  const handleVideoClick = (e) => {
    const video = e.target;
    if (video.paused) {
      video.play().catch(err => console.log("Failed to play video:", err));
    } else {
      video.pause();
    }
  };

  const [previewPlatform, setPreviewPlatform] = useState(() => {
    if (editPost && editPost.platforms && editPost.platforms.length > 0) return editPost.platforms[0];
    return 'instagram';
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Scheduling State
  const [scheduleDate, setScheduleDate] = useState(() => {
    if (editPost && editPost.status === 'scheduled' && editPost.date) {
      return new Date(editPost.date).toISOString().substring(0, 10);
    }
    return '';
  });
  const [scheduleTime, setScheduleTime] = useState(() => {
    if (editPost && editPost.status === 'scheduled' && editPost.date) {
      return new Date(editPost.date).toTimeString().substring(0, 5);
    }
    return '';
  });
  const [isScheduled, setIsScheduled] = useState(() => {
    if (editPost && editPost.status === 'scheduled') return true;
    return false;
  });

  // Hashtags Dropdown State
  const [showHashtags, setShowHashtags] = useState(false);
  const [hashtagSearchTopic, setHashtagSearchTopic] = useState('');
  const hashtagsRef = useRef(null);

  const getIndividualHashtags = () => {
    if (!hashtagSearchTopic || hashtagSearchTopic.trim() === '') {
      const defaultTags = '#trending #viral #explore #fyp #post #social #media #connect #sharevix';
      return defaultTags.split(/\s+/).map(tag => ({ tag, category: 'Popular' }));
    }

    const cleanQuery = hashtagSearchTopic.toLowerCase().trim();

    // 1. Search in repository by matching label or keywords
    const matches = hashtagRepository.filter(item =>
      item.label.toLowerCase().includes(cleanQuery) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(cleanQuery))
    );

    let tagString = '';
    let categoryName = 'Topic Match';

    if (matches.length > 0) {
      tagString = matches.map(m => m.tags).join(' ');
      categoryName = matches[0].label;
    } else {
      // 2. If no matches, generate custom hashtags dynamically based on topic
      const words = cleanQuery.split(/\s+/).filter(w => w.length > 0);
      const mainTag = words.map(w => w.replace(/[^a-zA-Z0-9]/g, '')).join('');
      if (mainTag.length > 0) {
        tagString = `#${mainTag} #${mainTag}life #${mainTag}trending #${mainTag}community #${mainTag}goals #trending #explore #viral #fyp`;
        categoryName = `Generated (${hashtagSearchTopic})`;
      }
    }

    if (!tagString) return [];

    const uniqueTags = Array.from(new Set(tagString.split(/\s+/).filter(t => t.startsWith('#'))));
    return uniqueTags.map(tag => ({ tag, category: categoryName, isGenerated: categoryName.startsWith('Generated') }));
  };

  const individualHashtags = getIndividualHashtags();

  const handleHashtagToggle = (tag) => {
    const current = platformContents[activeTab] || platformContents.universal;
    const desc = current.description || '';
    const words = desc.split(/\s+/);
    
    if (words.includes(tag)) {
      const filteredWords = words.filter(word => word !== tag);
      handleContentChange('description', filteredWords.join(' ').trim());
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { type: 'success', message: `Removed ${tag}` } 
      }));
    } else {
      const separator = desc === '' ? '' : (desc.endsWith(' ') || desc.endsWith('\n') ? '' : ' ');
      handleContentChange('description', desc + separator + tag);
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { type: 'success', message: `Added ${tag}` } 
      }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hashtagsRef.current && !hashtagsRef.current.contains(event.target)) {
        setShowHashtags(false);
        setHashtagSearchTopic('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTarget = (id) => {
    setSelectedTargets(prev => {
      const next = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
      if (next.length > 0 && !next.includes(previewPlatform)) setPreviewPlatform(next[0]);
      return next;
    });
  };

  const handleTypeChange = (type) => {
    if (type === 'reel' && contentType !== 'reel') {
      setPlatformMedia({ universal: [] });
    } else if (type === 'quiz') {
      setPlatformMedia({ universal: [] });
    } else if (type === 'video') {
      setPlatformMedia({ universal: [] });
      setSelectedTargets(['youtube']);
      setPreviewPlatform('youtube');
    }
    setContentType(type);
  };

  const handleMediaUpload = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        url: URL.createObjectURL(file),
        type: file.type,
        rawFile: file
      }));
      setPlatformMedia(prev => {
        const currentTabMedia = prev[activeTab] !== undefined 
          ? prev[activeTab] 
          : [...(prev.universal || [])];
        return {
          ...prev,
          [activeTab]: [...currentTabMedia, ...filesArray]
        };
      });
      e.target.value = '';
    }
  };

  const removeMedia = (indexToRemove) => {
    setPlatformMedia(prev => {
      const currentTabMedia = prev[activeTab] !== undefined 
        ? prev[activeTab] 
        : [...(prev.universal || [])];
      return {
        ...prev,
        [activeTab]: currentTabMedia.filter((_, idx) => idx !== indexToRemove)
      };
    });
    setIsPublishing(false);
  };

  const handleContentChange = (field, value) => {
    setPlatformContents(prev => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || prev.universal),
        [field]: value
      }
    }));
  };

  const appendHashtags = (tags) => {
    const current = platformContents[activeTab] || platformContents.universal;
    handleContentChange('description', (current.description ? current.description + '\n\n' : '') + tags);
    setShowHashtags(false);
    setHashtagSearchTopic('');
  };

  const generateWithAI = () => {
    const currentData = platformContents[activeTab] || platformContents.universal;
    const baseText = currentData.title || currentData.description;
    
    if (!baseText || baseText.trim().length < 5) {
      window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'error', message: 'Please type a few words first!' }}));
      return;
    }

    setIsGenerating(true);
    const keywords = baseText.split(' ').filter(w => w.length > 3).slice(0, 3);
    const tags = keywords.map(k => `#${k.replace(/[^a-zA-Z]/g, '')}`).join(' ');
    
    const generatedTitle = `✨ ${baseText.split(' ').slice(0, 5).join(' ')}...`;
    
    const expansion = contentType === 'quiz' 
      ? "\n\nLet's settle this! Drop your vote in the poll below. 👇\n" 
      : "\n\nWe're so excited to share this with you. Let us know your thoughts in the comments below! 👇\n";

    const generatedDescription = `${baseText}${expansion}\n${tags} #Sharevix`;
    
    setPlatformContents(prev => ({ ...prev, [activeTab]: { title: '', description: '' } }));
    
    let i = 0;
    const totalLength = Math.max(generatedTitle.length, generatedDescription.length);
    
    const interval = setInterval(() => {
      setPlatformContents(prev => ({ 
        ...prev, 
        [activeTab]: { 
          title: generatedTitle.substring(0, i), 
          description: generatedDescription.substring(0, i) 
        } 
      }));
      i++;
      if (i > totalLength) {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 15);
  };

  const handlePublish = async (status) => {
    const getPlatformContent = (platformId) => {
      const specific = platformContents[platformId];
      if (specific && (specific.title || specific.description)) {
        return specific;
      }
      return platformContents.universal || { title: '', description: '' };
    };

    const getPlatformMedia = (platformId) => {
      if (platformMedia[platformId] !== undefined) {
        return platformMedia[platformId];
      }
      return platformMedia.universal || [];
    };

    const cur = platformContents.universal || { title: '', description: '' };
    const hasAnyMedia = Object.values(platformMedia).some(m => m && m.length > 0);
    const hasContent = Object.values(platformContents).some(c => c && (c.title || c.description)) || hasAnyMedia || contentType === 'quiz';
    if (!hasContent && status !== 'draft') return;
    if (selectedTargets.length === 0 && status !== 'draft') return;
    if (isOverLimit) {
      window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'error', message: 'Character limit exceeded for selected platforms!' }}));
      return;
    }

    setIsPublishing(true);
    
    try {
      // X and Threads bypass the unsupported error block and publish in simulation mode
      let publishDate = new Date().toISOString();
      if (status === 'scheduled' && scheduleDate && scheduleTime) {
        publishDate = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      }

      let finalContent = `${cur.title ? cur.title + '\n' : ''}${cur.description || ''}`;
      if (!finalContent.trim()) {
        const platformOverride = Object.keys(platformContents).find(key => key !== 'universal' && (platformContents[key]?.title || platformContents[key]?.description));
        if (platformOverride) {
          const spec = platformContents[platformOverride];
          finalContent = `${spec.title ? spec.title + '\n' : ''}${spec.description || ''}`;
        }
      }

      let uploadedThumbnail = null;
      if (contentType === 'reel' && thumbnail) {
        if (thumbnail.url.startsWith('http') && !thumbnail.url.startsWith('blob:')) {
          uploadedThumbnail = thumbnail;
        } else {
          const downloadUrl = await dbService.uploadFile(thumbnail.rawFile || thumbnail.url);
          uploadedThumbnail = {
            type: thumbnail.type,
            url: downloadUrl
          };
        }
      }

      // Upload media for all platforms
      const uploadedPlatformMedia = {};
      for (const platformId of Object.keys(platformMedia)) {
        const platformFiles = platformMedia[platformId];
        if (platformFiles && platformFiles.length > 0) {
          uploadedPlatformMedia[platformId] = await Promise.all(
            platformFiles.map(async (file) => {
              if (file.url.startsWith('http') && !file.url.startsWith('blob:')) {
                return file;
              }
              const downloadUrl = await dbService.uploadFile(file.rawFile || file.url);
              return {
                type: file.type,
                url: downloadUrl
              };
            })
          );
        }
      }

      const activeMedia = getPlatformMedia(activeTab);
      const postData = {
        date: publishDate,
        content: finalContent || (activeMedia.length > 0 ? '[Media Post]' : '[No Content]'),
        platforms: status === 'draft' ? [] : selectedTargets,
        type: contentType,
        status: status, // 'published', 'scheduled', or 'draft'
        media: uploadedPlatformMedia.universal || [],
        platformMedia: uploadedPlatformMedia,
        thumbnail: uploadedThumbnail,
        visibility: visibility
      };

      // Direct Real-time Facebook API Posting with auto-resolving Page ID and Page Access Token
      if (status === 'published' && selectedTargets.includes('facebook')) {
        let pageId = localStorage.getItem('fb_page_id');
        let token = localStorage.getItem('fb_access_token');
        
        if (!token) {
          throw new Error("Facebook Access Token is missing. Please add it under Accounts page.");
        }
        
        try {
          try {
            const accountsRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${token}`);
            const accountsData = await accountsRes.json();
            if (accountsRes.ok && accountsData.data && accountsData.data.length > 0) {
              pageId = accountsData.data[0].id;
              token = accountsData.data[0].access_token;
              console.log(`Auto-resolved Page: ${accountsData.data[0].name} (ID: ${pageId})`);
            } else if (!accountsRes.ok) {
              console.error("Failed to query Facebook pages:", accountsData);
              throw accountsData.error || new Error(accountsData.error?.message || "Failed to retrieve Facebook pages associated with this token.");
            } else if (accountsData.data && accountsData.data.length === 0) {
              throw new Error("No Facebook Pages found associated with this Meta User token. API posting only works for Facebook Pages, not personal profiles.");
            }
          } catch (err) {
            console.warn("Auto-resolve warning:", err);
            if (isFacebookTokenError(err)) {
              throw err;
            }
            if (!pageId) {
              throw new Error(`Facebook page resolution failed: ${err.message || err}. Please configure a valid Page ID manually.`);
            }
          }

          if (!pageId || !token) {
            throw new Error("Facebook Page ID or Page Access Token is not configured. Please add them under Accounts page.");
          }

          const fbContent = getPlatformContent('facebook');
          const postText = `${fbContent.title ? fbContent.title + '\n' : ''}${fbContent.description || ''}`;
          const fbMedia = getPlatformMedia('facebook');
          const fbUploadedMedia = uploadedPlatformMedia.facebook !== undefined ? uploadedPlatformMedia.facebook : (uploadedPlatformMedia.universal || []);

          if (!postText.trim() && fbMedia.length === 0) {
            throw new Error("The post content is empty. Please enter some text or add media.");
          }

          let resData;
          if (pageId === '123456789012345' || token.startsWith('mock_')) {
            throw new Error("Facebook is connected in Mock/Sandbox simulation. Please reconnect your real Facebook Page under Accounts page.");
          } else {
            let res;
            if (editPost && editPost.fb_post_id) {
              res = await fetch(`https://graph.facebook.com/v18.0/${editPost.fb_post_id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: postText,
                  access_token: token
                })
              });
            } else if (fbMedia.length > 0) {
              const file = fbMedia[0];
              const fileBlob = file.rawFile || (await fetch(file.url).then(r => r.blob()));
              const formData = new FormData();
              formData.append('access_token', token);
              
              if (file.type.startsWith('video')) {
                formData.append('source', fileBlob);
                formData.append('description', postText);
                res = await fetch(`https://graph-video.facebook.com/v18.0/${pageId}/videos`, {
                  method: 'POST',
                  body: formData
                });
              } else {
                formData.append('source', fileBlob);
                formData.append('caption', postText);
                res = await fetch(`https://graph.facebook.com/v18.0/${pageId}/photos`, {
                  method: 'POST',
                  body: formData
                });
              }
            } else {
              res = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: postText,
                  access_token: token
                })
              });
            }
            resData = await res.json();
            if (!res.ok) {
              console.error("Facebook API error:", resData);
              throw resData.error || new Error(resData.error?.message || "Failed to publish to Facebook Graph API");
            }
          }
          console.log("Published successfully to Facebook Page API!", resData);
          if (resData.id) {
            postData.fb_post_id = resData.id;
          }
        } catch (fbApiErr) {
          console.error("Facebook API error:", fbApiErr);
          if (isFacebookTokenError(fbApiErr)) {
            disconnectFacebookAndInstagram();
            throw new Error("Your Facebook session has expired. The account has been automatically disconnected. Please reconnect on the Accounts page.");
          }
          throw new Error(`Facebook API posting failed: ${fbApiErr.message || fbApiErr}`);
        }
      }

      // Direct Real-time Instagram API Posting with auto-resolving Instagram Business Account and Page Access Token
      if (status === 'published' && selectedTargets.includes('instagram')) {
        let pageId = localStorage.getItem('fb_page_id');
        let token = localStorage.getItem('fb_access_token');
        
        if (!token) {
          throw new Error("Instagram connected access token is missing. Please connect your Meta/Instagram account under Accounts page.");
        }

        // Auto-resolve Page ID if not configured
        if (!pageId) {
          try {
            const accountsRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${token}`);
            const accountsData = await accountsRes.json();
            if (accountsRes.ok && accountsData.data && accountsData.data.length > 0) {
              pageId = accountsData.data[0].id;
              token = accountsData.data[0].access_token;
            } else if (!accountsRes.ok) {
              throw accountsData.error || new Error(accountsData.error?.message || "Failed to query Facebook pages");
            }
          } catch (err) {
            console.warn("Auto-resolve Page ID failed:", err);
            if (isFacebookTokenError(err)) {
              disconnectFacebookAndInstagram();
              throw new Error("Your Facebook/Instagram session has expired. The account has been automatically disconnected. Please reconnect on the Accounts page.");
            }
          }
        }

        try {
          if (!pageId || !token) {
            throw new Error("Meta/Instagram Page ID or Access Token is not configured. Please add them under Accounts page.");
          }

          const igContent = getPlatformContent('instagram');
          const postText = `${igContent.title ? igContent.title + '\n' : ''}${igContent.description || ''}`;

          let igBusinessAccountId = localStorage.getItem('ig_business_account_id');

          if (!igBusinessAccountId) {
            try {
              const pageRes = await fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${token}`);
              const pageData = await pageRes.json();
              if (pageRes.ok && pageData.instagram_business_account) {
                igBusinessAccountId = pageData.instagram_business_account.id;
                localStorage.setItem('ig_business_account_id', igBusinessAccountId);
              } else if (!pageRes.ok) {
                throw pageData.error || new Error(pageData.error?.message || "Failed to resolve Instagram account");
              } else {
                throw new Error("No linked Instagram Business Account was found on this Facebook Page.");
              }
            } catch (err) {
              console.error("Failed to resolve Instagram Business Account:", err);
              if (isFacebookTokenError(err)) {
                throw err;
              }
              throw new Error(`Failed to resolve Instagram Business Account: ${err.message || err}`);
            }
          }

          {
            // Real Instagram Publishing
            // Real Instagram Publishing
            const igMedia = getPlatformMedia('instagram');
            const igUploadedMedia = uploadedPlatformMedia.instagram !== undefined ? uploadedPlatformMedia.instagram : (uploadedPlatformMedia.universal || []);

            if (igMedia.length === 0) {
              throw new Error("Instagram requires at least one photo or video to publish.");
            }

            const fileUrl = igUploadedMedia[0].url;
            const isVideo = igUploadedMedia[0].type.startsWith('video');

            // 2. Create Media Container
            let containerUrl = `https://graph.facebook.com/v18.0/${igBusinessAccountId}/media?caption=${encodeURIComponent(postText)}&access_token=${token}`;
            if (isVideo) {
              containerUrl += `&video_url=${encodeURIComponent(fileUrl)}&media_type=VIDEO`;
            } else {
              containerUrl += `&image_url=${encodeURIComponent(fileUrl)}`;
            }

            const containerRes = await fetch(containerUrl, { method: 'POST' });
            const containerData = await containerRes.json();
            if (!containerRes.ok) {
              throw containerData.error || new Error(containerData.error?.message || "Failed to create Instagram media container.");
            }

            const containerId = containerData.id;

            // 3. For videos, wait for container status to be finished (Instagram processes video)
            if (isVideo) {
              let status = 'IN_PROGRESS';
              let retries = 0;
              while (status === 'IN_PROGRESS' && retries < 10) {
                await new Promise(r => setTimeout(r, 5000));
                const statusRes = await fetch(`https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${token}`);
                const statusData = await statusRes.json();
                if (!statusRes.ok) {
                  throw statusData.error || new Error(statusData.error?.message || "Failed to check Instagram video status");
                }
                status = statusData.status_code;
                retries++;
              }
              if (status !== 'FINISHED') {
                throw new Error("Instagram video processing timed out or failed.");
              }
            }

            // 4. Publish Container
            const publishRes = await fetch(`https://graph.facebook.com/v18.0/${igBusinessAccountId}/media_publish?creation_id=${containerId}&access_token=${token}`, { method: 'POST' });
            const publishData = await publishRes.json();
            if (!publishRes.ok) {
              throw publishData.error || new Error(publishData.error?.message || "Failed to publish Instagram media container.");
            }

            console.log("Published successfully to Instagram!", publishData);
            if (publishData.id) {
              postData.ig_post_id = publishData.id;
            }
          }
        } catch (igApiErr) {
          console.error("Instagram API error:", igApiErr);
          if (isFacebookTokenError(igApiErr)) {
            disconnectFacebookAndInstagram();
            throw new Error("Your Facebook/Instagram session has expired. The account has been automatically disconnected. Please reconnect on the Accounts page.");
          }
          throw new Error(`Instagram API posting failed: ${igApiErr.message || igApiErr}`);
        }
      }

      // Direct Real-time YouTube API Uploading
      if (status === 'published' && selectedTargets.includes('youtube')) {
        const token = localStorage.getItem('youtube_access_token');
        if (!token) {
          throw new Error("YouTube Access Token is missing. Please connect your YouTube account under Accounts page.");
        }

        try {
          const ytContent = getPlatformContent('youtube');
          const ytMedia = getPlatformMedia('youtube');

          if (ytMedia.length === 0) {
            throw new Error("YouTube requires at least one video to publish.");
          }

          const file = ytMedia[0];
          const fileBlob = file.rawFile || (await fetch(file.url).then(r => r.blob()));

          if (!fileBlob.type.startsWith('video')) {
            throw new Error("YouTube only supports video uploads. Please select a video file.");
          }

          // Construct YouTube video metadata
          const ytPrivacy = visibility === 'unlisted' ? 'unlisted' : visibility === 'private' ? 'private' : 'public';
          const metadata = {
            snippet: {
              title: ytContent.title || "Uploaded via Sharevix",
              description: ytContent.description || "",
              categoryId: "22" // People & Blogs
            },
            status: {
              privacyStatus: ytPrivacy
            }
          };

           // Build Google multipart upload request
          const boundary = '-------314159265358979323846';
          const delimiter = "\r\n--" + boundary + "\r\n";
          const close_delim = "\r\n--" + boundary + "--";

          const metadataPart = 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) + '\r\n';
          const mediaHeader = 'Content-Type: ' + fileBlob.type + '\r\n\r\n';

          const preBlob = new Blob([
            delimiter,
            metadataPart,
            delimiter,
            mediaHeader
          ]);
          const postBlob = new Blob([
            close_delim
          ]);

          const multipartBodyBlob = new Blob([preBlob, fileBlob, postBlob], {
            type: 'multipart/related; boundary=' + boundary
          });

          const uploadRes = await fetch(
            'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/related; boundary=' + boundary
              },
              body: multipartBodyBlob
            }
          );

          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) {
            throw uploadData.error || new Error(uploadData.error?.message || "Failed to upload video to YouTube.");
          }

          console.log("Published successfully to YouTube!", uploadData);
          if (uploadData.id) {
            postData.yt_post_id = uploadData.id;
          }
        } catch (ytApiErr) {
          console.error("YouTube API error:", ytApiErr);
          if (isGoogleTokenError(ytApiErr)) {
            disconnectYouTube();
            throw new Error("Your YouTube session has expired. The account has been automatically disconnected. Please reconnect on the Accounts page.");
          }
          throw new Error(`YouTube upload failed: ${ytApiErr.message || ytApiErr}`);
        }
      }

      // Direct Real-time Threads API Publishing
      if (status === 'published' && selectedTargets.includes('threads')) {
        const token = localStorage.getItem('threads_access_token');
        const userId = localStorage.getItem('threads_user_id');

        if (!token || !userId) {
          throw new Error("Threads access credentials are missing. Please connect your Threads account under Accounts page.");
        }

        try {
          const threadsContent = getPlatformContent('threads');
          const postText = `${threadsContent.title ? threadsContent.title + '\n' : ''}${threadsContent.description || ''}`;

          if (!postText.trim() && getPlatformMedia('threads').length === 0) {
            throw new Error("Threads post content is empty. Please enter some text or add media.");
          }

          if (postText.length > 500) {
            throw new Error("Threads post text exceeds the maximum character limit of 500 characters.");
          }

          const threadsMedia = getPlatformMedia('threads');
          const threadsUploadedMedia = uploadedPlatformMedia.threads !== undefined ? uploadedPlatformMedia.threads : (uploadedPlatformMedia.universal || []);

          const params = {
            text: postText,
            access_token: token
          };
          let isVideo = false;
          let isImage = false;

          if (threadsMedia.length > 0) {
            const fileUrl = threadsUploadedMedia[0].url;
            isVideo = threadsUploadedMedia[0].type.startsWith('video');
            isImage = threadsUploadedMedia[0].type.startsWith('image');

            if (isVideo) {
              params.media_type = 'VIDEO';
              params.video_url = fileUrl;
            } else if (isImage) {
              params.media_type = 'IMAGE';
              params.image_url = fileUrl;
            }
          } else {
            params.media_type = 'TEXT';
          }

          // 1. Create Media Container via Vercel proxy
          const containerRes = await fetch('/api/threads-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              path: `/${userId}/threads`,
              targetMethod: 'POST',
              params
            })
          });
          const containerData = await containerRes.json();
          if (!containerRes.ok) {
            throw containerData.error || new Error(containerData.error?.message || "Failed to create Threads media container.");
          }

          const containerId = containerData.id;

          // 2. If it has media (especially videos), poll for container processing status
          if (threadsMedia.length > 0) {
            let mediaStatus = 'IN_PROGRESS';
            let retries = 0;
            const maxRetries = 15; // 15 retries * 4 seconds = 60 seconds

            while (mediaStatus === 'IN_PROGRESS' && retries < maxRetries) {
              await new Promise(r => setTimeout(r, 4000));
              const statusRes = await fetch('/api/threads-proxy', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  path: `/${containerId}`,
                  targetMethod: 'GET',
                  params: {
                    fields: 'status,error_message',
                    access_token: token
                  }
                })
              });
              const statusData = await statusRes.json();
              if (!statusRes.ok) {
                throw statusData.error || new Error(statusData.error?.message || "Failed to check Threads media processing status");
              }
              mediaStatus = statusData.status;
              if (mediaStatus === 'ERROR') {
                throw new Error(`Threads media processing failed: ${statusData.error_message || 'Unknown error'}`);
              }
              retries++;
            }
            if (mediaStatus !== 'FINISHED' && mediaStatus !== 'PUBLISHED') {
              throw new Error("Threads media processing timed out. Please try posting again.");
            }
          }

          // 3. Publish Container via Vercel proxy
          const publishRes = await fetch('/api/threads-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              path: `/${userId}/threads_publish`,
              targetMethod: 'POST',
              params: {
                creation_id: containerId,
                access_token: token
              }
            })
          });
          const publishData = await publishRes.json();
          if (!publishRes.ok) {
            throw publishData.error || new Error(publishData.error?.message || "Failed to publish Threads media container.");
          }

          console.log("Published successfully to Threads!", publishData);
          if (publishData.id) {
            postData.threads_post_id = publishData.id;
          }
        } catch (threadsApiErr) {
          console.error("Threads API error:", threadsApiErr);
          throw new Error(`Threads API posting failed: ${threadsApiErr.message || threadsApiErr}`);
        }
      }

      // Simulated X (Twitter) Publishing
      if (status === 'published' && selectedTargets.includes('x')) {
        throw new Error("X (Twitter) integration is currently coming soon and simulated posting is disabled.");
      }

      if (editPost && editPost.id) {
        await dbService.deletePost(editPost.id);
      }
      await dbService.addPost(postData);

      let msg = `Successfully published!`;
      if (status === 'scheduled') msg = `Successfully scheduled for ${scheduleDate}!`;
      if (status === 'draft') msg = `Successfully saved to drafts!`;

      window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'success', message: msg } }));

      setPlatformContents({ universal: { title: '', description: '' } });
      setPlatformMedia({ universal: [] });
      setThumbnail(null);
      setQuizOptions(['Option 1', 'Option 2']);
      setScheduleDate('');
      setScheduleTime('');
      setVisibility('public');
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'error', message: err.message || 'Failed to publish post.' } }));
    } finally {
      setIsPublishing(false);
    }
  };

  const updateQuizOption = (idx, value) => {
    const newOptions = [...quizOptions];
    newOptions[idx] = value;
    setQuizOptions(newOptions);
  };

  const currentData = platformContents[activeTab] !== undefined ? platformContents[activeTab] : platformContents.universal;
  const previewData = platformContents[previewPlatform] !== undefined ? platformContents[previewPlatform] : platformContents.universal;
  const isRawPreview = selectedTargets.length === 0;

  // Calculate Character Limits
  const currentLength = (currentData?.title?.length || 0) + (currentData?.description?.length || 0);
  let activeLimit = 999999;
  let limitWarning = null;

  if (activeTab !== 'universal') {
    activeLimit = platformDefinitions.find(p => p.id === activeTab)?.limit || 999999;
  } else {
    // If Universal, limit is the minimum of all selected targets
    const selectedLimits = selectedTargets.map(tId => platformDefinitions.find(p => p.id === tId)?.limit || 999999);
    if (selectedLimits.length > 0) activeLimit = Math.min(...selectedLimits);
  }

  const isOverLimit = currentLength > activeLimit;
  if (isOverLimit) {
    limitWarning = `Character limit exceeded! Max ${activeLimit} for ${activeTab === 'universal' ? 'selected platforms' : activeTab}.`;
  } else if (currentLength > activeLimit * 0.8) {
    limitWarning = `Approaching character limit (${currentLength}/${activeLimit}).`;
  }

  return (
    <div className="composer-grid">
      
      {/* LEFT: Editor */}
      <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Universal Composer</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => { setShowHashtags(!showHashtags); setHashtagSearchTopic(''); }} 
              className="btn-secondary" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.5rem 1rem', 
                borderRadius: '20px', 
                fontSize: '0.9rem',
                border: showHashtags ? '1px solid var(--accent-blue)' : '1px solid var(--panel-border)',
                background: showHashtags ? 'rgba(0, 210, 255, 0.08)' : 'transparent',
                color: showHashtags ? 'var(--accent-blue)' : 'var(--text-primary)'
              }}
            >
              <Hash size={16} color={showHashtags ? 'var(--accent-blue)' : 'var(--text-secondary)'} /> Saved Tags
            </button>
            <button onClick={generateWithAI} disabled={isGenerating} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              AI Magic
            </button>
          </div>
        </div>

        {/* Inline Hashtag Panel */}
        <AnimatePresence>
          {showHashtags && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
              animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }} 
              exit={{ opacity: 0, height: 0, marginBottom: 0 }} 
              style={{ overflow: 'hidden' }}
            >
              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-dark)', border: '1px solid var(--panel-border)', borderRadius: '16px' }}>
                
                {/* Search Bar Inline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '0.6rem 1rem' }}>
                  <Hash size={18} color="var(--accent-blue)" />
                  <input 
                    type="text" 
                    value={hashtagSearchTopic} 
                    onChange={(e) => setHashtagSearchTopic(e.target.value)} 
                    placeholder="Enter topic to search hashtags (e.g. fitness, travel)..." 
                    style={{ 
                      width: '100%', 
                      background: 'transparent', 
                      border: 'none', 
                      outline: 'none', 
                      color: 'var(--text-primary)', 
                      fontSize: '0.95rem',
                      fontFamily: 'inherit'
                    }} 
                  />
                  {hashtagSearchTopic && (
                    <button type="button" onClick={() => setHashtagSearchTopic('')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Clear</button>
                  )}
                </div>

                {/* Chips Wrap list */}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{hashtagSearchTopic ? `Matching hashtags for "${hashtagSearchTopic}"` : 'Popular default hashtags (click to add, checkmark to remove)'}</span>
                    {hashtagSearchTopic && individualHashtags.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => {
                          const current = platformContents[activeTab] || platformContents.universal;
                          const desc = current.description || '';
                          const words = desc.split(/\s+/);
                          
                          // Get all tags that are not already in desc
                          const newTags = individualHashtags.map(t => t.tag).filter(t => !words.includes(t));
                          if (newTags.length === 0) {
                            window.dispatchEvent(new CustomEvent('show-notification', { 
                              detail: { type: 'error', message: 'All match tags are already added!' } 
                            }));
                            return;
                          }
                          const separator = desc === '' ? '' : (desc.endsWith(' ') || desc.endsWith('\n') ? '' : ' ');
                          handleContentChange('description', desc + separator + newTags.join(' '));
                          window.dispatchEvent(new CustomEvent('show-notification', { 
                            detail: { type: 'success', message: `Added ${newTags.length} hashtags!` } 
                          }));
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        + Add All Match
                      </button>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px', paddingTop: '2px' }}>
                    {individualHashtags.length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.5rem 0' }}>No hashtags found.</div>
                    ) : (
                      individualHashtags.map((item, i) => {
                        const current = platformContents[activeTab] || platformContents.universal;
                        const desc = current.description || '';
                        const words = desc.split(/\s+/);
                        const isAdded = words.includes(item.tag);
                        return (
                          <ChipItem 
                            key={i} 
                            tag={item.tag} 
                            isAdded={isAdded} 
                            onToggle={handleHashtagToggle} 
                          />
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Type Selector */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { id: 'post', label: 'Post', icon: AlignLeft },
            { id: 'reel', label: 'Reel/Short', icon: Film },
            { id: 'video', label: 'Long Video', subLabel: 'Only for YouTube', icon: Video },
            { id: 'quiz', label: 'Quiz/Poll', icon: HelpCircle }
          ].map(type => {
            const Icon = type.icon;
            const isActive = contentType === type.id;
            return (
              <button key={type.id} onClick={() => handleTypeChange(type.id)} type="button" style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                padding: '0.75rem 0.5rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: isActive ? 'linear-gradient(45deg, rgba(58,123,213,0.2), rgba(0,210,255,0.2))' : 'var(--bg-dark)',
                border: isActive ? '1px solid var(--accent-blue)' : '1px solid var(--panel-border)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 0 15px rgba(0,210,255,0.2)' : 'none',
                minHeight: '82px'
              }}>
                <Icon size={20} color={isActive ? 'var(--accent-blue)' : 'var(--text-secondary)'} style={{ flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: '1.2' }}>{type.label}</span>
                  {type.subLabel && <span style={{ fontSize: '0.7rem', color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)', fontWeight: 500, lineHeight: '1.1' }}>({type.subLabel})</span>}
                </div>
              </button>
            )
          })}
        </div>
        
        {/* Editor Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <button type="button" onClick={() => setActiveTab('universal')} style={{ 
              background: activeTab === 'universal' ? 'var(--bg-dark)' : 'transparent', color: activeTab === 'universal' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: activeTab === 'universal' ? '1px solid var(--panel-border)' : '1px solid transparent', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0
            }}>
            <Globe size={16} /> Universal
          </button>
          {selectedTargets.map(targetId => {
            const acc = connectedAccounts.find(a => a.id === targetId);
            if (!acc) return null;
            const Icon = acc.icon;
            const isActive = activeTab === acc.id;
            const hasOverride = platformContents[acc.id] !== undefined;
            return (
              <button key={acc.id} type="button" onClick={() => setActiveTab(acc.id)} style={{ 
                  background: isActive ? `${acc.color}20` : 'transparent', color: isActive ? acc.color : 'var(--text-secondary)',
                  border: isActive ? `1px solid ${acc.color}50` : '1px solid transparent', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0
                }}>
                <Icon size={16} /> {acc.name}
                {hasOverride && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: acc.color }}></div>}
              </button>
            )
          })}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handlePublish(isScheduled ? 'scheduled' : 'published'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text"
              value={currentData?.title || ''}
              onChange={(e) => handleContentChange('title', e.target.value)}
              placeholder={contentType === 'quiz' ? "Question" : (activeTab === 'universal' ? "Title or Heading (Optional)" : `Title for ${connectedAccounts.find(a => a.id === activeTab)?.name}`)}
              style={{ padding: '1rem', fontSize: '1.1rem', fontWeight: 600, background: 'var(--bg-dark)', border: `1px solid ${isOverLimit ? 'var(--error)' : 'var(--panel-border)'}`, borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }}
            />
            
            <textarea 
              value={currentData?.description || ''}
              onChange={(e) => handleContentChange('description', e.target.value)}
              placeholder={contentType === 'quiz' ? "More details about the poll..." : (activeTab === 'universal' ? "Write your main description here, then click 'AI Magic Expand'..." : `Custom description for ${connectedAccounts.find(a => a.id === activeTab)?.name}...`)}
              style={{ flex: 1, minHeight: '120px', fontSize: '1rem', background: 'var(--bg-dark)', border: `1px solid ${isOverLimit ? 'var(--error)' : 'var(--panel-border)'}`, borderRadius: '12px', padding: '1.25rem', color: 'var(--text-primary)', resize: 'none', outline: 'none' }}
            />
            
            {/* Character Limit and Warnings */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              {activeTab !== 'universal' ? (
                 <button type="button" onClick={() => {
                   const newContents = {...platformContents};
                   delete newContents[activeTab];
                   setPlatformContents(newContents);
                 }} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}>Clear Override</button>
              ) : <span></span>}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {limitWarning && (
                  <span style={{ color: isOverLimit ? 'var(--error)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={14} /> {limitWarning}
                  </span>
                )}
                <span style={{ color: isOverLimit ? 'var(--error)' : 'var(--text-secondary)' }}>
                  {currentLength} / {activeLimit !== 999999 ? activeLimit : '∞'}
                </span>
              </div>
            </div>
          </div>

          {contentType === 'quiz' && (
            <div style={{ background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '16px', border: '1px dashed var(--accent-blue)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>Poll Options</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {quizOptions.map((opt, i) => (
                  <input key={i} value={opt} onChange={(e) => updateQuizOption(i, e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)' }} placeholder={`Option ${i+1}`} />
                ))}
                {quizOptions.length < 4 && (
                  <button type="button" onClick={() => setQuizOptions([...quizOptions, `Option ${quizOptions.length + 1}`])} style={{ background: 'transparent', color: 'var(--accent-blue)', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', fontWeight: 600 }}>+ Add Option</button>
                )}
              </div>
            </div>
          )}

          {contentType !== 'quiz' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>Media</h3>
                  {activeTab !== 'universal' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: platformMedia[activeTab] !== undefined ? 'var(--accent-blue)' : 'var(--text-secondary)', fontWeight: 500 }}>
                        {platformMedia[activeTab] !== undefined 
                          ? '✨ Custom media for this platform' 
                          : 'Using Universal media'}
                      </span>
                      {platformMedia[activeTab] !== undefined && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setPlatformMedia(prev => {
                              const next = { ...prev };
                              delete next[activeTab];
                              return next;
                            });
                          }} 
                          style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: 0 }}
                        >
                          Use Universal Media
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', background: 'var(--bg-dark)', padding: '1rem', borderRadius: '16px', border: '1px dashed var(--panel-border)' }}>
                  <AnimatePresence>
                    {media.map((file, idx) => (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
                        {file.type.startsWith('video') ? (
                          <video src={file.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                        ) : (
                          <img src={file.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <button type="button" onClick={() => removeMedia(idx)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <label style={{ 
                    width: '80px', height: '80px', borderRadius: '12px', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)'
                  }}>
                    {contentType === 'reel' || contentType === 'video' ? <Video size={24} /> : <ImagePlus size={24} />}
                    <input type="file" multiple accept={contentType === 'reel' || contentType === 'video' ? "video/*" : "image/*,video/*"} onChange={handleMediaUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {(contentType === 'reel' || contentType === 'video') && (
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Cover Thumbnail <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>(Optional)</span></h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg-dark)', padding: '1rem', borderRadius: '16px', border: '1px dashed var(--panel-border)' }}>
                    {thumbnail ? (
                      <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)', flexShrink: 0 }}>
                        <img src={thumbnail.url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={removeThumbnail} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ 
                        width: '80px', height: '80px', borderRadius: '12px', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0
                      }}>
                        <ImagePlus size={24} />
                        <span style={{ fontSize: '0.65rem', marginTop: '0.25rem', fontWeight: 600 }}>Add Cover</span>
                        <input type="file" accept="image/*" onChange={handleThumbnailUpload} style={{ display: 'none' }} />
                      </label>
                    )}
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Add a custom cover thumbnail image for your video/short to make it stand out.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
               <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Post to Connected Accounts</h3>
               <a href="/accounts" style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Manage Accounts</a>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {connectedAccounts.map(acc => {
                const Icon = acc.icon;
                const isSelected = selectedTargets.includes(acc.id);
                
                if (contentType === 'quiz' && !acc.supportsPolls) {
                  return (
                    <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--bg-dark)', border: '1px dashed var(--panel-border)', borderRadius: '20px', color: 'var(--text-secondary)', opacity: 0.5, fontSize: '0.85rem' }}>
                      <Icon color="var(--text-secondary)" size={16} /> {acc.name} (No Polls)
                    </div>
                  );
                }

                if (contentType === 'video' && acc.id !== 'youtube') {
                  return (
                    <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'var(--bg-dark)', border: '1px dashed var(--panel-border)', borderRadius: '20px', color: 'var(--text-secondary)', opacity: 0.5, fontSize: '0.85rem' }}>
                      <Icon color="var(--text-secondary)" size={16} /> {acc.name} (YouTube Only)
                    </div>
                  );
                }

                return (
                  <motion.label whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={acc.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem',
                    background: isSelected ? 'var(--bg-dark)' : 'var(--bg-dark)', border: `1px solid ${isSelected ? acc.color : 'var(--panel-border)'}`,
                    borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none', boxShadow: isSelected ? `0 0 15px ${acc.color}40` : 'none'
                  }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleTarget(acc.id)} style={{ display: 'none' }} />
                    <Icon color={isSelected ? acc.color : 'var(--text-secondary)'} size={20} />
                    <span style={{ fontWeight: 600, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{acc.name}</span>
                  </motion.label>
                );
              })}
            </div>
            {contentType === 'quiz' && connectedAccounts.some(a => !a.supportsPolls) && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={14} color="var(--error)" /> Some platforms are hidden because they don't support native polls.
              </div>
            )}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Visibility Dropdown */}
            {(() => {
              const [visDropOpen, setVisDropOpen] = useState(false);
              const visRef = useRef(null);

              // Close on outside click
              useEffect(() => {
                const handler = (e) => { if (visRef.current && !visRef.current.contains(e.target)) setVisDropOpen(false); };
                document.addEventListener('mousedown', handler);
                return () => document.removeEventListener('mousedown', handler);
              }, []);

              const visOptions = [
                { value: 'public',   Icon: Globe,   label: 'Public',   desc: 'Everyone can see this post',          color: '#00D2FF' },
                { value: 'private',  Icon: Lock,    label: 'Private',  desc: 'Only you can see this post',          color: '#FF6B6B' },
                { value: 'unlisted', Icon: EyeOff,  label: 'Unlisted', desc: 'Anyone with the link can see it',     color: '#A78BFA' },
              ];
              const selected = visOptions.find(v => v.value === visibility) || visOptions[0];
              const SelIcon = selected.Icon;

              return (
                <div ref={visRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <Globe size={16} color="var(--accent-blue)" /> Post Visibility
                  </label>

                  {/* Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setVisDropOpen(o => !o)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '14px',
                      background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
                      border: `1px solid ${visDropOpen ? selected.color + '70' : 'var(--panel-border)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: visDropOpen ? `0 0 20px ${selected.color}18` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '10px',
                        background: `${selected.color}18`,
                        border: `1px solid ${selected.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <SelIcon size={15} color={selected.color} />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize', lineHeight: 1.2 }}>{selected.label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3, marginTop: 2 }}>{selected.desc}</div>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: visDropOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ color: 'var(--text-secondary)', flexShrink: 0 }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </button>

                  {/* Dropdown Panel */}
                  <AnimatePresence>
                    {visDropOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          left: 0,
                          right: 0,
                          zIndex: 9999,
                          background: 'rgba(14, 16, 26, 0.97)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
                          padding: '6px'
                        }}
                      >
                        {visOptions.map((opt, i) => {
                          const OptIcon = opt.Icon;
                          const isActive = visibility === opt.value;
                          return (
                            <motion.button
                              key={opt.value}
                              type="button"
                              whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                              onClick={() => { setVisibility(opt.value); setVisDropOpen(false); }}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '11px',
                                background: isActive ? `${opt.color}12` : 'transparent',
                                border: isActive ? `1px solid ${opt.color}35` : '1px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                textAlign: 'left',
                                marginBottom: i < visOptions.length - 1 ? 2 : 0
                              }}
                            >
                              <div style={{
                                width: 30, height: 30, borderRadius: '9px',
                                background: `${opt.color}18`,
                                border: `1px solid ${opt.color}35`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <OptIcon size={14} color={opt.color} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isActive ? opt.color : 'var(--text-primary)', lineHeight: 1.2 }}>{opt.label}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3, marginTop: 2 }}>{opt.desc}</div>
                              </div>
                              {isActive && (
                                <div style={{
                                  width: 18, height: 18, borderRadius: '50%',
                                  background: opt.color,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <Check size={11} color="#000" strokeWidth={3} />
                                </div>
                              )}
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })()}

            
            {/* Publishing Schedule Toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <CalendarClock size={16} color="var(--accent-blue)" /> Publishing Schedule
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsScheduled(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: !isScheduled ? 'rgba(0, 210, 255, 0.08)' : 'rgba(255,255,255,0.01)',
                    border: !isScheduled ? '1px solid var(--accent-blue)' : '1px solid var(--panel-border)',
                    color: !isScheduled ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={14} color={!isScheduled ? 'var(--accent-blue)' : 'var(--text-secondary)'} /> Post Immediately
                </button>
                <button
                  type="button"
                  onClick={() => setIsScheduled(true)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: isScheduled ? 'rgba(156, 39, 176, 0.08)' : 'rgba(255,255,255,0.01)',
                    border: isScheduled ? '1px solid var(--accent-purple)' : '1px solid var(--panel-border)',
                    color: isScheduled ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <CalendarClock size={14} color={isScheduled ? 'var(--accent-purple)' : 'var(--text-secondary)'} /> Schedule for Later
                </button>
              </div>
            </div>

            {/* Scheduling Inputs */}
            <AnimatePresence>
              {isScheduled && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '0.25rem', transitionEnd: { overflow: 'visible' } }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.01)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--panel-border)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        Schedule Date
                      </label>
                      <PremiumDatePicker 
                        value={scheduleDate} 
                        onChange={(val) => setScheduleDate(val)} 
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        Schedule Time
                      </label>
                      <PremiumTimePicker 
                        value={scheduleTime} 
                        onChange={(val) => setScheduleTime(val)} 
                        isToday={scheduleDate === new Date().toISOString().substring(0, 10)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>



            <div style={{ display: 'flex', gap: '1rem' }}>
              <motion.button type="button" onClick={() => handlePublish('draft')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-secondary" disabled={isPublishing} style={{ flex: 1, fontSize: '1rem', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Save size={20} /> Save Draft
              </motion.button>
              
              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary" disabled={isPublishing || (!platformContents.universal.title && !platformContents.universal.description && media.length === 0 && contentType !== 'quiz') || selectedTargets.length === 0 || isOverLimit} style={{ flex: 2, fontSize: '1.1rem', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {isPublishing ? <Loader2 className="animate-spin" /> : (isScheduled ? <CalendarClock size={20} /> : <Send size={20} />)}
                {isPublishing ? 'Processing...' : (isScheduled ? `Schedule for Later` : `Post ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Everywhere`)}
              </motion.button>
            </div>
          </div>

        </form>
      </motion.div>

      {/* RIGHT: Live Preview */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '1rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '330px', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>
            <Smartphone size={18} /> Live Preview
          </div>
          
          {/* Premium Device Selector Dropdown */}
          <div ref={deviceDropdownRef} style={{ position: 'relative' }}>
            <button 
              type="button"
              onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--panel-border)',
                borderRadius: '12px',
                padding: '0.4rem 0.8rem',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--panel-border)'}
            >
              <span>{selectedDevice.name}</span>
              <span style={{ fontSize: '0.65rem', opacity: 0.7, transform: showDeviceDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </button>
            
            <AnimatePresence>
              {showDeviceDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  style={{
                    position: 'absolute',
                    top: '105%',
                    right: 0,
                    width: '180px',
                    background: 'var(--panel-bg)',
                    backdropFilter: 'blur(25px)',
                    border: '1px solid var(--panel-border)',
                    borderRadius: '12px',
                    padding: '0.4rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    zIndex: 100,
                    maxHeight: '220px',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  {devices.map(device => {
                    const isSelected = device.id === selectedDevice.id;
                    return (
                      <button
                        key={device.id}
                        type="button"
                        onClick={() => {
                          setSelectedDevice(device);
                          setShowDeviceDropdown(false);
                        }}
                        style={{
                          background: isSelected ? 'var(--accent-blue)' : 'transparent',
                          color: isSelected ? '#000' : 'var(--text-secondary)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.5rem 0.75rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit',
                          outline: 'none'
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'var(--sidebar-active-bg)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        {device.name}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--panel-bg)', padding: '0.5rem', borderRadius: '20px', maxWidth: '330px', overflowX: 'auto', scrollbarWidth: 'none', border: '1px solid var(--panel-border)', minHeight: '50px' }}>
          {isRawPreview ? (
             <div style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', width: '100%', textAlign: 'center', fontWeight: 600 }}>Raw Content Preview</div>
          ) : (
            connectedAccounts.filter(acc => selectedTargets.includes(acc.id)).map(acc => {
              const Icon = acc.icon;
              const isPreview = previewPlatform === acc.id;
              return (
                <button key={acc.id} type="button" onClick={() => setPreviewPlatform(acc.id)} style={{
                  background: isPreview ? acc.color : 'transparent', color: isPreview ? '#fff' : 'var(--text-secondary)',
                  border: 'none', padding: '0.5rem 1rem', borderRadius: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, transition: 'all 0.2s', flexShrink: 0
                }}>
                  <Icon size={16} /> {isPreview && acc.name}
                </button>
              )
            })
          )}
        </div>
        
        {/* Dynamic Bezel Mobile Frame */}
        <div style={{ 
          width: selectedDevice.width, 
          height: selectedDevice.height, 
          background: '#fff', 
          borderRadius: selectedDevice.borderRadius, 
          border: selectedDevice.border, 
          position: 'relative', 
          overflow: 'hidden', 
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {selectedDevice.notchType === 'dynamic-island' && (
            <div style={{ 
              position: 'absolute', 
              top: '12px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              width: selectedDevice.notchWidth, 
              height: selectedDevice.notchHeight, 
              background: '#000', 
              borderRadius: selectedDevice.notchRadius, 
              zIndex: 10,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}></div>
          )}
          
          {selectedDevice.notchType === 'punch-hole' && (
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              width: selectedDevice.notchWidth, 
              height: selectedDevice.notchHeight, 
              background: '#000', 
              borderRadius: '50%', 
              zIndex: 10,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}></div>
          )}
          
          {selectedDevice.notchType === 'notch' && (
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              width: selectedDevice.notchWidth, 
              height: selectedDevice.notchHeight, 
              background: '#1c1c1e', 
              borderRadius: selectedDevice.notchRadius, 
              zIndex: 10,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}></div>
          )}
          
          <div style={{ 
            flex: 1, 
            background: '#fff', 
            color: '#000', 
            paddingTop: selectedDevice.notchType === 'punch-hole' ? '30px' : '40px', 
            paddingBottom: '20px', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column',
            scrollbarWidth: 'none'
          }}>
            
            {isRawPreview ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {media.length > 0 && (
                  <div style={{ position: 'relative', width: '100%', display: 'flex', overflowX: 'auto', snapType: 'x mandatory', scrollbarWidth: 'none' }}>
                    {media.map((file, i) => (
                      <div key={i} style={{ width: '100%', flexShrink: 0, scrollSnapAlign: 'start', position: 'relative', height: (contentType === 'reel' || contentType === 'video') ? '400px' : '300px' }}>
                        {file.type.startsWith('video') ? (
                          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <video 
                              src={file.url} 
                              autoPlay 
                              loop 
                              muted={isMuted} 
                              playsInline 
                              onClick={handleVideoClick} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
                            />
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsMuted(!isMuted);
                              }} 
                              style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              {isMuted ? <VolumeX size={14} color="#fff" /> : <Volume2 size={14} color="#fff" />}
                            </div>
                          </div>
                        ) : (
                          <img src={file.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8f9fa' }}>
                  {currentData?.title && <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{currentData.title}</h3>}
                  {currentData?.description && <p style={{ fontSize: '1rem', whiteSpace: 'pre-wrap', margin: 0, color: '#4a4a4a', lineHeight: '1.5' }}>{currentData.description}</p>}
                  
                  {contentType === 'quiz' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                      {quizOptions.map((opt, i) => (
                         <div key={i} style={{ padding: '0.75rem 1rem', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem', color: '#333', fontWeight: 500 }}>
                           {opt || `Option ${i+1}`}
                         </div>
                      ))}
                    </div>
                  )}

                  {!currentData?.title && !currentData?.description && media.length === 0 && contentType !== 'quiz' && (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0a0', fontSize: '0.9rem', textAlign: 'center' }}>
                      Start typing or upload media to see the raw preview.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              renderPlatformPreview()
            )}
          </div>
        </div>
      </motion.div>

    </div>
  );
}
