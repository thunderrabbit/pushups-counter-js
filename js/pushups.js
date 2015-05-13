    Parse.initialize(config.app_id, config.js_key);
    
    var myCookieGUID;
    var cookieName = 'push-up-cookie';
    if(docCookies.hasItem(cookieName)) {
      myCookieGUID = docCookies.getItem(cookieName);
    } else {
      myCookieGUID = guid();
      docCookies.setItem(cookieName,myCookieGUID);
    }

    $('.button').click(function() {
      var PushupPerformedBy = Parse.Object.extend("PushupPerformedBy");
      var myPushupCounts = new PushupPerformedBy();
      myPushupCounts.save({guid: myCookieGUID, pushup:1}, {
        success: function(object) {
          $(".success").show();
        },
        error: function(model, error) {
          $(".error").show();
        }
      });
    });
