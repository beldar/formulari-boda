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
    this.renderStep();

  },

  renderStep : function(dir) {
    var _this = this,
        dir = dir || 'forward',
        allClasses = ['rotateFoldRight', 'rotateUnfoldRight', 'rotateFoldLeft', 'rotateUnfoldLeft'].join(' '),
        inClass = dir === 'forward' ? 'rotateUnfoldRight' : 'rotateUnfoldLeft',
        outClass = dir === 'forward' ? 'rotateFoldLeft' : 'rotateFoldRight';

    this.currentStep = this.steps[this.current];

    console.log('Current step: '+this.current);

    if (this.current !== 0) {
      this.$el.removeClass(allClasses).addClass(outClass);
    }
    _.delay(_.bind(function(){
      this.currentView = new Boda.Views[this.currentStep + 'View']({
        model: this.model,
        parent: this
      });
      this.$el.html(this.currentView.render().$el);
      this.currentView.afterRender();
      if (this.current !== 0) {
        this.$el.removeClass(allClasses).addClass(inClass);
      }
    }, this), 500);

  },

  nextStep: function() {
    console.log('Next, current: '+this.current);
    this.current = this.current < this.steps.length - 1 ?  this.current + 1 : this.current;
    console.log('-> '+this.current);
    this.renderStep('forward');
  },

  prevStep: function() {
    console.log('Prev, current: '+this.current, this.current > 0);
    this.current = this.current > 0 ? this.current - 1 : 0;
    console.log('-> '+this.current);
    this.renderStep('backward');
  }
});

Boda.Views.BasePage = Backbone.View.extend({
  events: {
    'click .nl-next': 'nextStep',
    'click .nl-prev': 'prevStep'
  },

  initialize: function(opts) {
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
  },

  prevStep: function() {
    this.parent.prevStep();
  }
});

Boda.Views.FormView = Boda.Views.BasePage.extend({

  afterRender: function() {
    this.nlform = new NLForm( document.getElementById( 'nl-form' ) );
  },

  save: function() {
    var _this = this;
    this.$el.find('.mdl').each(function(){
      _this.model.set($(this).attr('name'), $(this).val());
    });

    console.log(this.model.toJSON());
  },

  nextStep: function() {
    this.save();
    this.parent.nextStep();
  },

  prevStep: function() {
    this.save();
    this.parent.prevStep();
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
