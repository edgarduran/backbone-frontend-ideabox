// Cross-site scripting prevent
function htmlEncode(value){
  return $('<div/>').text(value).html();
}

// Set API domain
$.ajaxPrefilter( function (options, originalOptions, xhr) {
  options.url = "http://edgars-ideabox.herokuapp.com/api/v1" + options.url;
});

// Serialize Object
$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};


// Backbone Collections
var Ideas = Backbone.Collection.extend({
    url: '/ideas'
});

// Backbone Models
var Idea = Backbone.Model.extend({
    urlRoot: '/ideas'
});

// Backbone Views
var IdeaList = Backbone.View.extend({
  el: '.ideas',
  render: function () {
    var that = this;
    var allIdeas =  new Ideas();
    allIdeas.fetch({
      success: function (allIdeas) {
        var template = _.template($('#idea-list-template').html(), {allIdeas: allIdeas.models})
        that.$el.html(template);
        $('.edit-idea-form').toggle();
      }
    });
  },
  events: {
    'click .delete-idea': 'deleteIdea'
  },
  deleteIdea: function (ev) {
    var id = ev.target.id;
    var idea = new Idea({id: id});
    var allIdeas =  new Ideas();
    var $idea = $('#' + id).closest('tr');
    idea.destroy({
      success: function () {
        $idea.remove();
      }
    });
    return false;
  }
});

var EditIdea = Backbone.View.extend({
  el: '.edit-form',
  render: function (options) {
    var that = this;
    if(options.id) {
      var idea = new Idea({id: options.id});
      idea.fetch({
        success: function (idea) {
          var template = _.template($('#edit-idea-template').html(), {idea: idea});
          that.$el.html(template);
        }
      });
    } else {
      var template = _.template($('#edit-idea-template').html(), {idea: null});
      this.$el.html(template);
    }
  },
  events: {
    'submit .edit-idea-form': 'saveIdea'
  },
  saveIdea: function (ev) {
    var ideaDetails = $(ev.currentTarget).serializeObject();
    var idea = new Idea();
    idea.save(ideaDetails, {
      success: function () {
        router.navigate('', {trigger: true});
      }
    });
    return false;
  }
});

// Backbone Router
var Router = Backbone.Router.extend({
  routes: {
    '': 'home',
    'new': 'editIdea',
    'edit/:id': 'editIdea'
  }
});

var ideaList = new IdeaList();
var editIdea = new EditIdea();

var router = new Router;

router.on('route:home', function () {
  ideaList.render();
});
router.on('route:editIdea', function (id) {
  editIdea.render({id:id});
});

Backbone.history.start();
