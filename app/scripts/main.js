var Boda = {
  Views: {},
  Models: {}
};

Boda.Models.User = Backbone.Model.extend({
  id: 1,
  localStorage: new Backbone.LocalStorage('BodaAM'),
  defaults: {

  }
});

Boda.Views.AppView = Backbone.View.extend({
  el: '#content',

  events: {

  },

  initialize: function() {
    this.model = new Boda.Models.User();

    this.steps = ['Intro', 'Form1', 'Form2', 'Form3', 'Form4', 'Outro'];
    this.current = 0;
    this.currentStep = this.steps[this.current];
    this.renderStep();

  },

  renderStep : function() {
    var _this = this;

    if (this.current !== 0)
      this.$el.removeClass('rotateFoldRight').addClass('rotateFoldLeft');
    _.delay(_.bind(function(){
      console.log(this);
      this.currentView = new Boda.Views[this.currentStep + 'View']({
        model: this.model,
        parent: this
      });
      this.$el.html(this.currentView.render().$el);
      this.currentView.afterRender();
      if (this.current !== 0)
        this.$el.removeClass('rotateFoldLeft').addClass('rotateFoldRight');
    }, this), 500);

  },

  nextStep: function() {
    this.current++;
    this.currentStep = this.steps[this.current];
    this.renderStep();
  }
});

Boda.Views.BasePage = Backbone.View.extend({
  events: {
    'click button': 'nextStep'
  },

  initialize: function(opts) {
    console.log(opts);
    this.parent = opts.parent;
  },

  render: function() {
    this.setElement($.parseHTML(this.template(this.model.toJSON())));
    return this;
  },

  afterRender: function() {
    return this;
  },

  nextStep: function() {
    this.parent.nextStep();
  }
});

Boda.Views.FormView = Boda.Views.BasePage.extend({
  events: {
    'click button': 'save'
  },

  afterRender: function() {
    this.nlform = new NLForm( document.getElementById( 'nl-form' ) );
  },

  save: function() {
    var _this = this;
    this.$el.find('.mdl').each(function(){
      _this.model.set($(this).attr('name'), $(this).val());
    });

    console.log(this.model.toJSON());
    this.parent.nextStep();
  }
});

Boda.Views.IntroView = Boda.Views.BasePage.extend({
  el: '#intro',
  template:  _.template($('#intro-template').html().trim())
});

Boda.Views.Form1View = Boda.Views.FormView.extend({
  el: '#form-1',
  template:  _.template($('#form-1-template').html().trim())
});

Boda.Views.Form2View = Boda.Views.FormView.extend({
  el: '#form-2',
  template:  _.template($('#form-2-template').html().trim())
});

Boda.Views.Form3View = Boda.Views.FormView.extend({
  el: '#form-3',
  template:  _.template($('#form-3-template').html().trim())
});

Boda.Views.Form4View = Boda.Views.FormView.extend({
  el: '#form-4',
  template:  _.template($('#form-4-template').html().trim())
});

Boda.Views.OutroView = Boda.Views.BasePage.extend({
  el: '#outro',
  template:  _.template($('#outro-template').html().trim())
});

$(function(){
  var App = new Boda.Views.AppView();
});
