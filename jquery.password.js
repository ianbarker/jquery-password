(function($) {
	
	var errorMsg = '';
	var passwordId = null;
	var inputPassword = null;
	var inputPlain = null;

	$.fn.password = function(options) {

		var defaults = {
			minLength: 6,
			bestLength: 12,
			requireCapital: false,
			requireNumber: false,
			resultClass: 'passwordResult',
			revealWhenTyping: true,
			useSymbols: true,
			colours: {
				0: 'cc0000',
				1: 'cc7d00',
				2: 'ccad00',
				3: 'cca300',
				4: 'b2cc00',
				5: '6ecc00'
			}
		};
		
		$.password.options = $.extend(defaults, options);
		
		return this.each(function() {

			passwordId = $.password.makeBox( $(this) );
			inputPassword = $(this);
			
			if ( inputPassword.val().length > 0 ) {
				var initialWord = inputPassword.val();		
				var s = $.password.getScore( initialWord );				
				$.password.setBox( passwordId, s );
			}
			
			inputPassword.bind('focus blur keyup', function(e) {	
				
				if ( e.type == 'focus' ) {
					
					if ( $.password.options.revealWhenTyping ) {
								
						// replace with input so we can see the password being typed
						inputPlain = $('<input>').attr({
							class: inputPassword.attr('class'),
							id: inputPassword.attr('id'),
							name: inputPassword.attr('name'),
							type: 'text',
							value: inputPassword.val()
						}).insertAfter(inputPassword);
						inputPassword.hide();
						inputPlain.focus();
						
						// now bind the reversal and checking
						inputPlain.bind('focus blur keyup', function(e) {
							
							// remove spaces
							inputPlain.val( inputPlain.val().split(' ').join('') );
							
							if ( e.type == 'blur' ) {
								inputPassword.val(inputPlain.val());
								inputPlain.remove();
								inputPassword.show();
							}
							
							var s = $.password.getScore( inputPlain.val() );				
							$.password.setBox( passwordId, s );
							
						});			
					
					}
				
				} else {
				
					var s = $.password.getScore( $(this).val() );				
					$.password.setBox( passwordId, s );
					
				}
				
			});
			
			inputPassword.bind('blur', function(e) { 
				var s = $.password.getScore( $(this).val() );				
				$.password.setBox( passwordId, s );
			});
			
			// add the generate password button
			//inputPassword.parent().css('position','relative');
			$('<a>').attr({
				href: 'javascript:',
				title: 'Generate a random password'
			}).css({
				display: 'block',
				width: inputPassword.outerHeight(),
				height: inputPassword.outerHeight(),
				background: '#333',
				color: '#fff',
				'text-decoration': 'none',
				position: 'absolute',
				left: inputPassword.position().left + inputPassword.outerWidth() + 3,
				top: inputPassword.position().top + 2,
				'text-align': 'center'
			}).html('&#8225;').bind('click', function() {
				var newPassword = $.password.makePassword($.password.options.useSymbols, $.password.options.bestLength);
				inputPassword.val(newPassword).focus();
				$.password.setBox( passwordId, $.password.getScore(newPassword) );
			}).insertAfter(inputPassword);

		});
	};
	
	
	$.password = {
			
		makeBox: function(obj) {
		
			var id = obj.attr('id'); 
			
			if ( !$('div#'+id+'Result').length ) {
				var html = '<div id="'+id+'Result" class="'+this.options.resultClass+'"><span></span></div>';
				obj.parent().append(html);
			}
			
			return id;
			
		},
		
		setBox: function(id,s) {
			
			$('#'+passwordId+'Error').hide();

			if ( !s ) {
				var pct = '100%';
				s = 0;
				$.password.showError();
			} else { 
				// work out %
				var pct = (s*20)+'%';
			}
			$('#'+id+'Result span').css({ 
				width: pct,
				background: '#'+this.options.colours[s]
			});
		},
		
		showError: function() {
					
			if ( !$('#'+passwordId+'Error').length ) {
				
				// work out which objecto get position from
				var positionObject = ( inputPassword.is(":visible") ) ? inputPassword : inputPlain;
				
				$('<div>').attr('id',passwordId+'Error').css({
					position: 'absolute',
					top: positionObject.position().top - 30,
					left: positionObject.position().left + ( positionObject.outerWidth()/2 ),
					background: '#c00',
					color: '#fff',
					width: '150px',
					'font-size': '11px',
					border: '2px solid #ddd',
					'box-shadow': '0px 0px 6px #000',
					'-moz-box-shadow': '0px 0px 6px #000',
					'-webkit-box-shadow': '0px 0px 6px #000',
					padding:'4px 10px 4px 10px',
					'border-radius': '6px',
					'-moz-border-radius': '6px',
					'-webkit-border-radius': '6px',
					'z-index': 9999,
					opacity: 0.95
				}).html(errorMsg).insertBefore(inputPassword);
			} else {
				$('#'+passwordId+'Error').html(errorMsg);
				$('#'+passwordId+'Error').show();
			}
		},
		
		getScore: function(word) {
						
			var score = 0;			

			// if password bigger than minLength 
			if ( word.length >= this.options.minLength ) {
				score++;
			} else {
				errorMsg = 'Password must be at least '+$.password.options.minLength+' characters long';
				return false;
			}

			// if password has both lower and uppercase char 
			if ( ( word.match(/[a-z]/) ) &&  (word.match(/[A-Z]/) ) ) {
				score++;
			} else if ( $.password.options.requireCapital ) {
				errorMsg = 'Password must contain lowercase and uppercase characters';
				return false;
			}

			// if password has at least one number
			if ( word.match(/\d+/) ) {
				score++;
			} else if ( $.password.options.requireNumber ) {
				errorMsg = 'Password must contain both letters and numbers';
				return false;
			}

			// if password has at least one special char
			if ( word.match(/[^\a-z|\d|\s]/i) )
				score++;

			// if password bigger than 12
			if ( word.length >= $.password.options.bestLength )
				score++;
			
			return score;

		},
		
		makePassword: function (wantSymbols, lengthOfPassword) {
						
			// Strings for letters and numbers, array for symbols
		    var theLetters = "abcdefghijklmnopqrstuvwxyz";
		    var theNumbers = "1234567890";
		    var theSymbols = [ "!", "$", "%", "^", "&", "*", "(", ")", "-", "_", "=", "+", "[", "{", "]", "}", ";", ":", "@", "#", "~", "\\", "|", ",", "<", ".", ">", "/", "?"];
		    
		    //ARRAYS
		    	// Variable for strong password
		    	var strongPasswordArray = new Array();

		    //LETTERS
		    	// Generate an array of random letters, up to the user's chosen length
		    	for(var loop=0; loop < lengthOfPassword; loop++)
		    	{
				    // Get a random number between zero and one for each one to decide if we'll capitalise each letter as we loop through the array
				    var capitalise = Math.round(Math.random()*1);
				    if(capitalise == 0) {
		    			strongPasswordArray[loop] = theLetters.charAt(Math.round(Math.random()*25)).toUpperCase();
				    } else {
		    			strongPasswordArray[loop] = theLetters.charAt(Math.round(Math.random()*25));
				    }
			    }

		    //NUMBERS
		    	// Get a random number between one and the length; 
		    	// insert that many numerical digits at random places in the string
		    	var numberOfDigits;
		    	numberOfDigits = Math.round(Math.random() * (lengthOfPassword - 1)) + 1;
		    	// Loop to add that amount of numbers
		    	for ( var loop=0; loop < numberOfDigits; loop++ ) {
				    // choose a random position in the string for the number
				    var positionForNumeric = Math.round(Math.random() * (lengthOfPassword - 1));	// choose a position for this number, less than the length of the password
				    // Note that the same position may be chosen more than once,
				    // due to the random function, so we may get less numbers than the number chosen
				    // choose a number from 0 to 9
				    var theNumber = Math.round(Math.random()*9);
				    // insert that number
				    strongPasswordArray[positionForNumeric] = theNumber;
			    }

		    //SYMBOL
		    	if ( wantSymbols ) {
		    	    // Put a symbol in the second, third, fourth, fifth or sixth position
		    	    // Get a random number between two and six to decide where to put in a symbol
		    	    //  and put a random symbol in the second, third, fourth, fifth or sixth position
		    	    var positionForSymbol = Math.round(Math.random()*4) + 2;
		    	    // Choose a number from 0 to the length of the theSymbols array, to choose a symbol
		    	    var locationOfSymbolInArray = Math.round(Math.random()*(theSymbols.length - 1));
		    	    var theSymbol = theSymbols[locationOfSymbolInArray];
		    	    // Insert that symbol
		    	    strongPasswordArray[positionForSymbol] = theSymbol;
		        

		        }
		    	
		    	// check that it validates
		    	strongPasswordString = strongPasswordArray.join(''); 
		    	if ( !$.password.getScore(strongPasswordString) ) {
		    		return $.password.makePassword(wantSymbols, lengthOfPassword);
		    	}
		    	
			    return strongPasswordString;
		    }
			

	};

})(jQuery);