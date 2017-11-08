var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var colors = [ 'up', 'down', 'left', 'right', 'aqua' , 'azure' , 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow'];
var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = true;
recognition.maxAlternatives = 1;

var diagnostic = document.querySelector('.output');
var bg = document.querySelector('html');
var hints = document.querySelector('.hints');

var colorHTML= '';
colors.forEach(function(v, i, a){
  console.log(v, i);
  colorHTML += '<span style="background-color:' + v + ';"> ' + v + ' </span>';
});
hints.innerHTML = 'Tap/click then say a color to change the background color of the app. Try '+ colorHTML + '.';

var state = {
  color: 'blue',
  direction: 'nowhere',
  bottom: 0.5,
  left: 0.5
};
document.body.onclick = function() {
  recognition.start();
  console.log('Ready to receive a command.');
}

recognition.onstart = function() {
  console.log("Recognition started");
};

recognition.onresult = function(event) {
  // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
  // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
  // It has a getter so it can be accessed like an array
  // The [last] returns the SpeechRecognitionResult at the last position.
  // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
  // These also have getters so they can be accessed like arrays.
  // The [0] returns the SpeechRecognitionAlternative at position 0.
  // We then return the transcript property of the SpeechRecognitionAlternative object

  var last = event.results.length - 1;
  var transcript = event.results[last][0].transcript.trim();
  console.log('Result:', transcript);
  switch (transcript) {
    case 'up':
    case 'down':
    case 'left':
    case 'right':
      state.direction = transcript;
      break;
    default:
      state.color = transcript;
  }

  diagnostic.textContent = 'Result received: ' + state.color + '.';
  // bg.style.backgroundColor = state.color;
  console.log('Confidence: ' + event.results[0][0].confidence);
}

recognition.onend = function() {
  recognition.start();
}

recognition.onnomatch = function(event) {
  diagnostic.textContent = "I didn't recognise that color.";
}

recognition.onerror = function(event) {
  diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
}

function setPath(val) {
  switch (val) {
    case 'up':
      state.bottom = state.bottom + 0.1;
      if (state.bottom > 1) state.bottom = 1;
      break;
    case 'down':
      state.bottom = state.bottom - 0.1;
      if (state.bottom < 0) state.bottom = 0;
      break;
    case 'right':
      state.left = state.left + 0.1;
      if (state.left > 1) state.left = 1;
      break;
    case 'left':
      state.left = state.left - 0.1;
      if (state.left < 0) state.left = 0;
      break;
    default:
      break;
  }
}

new Vue({
  el: '#mover-container',
  template: '<div id="mover" :style="styles"><span>Moved {{state.direction}}</span></div>',
  data() {
    return {
      state
    }
  },
  computed: {
    styles: function() {
      return {'bottom': (this.state.bottom * 100) + '%', 'left': (this.state.left * 100) + '%', 'background-color': this.state.color};
    }
  },
  watch: {
    'state.direction': function(newVal, oldVal) {
      if (oldVal !== newVal) {
        setPath(newVal);
      }
    }
  }
});
