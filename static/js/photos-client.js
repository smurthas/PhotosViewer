/* Generic log function for debugging. */
var log = function(msg) { if (console && console.log) console.debug(msg); };
var sort = '\'{"timestamp":-1}\'';
var baseUrl = '';
var placeholder = 'Everyone';

function photoApp() {
    // set the params if not specified
    var offset = 0;
    var limit = 50;
    var $photosList = $("#main");

    var HTMLFromPhotoJSON = function(photos) {
        var p,
        title,
        photoHTML = "";
        for (var i in photos) {
            p = photos[i];
            title = p.title ? p.title: "Untitled";
            photoHTML += '<div class="box"><div id="' + p._id + '" class="photo"><img src="' + baseUrl + '/Me/photos/image/' + p.id + '" style="max-width:300px" /><div class="basic-data">' + title + '</div></div></div>';
        }
        return photoHTML;
    };

    var getPhotosCB = function(photos) {
        var p,
        title,
        photoHTML = "";

        // clear the list
        $photosList.html('');
        $photosList.masonry('destroy');
        // populate the list with our photos
        if (photos.length == 0) return $photosList.append("<div>Sorry, no photos found!</div>");

        var $newElems = $(HTMLFromPhotoJSON(photos));
        $photosList.append($newElems);

        // ensure that images load before adding to masonry layout
        $newElems.imagesLoaded(function() {
            $photosList.masonry({itemSelector: '.photo'});
        });
        offset += photos.length;
    };

    var getMorePhotosCB = function(photos) {
        if (photos.length == 0) return;

        var $newElems = $(HTMLFromPhotoJSON(photos));
        $photosList.append($newElems);

        // ensure that images load before adding to masonry layout
        $newElems.imagesLoaded(function() {
            $photosList.masonry('appended', $newElems, true);
        });
        offset += limit;
    };


    function loadPhotos(callback) {
        var name = $("#names option:selected").val();
        var terms = '';
        if(name && name !== placeholder)
            terms += "?terms=[sources.data.tags.data.name:'" + name + "']";
        $.getJSON(baseUrl +'/query/getPhoto' + terms, 
                  {offset: offset, limit: limit, sort: sort}, 
                  callback);
    }

    
    getNames(function(names) {
        populateNamesSelect(names);
        loadPhotos(getPhotosCB);
    });
    
    $("#moarphotos").click(function() {
        loadPhotos(getMorePhotosCB);
    });
    $("#names").change(function() {
        offset = 0;
        // clear the list
        $photosList.html('');
        console.log('change!');
        loadPhotos(getPhotosCB);
    })
    // TODO: make this keep in sync!
}

function getNames(callback) {
    $.getJSON(baseUrl + '/query/getPhoto?fields=[sources.data.tags.data.name:1]',{}, function(namesObjects) {
        var namesHash = {};
        for(var i in namesObjects) {
            if(namesObjects[i].sources && namesObjects[i].sources[0] && namesObjects[i].sources[0].data && namesObjects[i].sources[0].data.tags) {
                var data = namesObjects[i].sources[0].data.tags.data;
                for(var j in data)
                    namesHash[data[j].name] = 1;
            }
        }
    // $.getJSON(baseUrl + '/query/getContact?fields=[name:1]',{}, function(namesObjects) {
        var names = [];
        
        for(var i in namesHash) {
            names.push(i);
        }
        // for(var i in namesObjects) {
        //     var name =  namesObjects[i].name;
        //     if(name && name !== undefined)
        //         names.push(name);
        // }
        names.sort();
        names.reverse();
        names.push(placeholder);
        names.reverse();
        callback(names);
    });
}

function populateNamesSelect(names) {
    var namesSelect = $("#names");
    namesSelect.html('');
    for(var i in names) {
        namesSelect.append('<option value="' + names[i] + '">' + names[i] + '</option>');
    }
}

/* jQuery syntactic sugar for onDomReady */
$(function() {
    var photos = photoApp();
});
