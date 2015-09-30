var Boda = {
  Views: {},
  Models: {}
};

Boda.Models.User = Backbone.Model.extend({
  id: 1,
  localStorage: new Backbone.LocalStorage('BodaAM'),
  defaults: {
    id: 1,
    name: '',
    surname: '',
    rsvp: 'yes',
    email: '',
    transportIn: 'car',
    sushi: 'yes',
    alergies: 'no',
    alergiesDesc: '',
    copes: '0',
    night: 'hotel',
    transportOut: 'walk',
    comments: ''
  }
});

Boda.Views.AppView = Backbone.View.extend({
  el: '#content',

  events: {

  },

  initialize: function() {
    var _this = this;

    this.steps = ['Intro', 'Form1', 'Form2', 'Form3', 'Form4', 'Outro'];
    this.current = 0;

    this.model = new Boda.Models.User();
    this.model.fetch({
      success: function(e) {
        console.log('Success on fetch', e);
        _this.renderStep();
      },

      error: function(e) {
        console.log('Error on fetch', e);
        _this.renderStep();
      }
    })

  },

  renderStep : function(dir) {
    var _this = this,
        dir = dir || 'forward',
        allClasses = ['rotateFoldRight', 'rotateUnfoldRight', 'rotateFoldLeft', 'rotateUnfoldLeft'].join(' '),
        inClass = dir === 'forward' ? 'rotateUnfoldRight' : 'rotateUnfoldLeft',
        outClass = dir === 'forward' ? 'rotateFoldLeft' : 'rotateFoldRight';

    this.currentStep = this.steps[this.current];

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
    this.current = this.current < this.steps.length - 1 ?  this.current + 1 : this.current;
    this.renderStep('forward');
  },

  prevStep: function() {
    this.current = this.current > 0 ? this.current - 1 : 0;
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
    var _this = this;
    this.$el.find('select').each(function(){
      $(this).val(_this.model.get($(this).attr('name')));
    });
    this.nlform = new NLForm( document.getElementById( 'nl-form' ) );
  },

  save: function() {
    var _this = this;
    this.$el.find('.mdl').each(function(){
      _this.model.set($(this).attr('name'), $(this).val());
    });
    this.model.save();
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
  template:  _.template($('#form-1-template').html().trim()),

  nextStep: function() {
    if (this.save()) {
      this.parent.nextStep();
    }
  },

  save: function() {
    var _this = this,
        notFilled  = [];

    this.$el.find('input.mdl').each(function() {
      if ($(this).val() === '') {
        var nom = '';
        switch ($(this).attr('name')) {
          case 'name':
            nom = 'Nom';
            break;
          case 'surname':
            nom = 'Cognom';
            break;
          case 'email':
            nom = 'Email';
            break;
        }
        notFilled.push(nom);
      }
    });

    if (notFilled.length) {
      console.log(notFilled);
      alert('Has d\'omplir els següents camps: '+notFilled.join(', '));
      return false;
    } else {
      this.$el.find('.mdl').each(function(){
        _this.model.set($(this).attr('name'), $(this).val());
      });
      this.model.save();
      return true;
    }
  }
});

Boda.Views.Form2View = Boda.Views.FormView.extend({
  el: '#form-2',
  template:  _.template($('#form-2-template').html().trim())
});

Boda.Views.Form3View = Boda.Views.FormView.extend({
  el: '#form-3',
  template:  _.template($('#form-3-template').html().trim()),
  events: {
    'click .nl-next': 'nextStep',
    'click .nl-prev': 'prevStep',
    'change select[name=alergies]' : 'alergies'
  },
  alergies: function(e) {
    var $target = $(e.target),
        aDesc = this.$el.find('#alergiesDesc');

    if ($target.val() === 'yes') {
      aDesc.addClass('show');
    } else {
      aDesc.removeClass('show');
      aDesc.find('textarea').val('');
    }
  }
});

Boda.Views.Form4View = Boda.Views.FormView.extend({
  el: '#form-4',
  template:  _.template($('#form-4-template').html().trim())
});

Boda.Views.OutroView = Boda.Views.BasePage.extend({
  el: '#outro',
  template:  _.template($('#outro-template').html().trim()),
  nextStep: function() {
    var _this = this;
    this.model.set('comments', $('textarea').val());
    $('#loading').addClass('show');
    console.log('Submit!', _this.model.toJSON());

    $.ajax('http://sheetsu.com/apis/cc8627c5',
    {
      method: 'POST',
      dataType: 'json',
      data: this.model.toJSON(),
      crossDomain: true
    })
    .done(function(r){
      console.log('Done', r);
      $('#loading').removeClass('show');
      _this.$el.html('<h1 style="text-align:center">Les teves respostes s\'han enviat correctament, gràcies!</h1>');
    })
    .error(function(e){
      console.log('Error!', e);
    });
  }
});

$(function(){
  Boda.App = new Boda.Views.AppView();
});
