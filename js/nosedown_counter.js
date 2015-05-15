// Based on the example [Parse.js todo Backbone application](https://github.com/ParsePlatform/Todo)
// based on the todo app by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses Parse to save
// nosedowns and provide user authentication and sessions.

$(function() {

  Parse.$ = jQuery;

  // Initialize Parse with your Parse application javascript keys
  Parse.initialize(config.app_id, config.js_key);

  // SetOfNosedowns Model
  // ----------

  // Our basic SetOfNosedowns model has a `count` attribute.
  // This is the number of nosedowns done in one session.
  var SetOfNosedowns = Parse.Object.extend("SetOfNosedowns", {
    // Default attributes for the setOfNosedowns.
    defaults: {
      count: 0
    },

    // Ensure that each setOfNosedowns created has `count`.
    // This code is useless execpt as an example for how to deal with default values
    initialize: function() {
      if (!this.get("count")) {
        this.set({"count": this.defaults.count});
      }
    },

    // Toggle the `done` state of this setOfNosedowns item.
    doNosedown: function() {
      // essentially count++
      this.set({"count": this.get("count") + 1});
      return(this.get("count"));
    },

    saveNosedowns: function(callback) {
		this.save({
			user:    Parse.User.current(),
			ACL:     new Parse.ACL(Parse.User.current())
		}).then(callback, function(error) {
	        alert("error saving");
	    });
  	}

  });

  // This is the transient application state, not persisted on Parse
  var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all"
    }
  });



  // The Application
  // ---------------

  // The main view that lets a user manage their todo items
  var ManageTodosView = Parse.View.extend({

    // // Our template for the line of statistics at the bottom of the app.
    // statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      // "keypress #new-todo":  "createOnEnter",		// saving as example code
      "click .nose-button": "countNosedown",
      "click .save-button": "saveNosedowns",
      "click .log-out": "logOut",
    },

    el: ".content",

    // At initialization we bind to the relevant events 
    initialize: function() {
      var self = this;

      _.bindAll(this, 'countNosedown', 'logOut');

      // Main todo management template
      this.$el.html(_.template($("#manage-todos-template").html()));
      
      this.setOfNosedowns = new SetOfNosedowns;

      //  load any preexisting noseDowns that might be saved to Parse.
      this.loadTotalNosedowns();
    },

    loadTotalNosedowns: function(response) {
		var query = new Parse.Query(SetOfNosedowns);
		query.equalTo("user", Parse.User.current());
		query.find().then(function(results) {
			var totalNosedowns = 0;
			for(var i=0; i<results.length; i++) {
			  totalNosedowns += results[i].get("count");
			}
			$('#pushups-so-far').html(totalNosedowns);
		});
    },

    countNosedown: function(e) {
		var noseDownsThisSession = this.setOfNosedowns.doNosedown();
		$("#this-session-count").html("did " + noseDownsThisSession);
    },
    saveNosedowns: function(e) {
    	me = this;
		this.setOfNosedowns.saveNosedowns(function(results) {
			$("#this-session-count").html(0);
			me.loadTotalNosedowns();
			me.setOfNosedowns = new SetOfNosedowns;
		});
    },

    // Logs out the user and shows the login view
    logOut: function(e) {
      Parse.User.logOut();
      new LogInView();
      this.undelegateEvents();
      delete this;
    },

    // Keeping this as example code which might be good for graphs I plan to add later
    // // Re-rendering the App just means refreshing the statistics -- the rest
    // // of the app doesn't change.
    // render: function() {
    //   var done = this.todos.done().length;
    //   var remaining = this.todos.remaining().length;

    //   this.$('#todo-stats').html(this.statsTemplate({
    //     total:      this.todos.length,
    //     done:       done,
    //     remaining:  remaining
    //   }));

    // },

  });

  var LogInView = Parse.View.extend({
    events: {
      "submit form.login-form": "logIn",
      "submit form.signup-form": "signUp"
    },

    el: ".content",
    
    initialize: function() {
      _.bindAll(this, "logIn", "signUp");
      this.render();
    },

    logIn: function(e) {
      var self = this;
      var username = this.$("#login-username").val();
      var password = this.$("#login-password").val();
      
      Parse.User.logIn(username, password, {
        success: function(user) {
          new ManageTodosView();
          self.undelegateEvents();
          delete self;
        },

        error: function(user, error) {
          self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
          self.$(".login-form button").removeAttr("disabled");
        }
      });

      this.$(".login-form button").attr("disabled", "disabled");

      return false;
    },

    signUp: function(e) {
      var self = this;
      var username = this.$("#signup-username").val();
      var password = this.$("#signup-password").val();
      
      Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
        success: function(user) {
          new ManageTodosView();
          self.undelegateEvents();
          delete self;
        },

        error: function(user, error) {
          self.$(".signup-form .error").html(_.escape(error.message)).show();
          self.$(".signup-form button").removeAttr("disabled");
        }
      });

      this.$(".signup-form button").attr("disabled", "disabled");

      return false;
    },

    render: function() {
      this.$el.html(_.template($("#login-template").html()));
      this.delegateEvents();
    }
  });

  // The main view for the app
  var AppView = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#nosedown-app"),

    initialize: function() {
      this.render();
    },

    render: function() {
      if (Parse.User.current()) {
        new ManageTodosView();
      } else {
        new LogInView();
      }
    }
  });

  new AppView;
  Parse.history.start();
});

