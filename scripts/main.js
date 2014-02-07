require([
  '$api/models',
  '$views/buttons'
], function(models, buttons) {
  'use strict';
    
    var handleNotFound = function() {
        document.getElementById("lyrics").innerHTML = "<h1>No lyrics found! :(</h1><h2>Try modifying the artist or song name above.</h2>";
    };
    
    var handleAd = function() { 
        document.getElementById("lyrics").innerHTML = "<p>That looks like an ad.</p>";
    }
    
    var onRefreshButtonClick = function() {
        lasttrack = null;
        update();
    };
    
    var setupFields = function(track) {
        document.getElementById("field_artist").value = track.artists[0].name;
        document.getElementById("field_song").value = track.name.split(" - ")[0];
    };
    
    var onChange = function() {
        var track = models.player.track;
        setupFields(track);
        update();
    };
    
    var onKey = function(e) {
        if (e.keyCode == 13) {
            onRefreshButtonClick();
        }
    };
    
    var update = function() {
        var track = models.player.track;
        if (track != lasttrack) {
            lasttrack = track;
            document.getElementById("lyrics").innerHTML = "<p>Fetching lyrics...</p>";
            var xmlhttp;
            xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var song;
                    eval(xmlhttp.responseText);
                    if (song.lyrics != "Not found") {
                        document.getElementById("lyrics").innerHTML = "<iframe src=\"" + song.url + "\" frameborder=\"0\"></iframe>";
                    }
                    else {
                        handleNotFound();
                    }
                }
            }
            var artist = encodeURIComponent(document.getElementById("field_artist").value.trim().toLowerCase());
            var songName = encodeURIComponent(document.getElementById("field_song").value.trim().toLowerCase());
            if (track.artists[0].uri != "spotify:artist:0000000000000000000000") {
                xmlhttp.open("GET", "https://lyrics.wikia.com/api.php?artist=" + artist +"&song=" + songName + "&fmt=json", true);
                xmlhttp.send();
            }
            else {
                handleAd();
            }
        }
    };
    
    var lasttrack;
    
    var refreshButton = buttons.Button.withLabel("Search LyricWiki");
    refreshButton.node.addEventListener('click', onRefreshButtonClick, false);
    document.getElementById("buttonContainer").appendChild(refreshButton.node);
    
    document.getElementById("field_artist").onkeypress = onKey;
    document.getElementById("field_song").onkeypress = onKey;
    
    models.player.load('track').done(function(player) {
        onChange();
    });
    models.player.addEventListener('change', onChange);
});
