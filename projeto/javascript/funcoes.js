
(function () {
  var doc = document.getElementById("documento");
  doc.contentEditable = true;
  doc.focus();


  var id = getUrlParameter('id');
  if (!id) {
    location.search = location.search
      ? '&id=' + getUniqueId() : 'id=' + getUniqueId();
    return;
  }


  	//Real time capabilities
    return new Promise(function (resolve, reject) {

  	//Pusher usando chave gerada ao criar app no Pusher.com 
    var pusher = new Pusher('2222f56bba340fce1767', {
  						cluster: 'us2'
										});

    // Criando canais to subscribe a modificações
    var channel = pusher.subscribe(id);

    channel.bind('client-text-edit', function(html) {
     
      // save the current position
      var currentCursorPosition = getCaretCharacterOffsetWithin(doc);
      doc.innerHTML = html;
      // set the previous cursor position
      setCaretPosition(doc, currentCursorPosition);
      

    });

    var currentState = pusher.connection.state;
    $('p#status').text("Pusher status: " + currentState);
	
    pusher.connection.bind('state_change', function(states) {
  		$('p#status').text("Pusher status: " + states.current);
		
  	});


	channel.bind('pusher:subscription_succeeded', function() {
  		$('p#subscribe').text("subscription_succeeded");
	});

	channel.bind('pusher:subscription_error', function() {
	  	$('p#subscribe').text("subscription_error");
	});


    channel.bind('pusher:subscription_succeeded', function() {
      resolve(channel);
    });
  }).then(function (channel) {
    function triggerChange (e) {
      channel.trigger('client-text-edit', e.target.innerHTML);
    }

    doc.addEventListener('input', triggerChange);
  })








  // gerador de um ID unico e randomico para cada sessao
  function getUniqueId () {
    return 'private-' + Math.random().toString(36).substr(2, 9);
  }

  // funcao para pegar parametro da url (ex: id=abc123 )
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }


  //Eventos para a posição do mouse se manter a mesma
  function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
      sel = win.getSelection();
      if (sel.rangeCount > 0) {
        var range = win.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
  }

  function setCaretPosition(el, pos) {
    // Loop through all child nodes
    for (var node of el.childNodes) {
      if (node.nodeType == 3) { // we have a text node
        if (node.length >= pos) {
            // finally add our range
            var range = document.createRange(),
                sel = window.getSelection();
            range.setStart(node,pos);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return -1; // we are done
        } else {
          pos -= node.length;
        }
      } else {
        pos = setCaretPosition(node,pos);
        if (pos == -1) {
            return -1; // no need to finish the for loop
        }
      }
    }
    return pos; // needed because of recursion stuff
  }


})();