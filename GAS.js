/*!
 * GAS v0.2.1
 * http://gas.catalystinc.com
 * Copyright 2010, Rui Da Costa
 * Dual licensed under the MIT or Creative Commons Attribution 3.0 Unported licenses.
 * http://gas.catalystinc.com/license
 */

if(typeof window.jQuery != 'undefined'){ try{
		var jq = document.createElement('script'); jq.type = 'text/javascript';
		jq.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(jq, s);
	} catch(e) {}
}
jQuery.noConflict();
$gas = window.jQuery;

var getObjForm = function(obj, myFormIndex){
	var myParent = obj;
	while(myParent.tagName.toLowerCase()!="form"){
		myParent = $gas(myParent).parent().get(0);
	}
	var formName=(($gas(myParent).attr("name")!=undefined)&&($gas(myParent).attr("name")!="")&&($gas(myParent).attr("name")!=null))?$gas(myParent).attr("name"):(($gas(myParent).attr("id")!=undefined)&&($gas(myParent).attr("id")!="")&&($gas(myParent).attr("id")!=null))?$gas(myParent).attr("id"):"form"+myFormIndex;
	return formName;
};

var GASConsole = function(){
	if(typeof(console) !== 'undefined' && console != null) {
		console.log('GAS:', arguments);
	}
};

var _gaq = _gaq || [];
(function() {
	try{
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	}
	catch(e){
		GAS.console(e);
	}
})();

