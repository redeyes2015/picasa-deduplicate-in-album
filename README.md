Goal
====

I accidentally uploaded the same set of pictures into one album
in Picasa (Google Photo, actually), and I know there is a API
for Picasa. As a engineer, I want to use code to delete those
duplicated pictures, instead of by manual. Besides, I feel this
could become a good 'homework' project.

However, Picasa API will change on May 1st, 2016: after that day,
the API will become 'readonly', which means one can only query
the data, but not change it. So, anyone seeing this repository
probably can not use it for his/her own. Yeah, I know, it is sad.
The Google Photo has its API, but at this moment, I can not find
the one to delete pictures or change albums.

How to Use
==========

1. Go to https://console.developers.google.com to create a new project, 
save the credentials into `project_credentials.json`:

    {
      "client_id": "YOUR_PROJECT_ID_HERE",
      "client_secret": "YOUR_CLIENT_SECRET_HERE",
      "scope": "https://picasaweb.google.com/data/",
      "redirect_uri": "http://localhost:3000/getToken"
    }

2. `npm install && npm start`
3. Set your browser to `http://localhost:3000/`
4. You should know what to do now.

Next...?
========

1. The album id is hard-coded, just lame.
2. Move to Heroku as a service!? Interesting, but probably not worthy.
3. Using xmldom to parse XML is easy, but it feels quite slow 
    with 900-ish `<entry>`s.


Post Notes
==========

In fact, the initial motivation was using [ConvNet.js] to do something
interesting: to help me classify some game screenshots into one album,
saving me some more effort. This goal probably will never happen, given
that this is a leisure time homework-level project.

[ConvNet.js]: http://cs.stanford.edu/people/karpathy/convnetjs/docs.html
