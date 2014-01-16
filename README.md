pomodoro
========

We don't want to brag, but XXX is probably the best existing Pomodoro time
tracker.

[Try it here](http://pomodoro.miximum.fr/).

Why is it the best?
-------------------

XXX is very cool for many reasons:

 * It's completely local, all your data is stored in your own browser.
 * No need to create a useless account or sign in with a remote service.
 * Close the page, open it again: your timer keeps running.
 * Cool stats.
 * It's open-source!

Build your own
--------------

XXX is open-source and completely local, i.e it means you can build your own,
and you don't even need a web server of some kind.

You will need git, npm and grunt installed.

 * git clone https://github.com/thibault/pomodoro.git
 * cd pomodoro
 * npm install
 * <your browser> src/index.html

Help, my stats disappeared when I changed browser / computer!
-------------------------------------------------------------

Your data is saved in localStorage, e.g in your browser.

Requirements
------------

We use recent web apis, hence you must use a modern web browser to use
XXX

Here are the APIs we use:

 * [localStoragea](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage)
 * [audio](https://developer.mozilla.org/fr/docs/Web/HTML/Element/audio)
 * [Notification](https://developer.mozilla.org/en-US/docs/Web/API/notification)
 * [Svg](https://developer.mozilla.org/en-US/docs/Web/SVG)


We are not really interested in working to support old and dusty browsers, so if
you chose to use one of those, some features may be buggy or completely broken.

Who made this?
--------------

XXX was proudly created by [@namlook](http://elkorado.com/) and
[@thibaultj](http://miximum.fr/) during a two days coding session. Then it was
rewritten after the hangover.