var GAS = function(account, settings){
	this.account = account;
	this.settings = settings;
	this.tracker = '';
	this.domain = '';
	this.vars = [];
	
	this.defaults = {
		page: '',
		base: window.location.href.substring(0,window.location.href.lastIndexOf("/")+1),
		files: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'mp3', 'txt'],
		spider:true,
		debug:false,
		trackPage:true,
		trackOutbound:true,
		trackFile:true,
		trackHash:true,
		trackLightbox:true,
		lightboxClass:'lightbox',
		trackMail:true,
		trackForm:true,
		trackFormField:true,
		trackUsingHref:true,
		categoryOutbound:'Outbound',
		categoryFile:'File',
		categoryHash:'Hash',
		categoryLightbox:'Lightbox',
		categoryMail:'Mail',
		categoryForm:'Form',
		typeOutbound:'Event',
		typeFile:'Page',
		typeHash:'Page',
		typeLightbox:'Page',
		typeMail:'Page',
		linkOrder:['Custom', 'Event', 'Hash', 'Lightbox', 'File', 'Outbound', 'Mail']
	};
	
	this.init = function(){
		var myGAS = this;
		myGAS.settings = ((typeof settings == 'object') && (settings != undefined))?settings:myGAS.defaults;
		if(window.location.hash != ''){
			if(window.location.hash.search('GASdebug') > 0){
				myGAS.settings.debug = true;
			}
		}
		if(myGAS.settings.debug){
			GASConsole('Init');
		}
		_gaq.push(['_setAccount', myGAS.account]);
	};
	this.init();
	
	this.setDomain = function(domain){
		var myGAS = this;
		if(myGAS.settings.debug){
			GASConsole('Set Domain');
		}
		myGAS.domain = domain;
		_gaq.push(['_setDomainName', myGAS.domain]);
		//myGAS.tracker = myGAS.tracker._setDomainName(myGAS.domain);
	};
	
	this.addVar = function(variable){
		var myGAS = this;
		if(myGAS.settings.debug){
			GASConsole('Add Variable');
		}
		var myVar = new Object();
		if(typeof variable == 'object'){
			myVar.slot=(variable.slot!=undefined)?variable.slot:1;
			myVar.name=(variable.name!=undefined)?variable.name:false;
			myVar.value=(variable.value!=undefined)?variable.value:'';
			myVar.scope=(variable.scope!=undefined)?variable.scope:'';
		}
		else {
			myVar.slot=1;
			myVar.name=false;
			myVar.value=variable;
			myVar.scope=1;
		}
		if((myVar.value != undefined) && (myVar.value != '')){
			myGAS.vars.push(myVar);
		}
	};
	
	this.addFile = function(file){
		var myGAS = this;
		if(myGAS.settings.debug){
			GASConsole('Add File');
		}
		if($gas.inArray(file, myGAS.settings.files) < 0){
			myGAS.settings.files.push(file);
		}
	};
	
	this.trackPage = function(page){
		var myGAS = this;
		if(myGAS.settings.debug){
			GASConsole('Track Page', page);
		}
		//var pageTracker = myGAS.tracker;
		try{
			_gaq.push(['_trackPageview', page]);
			//pageTracker._trackPageview(page);
		}
		catch(err){}
	};
	
	this.trackEvent = function(category, action, label, value){
		var myGAS = this;
		if(myGAS.settings.debug){
			GASConsole('Track Event', category, action, label, value);
		}
		//var pageTracker = myGAS.tracker;
		try{
			if((value != undefined) && (value.toString().search(/^-?[0-9]+$/) == 0)){
				_gaq.push(['_trackEvent', category, action, label, value.parseInt()]);
				//pageTracker._trackEvent(category, action, label, value.parseInt());
			}
			else {
				if(value != undefined){
					label = label +'|'+value;
				}
				_gaq.push(['_trackEvent', category, action, label]);
				//pageTracker._trackEvent(category, action, label);
			}
		}
		catch(err){
			if(myGAS.settings.debug){
				GASConsole('Track Event Catch', err);
			}
		}
	};
	
	//Historic 'run' function
	this.run = function(){
		this.pump();
	};
	
	//Runs the Spider
	this.pump = function(){
		var myGAS = this;
		if(myGAS.settings.debug){
			GASConsole('Pump');
		}
		//var pageTracker = myGAS.tracker;
		
		//Attempts to load the initial pageview tracking
		try{
			//Checks to see if any custom variables are set for Google Analytics from the GAS object settings
			if(myGAS.vars.length > 0){
				for(var i=0; i<myGAS.vars.length; i++){
					var variable = myGAS.vars[i];
					if(typeof variable == 'object' && (variable.name != false)){
						_gaq.push(['_setCustomVar', variable.slot, variable.name, variable.value, variable.scope]);
						//pageTracker._setCustomVar(variable.slot, variable.name, variable.value, variable.scope);
					}
					else if(typeof variable == 'string'){
						_gaq.push(['_setCustomVar', 5, 'Event', variable, 1]);
						//pageTracker._setVar(variable);
					}
					if(myGAS.settings.debug){
						GASConsole('Variable Set', variable);
					}
				}
			};
			
			//Runs the page track if 'trackPage' is set in settings.
			if(myGAS.settings.trackPage){
				myGAS.trackPage(myGAS.settings.page);
			}
		}
		catch(err){}
		
		
		if(myGAS.settings.spider){
			//Begin Link Spider
			$gas("a").each(function(linkIndex, currentLink){
				var done = false;
				
				//Checks the link for a 'href' attribute, otherwise skips the spider
				if(!$gas(currentLink).attr("href")){
					done = true;
				}
				var trackAs = '';
				var trackCat = 'Custom';
				var trackAction = 'Click';
				var trackWith = '';
				if($gas(currentLink).attr("trackas") && ($gas(currentLink).attr("trackas") != '')){
					trackAs = $gas(currentLink).attr("trackas").toLowerCase();
				}
				if($gas(currentLink).attr("trackcat") && ($gas(currentLink).attr("trackcat") != '')){
					trackCat = $gas(currentLink).attr("trackcat");
				}
				if($gas(currentLink).attr("trackaction") && ($gas(currentLink).attr("trackaction") != '')){
					trackAction = $gas(currentLink).attr("trackaction");
				}
				if($gas(currentLink).attr("trackwith") && ($gas(currentLink).attr("trackwith") != '')){
					trackWith = $gas(currentLink).attr("trackwith");
				}
				
				//Runs the spider based on the order from 'linkOrder' in the settings
				for(var i = 0; i<myGAS.settings.linkOrder.length; i++){
					var currentOrder = myGAS.settings.linkOrder[i];
					switch (currentOrder){
						
						//Checks the link to see if its domain matches the page domain, tracks an 'Outbound' view
						case 'Outbound':
						if(!done && myGAS.settings.trackOutbound){
							if(($gas(currentLink).attr("href").indexOf('://') > -1) && $gas(currentLink).attr("href").indexOf(myGAS.settings.base) == -1){
								$gas(currentLink).click(function(){
									var trackLink = '';
									var trackValue = myGAS.settings.page + "/" + myGAS.settings.categoryOutbound + "/";
									if(trackWith != ''){
										trackLink = trackWith;
										try{
											var tempStr = eval(trackWith);
											if(typeof tempStr == 'string'){
												trackLink = tempStr;
											}
										}catch(error){
										}
										trackValue += trackWith;
									}
									else if (myGAS.settings.trackUsingHref)
									{
										trackLink = $gas(currentLink).attr("href");
										trackValue += $gas(currentLink).attr("href");								
									}
									else
									{
										trackLink = $gas(currentLink).html();
										trackValue += $gas(currentLink).html();
									}
									switch(myGAS.settings.typeOutbound.toLowerCase()){
										case 'event':
										myGAS.trackEvent('Click', myGAS.settings.categoryOutbound, trackValue);
										break;
										
										default:
										myGAS.trackPage(trackValue);
									}
								});
								done = true;
							}
							if(!done && trackAs == 'outbound'){
								$gas(currentLink).click(function(){
									var trackLink = '';
									var trackValue = myGAS.settings.page + "/" + myGAS.settings.categoryOutbound + "/";
									if(trackWith != ''){
										trackLink = trackWith;
										try{
											var tempStr = eval(trackWith);
											if(typeof tempStr == 'string'){
												trackLink = tempStr;
											}
										}catch(error){
										}
										trackValue += trackWith;
									}
									else if (myGAS.settings.trackUsingHref)
									{
										trackLink = $gas(currentLink).attr("href");
										trackValue += $gas(currentLink).attr("href");								
									}
									else
									{
										trackLink = $gas(currentLink).html();
										trackValue += $gas(currentLink).html();
									}
									switch(myGAS.settings.typeOutbound.toLowerCase()){
										case 'event':
										myGAS.trackEvent('Click', myGAS.settings.categoryOutbound, trackValue);
										break;
										
										default:
										myGAS.trackPage(trackValue);
									}
								});
								done = true;
							}
						}
						break;
						
						//Checks for # in the link and if it is the same page as the current page, tracks a 'Hash' view
						case 'Hash':
						if(!done && myGAS.settings.trackHash){
							if($gas(currentLink).attr("href").indexOf('#') > -1){
								var linkLoc = ($gas(currentLink).attr("href").split('#'))[0];
								var pageLoc = (window.location.href.split('#'))[0];
								if(((linkLoc == pageLoc) || (linkLoc == '')) && ($gas(currentLink).attr("href").split('#')[1] != '')){
									$gas(currentLink).click(function(){
										var trackLink = $gas(currentLink).attr("href").split('#')[1];
										var trackValue = myGAS.settings.page + "/" + myGAS.settings.categoryHash + "/" + trackLink;
										switch(myGAS.settings.typeHash.toLowerCase()){
											case 'event':
											myGAS.trackEvent('Click', myGAS.settings.categoryHash, trackLink);
											break;
											
											default:
											myGAS.trackPage(trackValue);
										}
									});
									done = true;
								}
							}
							if(!done && trackAs == 'hash'){
								$gas(currentLink).click(function(){
									var trackLink = '';
									var trackValue = myGAS.settings.page + "/" + myGAS.settings.categoryHash + "/";
									if(trackWith != ''){
										trackLink = trackWith;
										try{
											var tempStr = eval(trackWith);
											if(typeof tempStr == 'string'){
												trackLink = tempStr;
											}
										}catch(error){
										}
										trackValue += trackWith;
									}
									else if (myGAS.settings.trackUsingHref)
									{
										trackLink = $gas(currentLink).attr("href");
										trackValue += $gas(currentLink).attr("href");								
									}
									else
									{
										trackLink = $gas(currentLink).html();
										trackValue += $gas(currentLink).html();
									}
									switch(myGAS.settings.typeHash.toLowerCase()){
										case 'event':
										myGAS.trackEvent('Click', myGAS.settings.categoryHash, trackLink);
										break;
										
										default:
										myGAS.trackPage(trackValue);
									}
								});
								done = true;
							}
						}
						break;
						
						//Checks for the specified 'lightbox' class on the link, tracks a 'Lightbox' view
						case 'Lightbox':
						if(!done && myGAS.settings.trackLightbox){
							if($gas(currentLink).hasClass(myGAS.settings.lightboxClass)){
								$gas(currentLink).click(function(){
									var trackLink = '';
									var trackValue = myGAS.settings.page + "/" + myGAS.settings.categoryLightbox + "/";
									if(trackWith != ''){
										trackLink = trackWith;
										try{
											var tempStr = eval(trackWith);
											if(typeof tempStr == 'string'){
												trackLink = tempStr;
											}
										}catch(error){
										}
										trackValue += trackWith;
									}
									else if (myGAS.settings.trackUsingHref)
									{
										trackLink = $gas(currentLink).attr("href");
										trackValue += $gas(currentLink).attr("href");								
									}
									else
									{
										trackLink = $gas(currentLink).html();
										trackValue += $gas(currentLink).html();
									}
									switch(myGAS.settings.typeLightbox.toLowerCase()){
										case 'event':
										myGAS.trackEvent('Click', myGAS.settings.categoryLightbox, trackLink);
										break;
										
										default:
										myGAS.trackPage(trackValue);
									}
								});
								done = true;
							}
							if(!done && trackAs == 'lightbox'){
								$gas(currentLink).click(function(){
									var trackLink = '';
									var trackValue = myGAS.settings.page + "/" + myGAS.settings.categoryLightbox + "/";
									if(trackWith != ''){
										trackLink = trackWith;
										try{
											var tempStr = eval(trackWith);
											if(typeof tempStr == 'string'){
												trackLink = tempStr;
											}
										}catch(error){
										}
										trackValue += trackWith;
									}
									else if (myGAS.settings.trackUsingHref)
									{
										trackLink = $gas(currentLink).attr("href");
										trackValue += $gas(currentLink).attr("href");								
									}
									else
									{
										trackLink = $gas(currentLink).html();
										trackValue += $gas(currentLink).html();
									}
									switch(myGAS.settings.typeLightbox.toLowerCase()){
										case 'event':
										myGAS.trackEvent('Click', myGAS.settings.categoryLightbox, trackLink);
										break;
										
										default:
										myGAS.trackPage(trackValue);
									}
								});
								done = true;
							}
						}
						break;
						
						//Checks the file extension on the link, if it matches the list of trackable files, tracks a 'File' view
						case 'File':
						if(!done && myGAS.settings.trackFile){
							$gas(myGAS.settings.files).each(function(index, file){
								if(!done){
									var file=myGAS.settings.files[index];
									if(($gas(currentLink).attr("href").indexOf("."+file) > -1)){
										$gas(currentLink).click(function(){
											var trackLink = '';
											var trackValue = myGAS.settings.page + "/" + myGAS.settings.categoryFile + "/" + file + "/";
											if(trackWith != ''){
												trackLink = trackWith;
												try{
													var tempStr = eval(trackWith);
													if(typeof tempStr == 'string'){
														trackLink = tempStr;
													}
												}catch(error){
												}
												trackValue += trackWith;
											}
											else if (myGAS.settings.trackUsingHref)
											{
												trackLink = $gas(currentLink).attr("href");
												trackValue += $gas(currentLink).attr("href");								
											}
											else
											{
												trackLink = $gas(currentLink).html();
												trackValue += $gas(currentLink).html();
											}
											switch(myGAS.settings.typeFile.toLowerCase()){
												case 'event':
												myGAS.trackEvent('Click', myGAS.settings.categoryFile, trackLink);
												break;
												
												default:
												myGAS.trackPage(trackValue);
											}
										});
										done = true;
									}
								}
							});
							if(!done && trackAs == 'file'){
								$gas(currentLink).click(function(){
									var trackLink = '';
									var trackValue = myGAS.settings.page + "/" + myGAS.settings.categoryFile + "/";
									if(trackWith != ''){
										trackLink = trackWith;
										try{
											var tempStr = eval(trackWith);
											if(typeof tempStr == 'string'){
												trackLink = tempStr;
											}
										}catch(error){
										}
										trackValue += trackWith;
									}
									else if (trackUsingHref)
									{
										trackLink = $gas(currentLink).attr("href");
										trackValue += $gas(currentLink).attr("href");
									}
									else
									{
										trackLink = $gas(currentLink).html();
										trackValue += $gas(currentLink).html();
									}
									switch(myGAS.settings.typeFile.toLowerCase()){
										case 'event':
										myGAS.trackEvent('Click', myGAS.settings.categoryFile, trackLink);
										break;
										
										default:
										myGAS.trackPage(trackValue);
									}
								});
								done = true;
							}
						}
						break;
						
						//Checks the link for a 'mailto:', tracks a 'Mail' view
						case 'Mail':
						if(!done && myGAS.settings.trackMail){
							if($gas(currentLink).attr("href").indexOf("mailto:") > -1){
								var email = (($gas(currentLink).attr("href").split(":",2))[1].split("?"))[0];
								$gas(currentLink).click(function(){
									var trackValue = myGAS.settings.page + "/" + myGAS.settings.categoryMail + "/" + email;
									switch(myGAS.settings.typeFile.toLowerCase()){
										case 'event':
										myGAS.trackEvent('Click', myGAS.settings.categoryMail, email);
										break;
										
										default:
										myGAS.trackPage(trackValue);
									}
								});
								done = true;
							}
							if(!done && trackAs == 'mail'){
								$gas(currentLink).click(function(){
									var trackLink = '';
									var trackValue = myGAS.settings.page + "/" + myGAS.settings.categoryMail + "/";
									if(trackWith != ''){
										trackLink = trackWith;
										try{
											var tempStr = eval(trackWith);
											if(typeof tempStr == 'string'){
												trackLink = tempStr;
											}
										}catch(error){
										}
										trackValue += trackWith;
									}
									else if (myGAS.settings.trackUsingHref)
									{
										trackLink = $gas(currentLink).attr("href");
										trackValue += $gas(currentLink).attr("href");								
									}
									else
									{
										trackLink = $gas(currentLink).html();
										trackValue += $gas(currentLink).html();
									}
									switch(myGAS.settings.typeFile.toLowerCase()){
										case 'event':
										myGAS.trackEvent('Click', myGAS.settings.categoryMail, trackLink);
										break;
										
										default:
										myGAS.trackPage(trackValue);
									}
								});
								done = true;
							}
						}
						break;
						
						//Checks if 'trackas' is set to 'Custom'
						case 'Custom':
						if(!done && trackAs == 'custom'){
							$gas(currentLink).click(function(){
								var trackLink = '';
								var trackValue = myGAS.settings.page + "/"
								if(trackWith != ''){
									trackLink = trackWith;
									try{
										var tempStr = eval(trackWith);
										if(typeof tempStr == 'string'){
											trackLink = tempStr;
										}
									}catch(error){
									}
									trackValue += trackWith;
								}
								else if (myGAS.settings.trackUsingHref)
								{
									trackLink = $gas(currentLink).attr("href");
									trackValue += $gas(currentLink).attr("href");
								}
								else
								{
									trackLink = $gas(currentLink).html();
									trackValue += $gas(currentLink).html();
								}
								myGAS.trackPage(trackValue);
							});
							done = true;
						}
						break;
						
						//Checks if 'trackas' is set to 'Event'
						case 'Event':
						if(!done && trackAs == 'event'){
							$gas(currentLink).click(function(){
								var trackLink = '';
								if(trackWith != ''){
									trackLink = trackWith;
									try{
										var tempStr = eval(trackWith);
										if(typeof tempStr == 'string'){
											trackLink = tempStr;
										}
									}catch(error){
									}
								}
								else if (myGAS.settings.trackUsingHref)
								{
									trackLink = $gas(currentLink).attr("href");
								}
								else
								{
									trackLink = $gas(currentLink).html();
								}
								myGAS.trackEvent(trackCat, trackAction, trackLink);
							});
							done = true;
						}
						break;
					}
				}
			});
			//End Link Spider
			
			
			//Start Form Spider
			$gas("form").each(function(formIndex){
				var myForm = this;
				var myFormIndex = formIndex;
				
				//Runs form field spider if 'trackFormField' is set in settings
				if(myGAS.settings.trackFormField){
					
					//Spiders input, select and textareas
					$gas(myForm).find("input, select, textarea").each(function(inputIndex,myInput){
						
						//Stores the start value for the field when it is focused
						$gas(myInput).focus(function(){
							var myValue = '';
							if(($gas(myInput).get(0).tagName.toLowerCase()=="select") && ($gas(myInput).attr("multiple")!="")){
								var myValues = new Array();
								for(var o=0; o<this.options.length; o++){
									var myOption = this.options[o];
									if(myOption.selected){
										myValues.push(myOption.value);
									}
								}
								myValue = myValues.toString();
							}
							else{
								myValue = $gas(myInput).val();
							}
							myValue = escape(myValue);
							$gas(myInput).attr("startValue", myValue);
						});
						
						//Checks to see if the value on blur is the same as the start value
						$gas(myInput).blur(function(){
							var myValue = "";
							
							//Catch for a select with multiple options
							if(($gas(myInput).get(0).tagName.toLowerCase()=="select") && ($gas(myInput).attr("multiple")!="")){
								var myValues = new Array();
								for(var o=0; o<this.options.length; o++){
									var myOption = this.options[o];
									if(myOption.selected){
										myValues.push(myOption.value);
									}
								}
								myValue = myValues.toString();
							}
							else{
								myValue = $gas(myInput).val();
							}
							myValue = escape(myValue);
							
							//Compares start and current values
							if((myValue != null) && (myValue != undefined)){
								var formName = getObjForm(this, myFormIndex);
								var inputName= (($gas(myInput).attr("name")!=undefined)&&($gas(myInput).attr("name")!="")&&($gas(myInput).attr("name")!=null))?$gas(myInput).attr("name"):(($gas(myInput).attr("id")!=undefined)&&($gas(myInput).attr("id")!="")&&($gas(myInput).attr("id")!=null))?$gas(myInput).attr("id"):"Option"+inputIndex;
								var startValue = (($gas(myInput).attr("startValue") != undefined) && ($gas(myInput).attr("startValue") != null))?$gas(myInput).attr("startValue"):"";
								var actionName = "No_Change";
								if(myValue != startValue){
									actionName="Change";
								}
								myValue = unescape(myValue);
								myGAS.trackEvent(formName.toString(),actionName.toString(),inputName.toString());
							}
						});
						
						//Tracks an event for button presses, submit presses, reset presses and checkbox presses
						if(($gas(myInput).attr("type")!=null)&&($gas(myInput).attr("type")!=undefined)&&($gas(myInput).attr("type")!="")&&(($gas(myInput).attr("type").toLowerCase()=="button")||($gas(myInput).attr("type").toLowerCase()=="submit")||($gas(myInput).attr("type").toLowerCase()=="reset")||($gas(myInput).attr("type").toLowerCase()=="image")||($gas(myInput).attr("type").toLowerCase()=="checkbox")||($gas(myInput).attr("type").toLowerCase()=="radio"))){
							$gas(myInput).click(function(){
								var formName = getObjForm(this,myFormIndex);
								var inputName= (($gas(myInput).attr("name")!=undefined)&&($gas(myInput).attr("name")!="")&&($gas(myInput).attr("name")!=null))?$gas(myInput).attr("name"):(($gas(myInput).attr("id")!=undefined)&&($gas(myInput).attr("id")!="")&&($gas(myInput).attr("id")!=null))?$gas(myInput).attr("id"):"Option"+inputIndex;
								var actionName="Click";
								var myValue = ($gas(myInput).val()!="")?$gas(myInput).val():"";
								myGAS.trackEvent(formName.toString(),actionName.toString(),inputName.toString());
							});
						}
					});
				}
				
				var trackWith = '';
				
				if($gas(myForm).attr("trackwith") && ($gas(myForm).attr("trackwith") != '')){
					trackWith = $gas(myForm).attr("trackwith");
				}
				
				//Form tracking if 'trackForm' is enabled in the settings
				if(myGAS.settings.trackForm){
					$gas(myForm).submit(function(){
						var formName = getObjForm(this,myFormIndex);
						var trackValue = myGAS.settings.page + "/" + myGAS.settings.categoryForm + "/" + formName + "/Submit";
						myGAS.trackEvent(formName,"Submit");
						if(trackWith != ''){
							trackValue = trackWith;
						}
						myGAS.trackPage(trackValue);
					});
				}
			});
			//End Form Spider
		}
	};
};