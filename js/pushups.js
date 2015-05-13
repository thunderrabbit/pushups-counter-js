var nosedownCounter = {
  var myCookieGUID;
  var cookieName = 'push-up-cookie';
  var recentNosedowns;

  initialize: function(app_id,js_key) {
    Parse.initialize(config.app_id, config.js_key);
    if(docCookies.hasItem(cookieName)) {
      myCookieGUID = docCookies.getItem(cookieName);
    } else {
      myCookieGUID = guid();
      docCookies.setItem(cookieName,myCookieGUID);
    }
  },
  doNoseDown: function() {
    recentNosedowns++;
    return recentNosedowns;
  },
  getNoseDowns: function() {
    return recentNosedowns;
  },
  saveNoseDowns: function() {
    var PushupsPerformedBy = Parse.Object.extend("PushupsPerformedBy");
    var myPushupCounts = new PushupsPerformedBy();
    myPushupCounts.save({guid: myCookieGUID, pushups:recentNosedowns}, {
      success: function(object) {
        recentNosedowns = 0;
      },
      error: function(model, error) {
        $(".error").show();
      }
    });
  }
}