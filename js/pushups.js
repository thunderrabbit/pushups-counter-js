var makeNosedownCounter = function() {
  var myCookieGUID;
  var cookieName = 'push-up-cookie';
  var privateNosedownCounter = 0;

  Parse.initialize(config.app_id, config.js_key);
  if(docCookies.hasItem(cookieName)) {
    myCookieGUID = docCookies.getItem(cookieName);
  } else {
    myCookieGUID = guid();
    docCookies.setItem(cookieName,myCookieGUID);
  }
  return {
    doNosedown: function() {
      privateNosedownCounter++;
    },
    saveNosedowns: function() {
      var PushupsPerformedBy = Parse.Object.extend("PushupsPerformedBy");
      var myPushupCounts = new PushupsPerformedBy();
      myPushupCounts.save({guid: myCookieGUID, pushups:privateNosedownCounter}, {
        success: function(object) {
          privateNosedownCounter = 0;
        },
        error: function(model, error) {
          $(".error").show();
        }
      });
    },
    getNosedowns: function() {
      return privateNosedownCounter;
    }
  }  
};