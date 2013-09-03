//--------------------------------------------------------------------------------------------------
/**
 * Javascript template engine with Smarty notation
 * Free for commercial & non-commercial usage.
 *
 * @package EmphaticJS
 * @version 0.9
 * @author Grzegorz Marchwinski
 */
//--------------------------------------------------------------------------------------------------
var YAJSmartyTemplate = function( options ) {
	/** @var YAJSmartyResourceCache */
	this.oYAJSmartyResourceCache = null;	
	this.templateVars = {};
	if ( options != null ) {
		$.extend( this, options );
	}
};
/**
 * @return YAJSmartyResourceCache;
 */
YAJSmartyTemplate.prototype.getResourceCache = function() {
	if (this.oYAJSmartyResourceCache == null ) {
		this.oYAJSmartyResourceCache = new YAJSmartyResourceCache();
	}
	return this.oYAJSmartyResourceCache;
}

YAJSmartyTemplate.prototype.assign = function(sVarName, varValue) {
	this.templateVars[sVarName] = varValue;
};

YAJSmartyTemplate.prototype.loadResource = function( sResourceName ) {
	var result = null;
	//alert('ajax load: ' + sResourceName );
	$.ajax({
		async: false,
		type: 'GET',
		url: sResourceName,
		dataType: 'html',
		success: function(data){
			result = data;
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
		}
	});

	return new YAJSmartyResourceCacheItem( {
		name: sResourceName,
		data: this.compile( result )
	});
};

YAJSmartyTemplate.prototype.findObjects = function(data) {
//	var re_obiekty = /\{\$[A-z0-9_]+([\.][A-z0-9_]+(\(\))*)+\}/igm; //wyciagniecie elementów w formie {$element.pole.poleMozeBycMetoda().innepole}
	var re_objects = new RegExp(		
		"\\{\\$" +				// {$
		"[a-z0-9_]+" +			// some_object_Name 
		"("+
			"[\\.]"+			// .
			"[a-z0-9_]+"+		// some_object_property_or_method
			"(" + 
				"\\(\\)"+		// ()								//method brackets
			")?"+				//									//0 or 1 brackets
		")+"+
		"\\}",					// }
		"igm"
	); //wyciagniecie elementów w formie {$element.pole.poleMozeBycMetoda().innepole}	
		
	var aObjects = data.match(re_objects);
	return aObjects;
}

YAJSmartyTemplate.prototype.findVariables = function(data) {
	var re_proste_zmienne = /\{\$[a-z0-9_]+\}/igm; //wyciagniecie elementow w formie {$element}

	var aSimpleVariables = data.match(re_proste_zmienne);
	return aSimpleVariables;
}

YAJSmartyTemplate.prototype.fillTemplateVars = function(aFoundElements, oTemplateVars) {
	var sProstaZmienna = null;
	var sProstaZmiennaName = null;
	for(var key in aFoundElements) {
		sProstaZmienna = new String( aFoundElements[key] );
		sProstaZmiennaName = sProstaZmienna.replace( /[\{\$\}]/igm, '' ); //ze stringa w formacie '{$element}' robi 'element'
//		console.log(sProstaZmiennaName);
		oTemplateVars[sProstaZmiennaName] = ''; //wpisywanie zmiennych do obiektu... jednocześnie mergowanie gdy zmienna występuje więcej razy
	}
//	console.log(oTemplateVars);

}

YAJSmartyTemplate.prototype.replaceTemplateVars = function(data, oTemplateVars) {
	var rePattern = null;
	var sWartoscZmiennej = null;
	for(var sProstaZmiennaName in oTemplateVars) {
//		console.log(sProstaZmiennaName);
		var sProstaZmiennaNameRe = sProstaZmiennaName.replace( /\./igm, '\\.' );  
		sProstaZmiennaNameRe = sProstaZmiennaNameRe.replace( /\(/igm, '\\(' );  
		sProstaZmiennaNameRe = sProstaZmiennaNameRe.replace( /\)/igm, '\\)' );  		
		var sReplacePattern = '\\{\\$' + sProstaZmiennaNameRe + '\\}';
//		console.log(sReplacePattern);
		rePattern = new RegExp(sReplacePattern,'igm'); //;
		sWartoscZmiennej = '\' + o.' + sProstaZmiennaName + ' + \'';
		data = data.replace( rePattern, sWartoscZmiennej );
	}
	return data;
}

/**
 * koncepcja jest taka ze ze stringa będącego templatem smarty robi obiekt javascriptowy z metodą fetch:
 * 'tresc template-a {$o.zmienna1} dalsza tresc template-a {$o.innazmienna} koniec template-a'
 * 
 * oCompiledTempplate = {
 *	function fetch(o) {
 *    return 'tresc template-a ' + o.zmienna1 + ' dalsza tresc template-a ' + o.innazmienna + ' koniec template-a';
 *	}
 * }
 * 
 * potem tak zbudowany string jest 'kompilowany' za pomocą eval()
 * 
 * poza tym wszystkie nazwy zmiennych występujące w szablonie sa zapisywane do obiektu oTemplateVars
 * oTemplateVars = {
 *   'o.zmienna1': '',
 *   'o.zmienna2': ''
 * }
 */
YAJSmartyTemplate.prototype.compile = function( data ) {
	//var data = 'ala\\asd \'to jest tekst w apostrofie\'\n ma <b>{$zmienna1} -{sdf} sdf{$zmienna2} - {$zmienna_3} {$zmienna4.param} - {$zmienna5.param1.param2} - {$zmienna6.param1.param2()}</b>kota';
	if (data == null) {
		data = '';
	}

	var aSimpleVariables = this.findVariables(data);
	var aObjects = this.findObjects(data);
//	console.log(aSimpleVariables);
//	console.log(aObjects);

	data = data.replace( /\{[\/]{0,1}literal\}/igm, '' );   //wywalanie dyrektyw Smarty {literl} {/literal} - w cely wywalenia enterów należy jeszcze dodac na koncu tego wyrazenia: ([\r][\n]|[\n]{0,1}|[\r]{0,1})
	data = data.replace( /\\/igm, '\\\\' );   //zamiana backslasha na string backlshasha \ => \\
	data = data.replace( /\'/igm, '\\\'' ); //znak apostrofu na \'
	data = data.replace( /\n/igm, '\\n' );  //znak konca linii na \n
	data = data.replace( /\r/igm, '\\r' );  //znak przejscia karetki na \r
	data = '\'' + data + '\'';              //zamkniecie calego stringa w apostrofy

	var oTemplateVars = {};
	this.fillTemplateVars(aSimpleVariables, oTemplateVars);
	this.fillTemplateVars(aObjects, oTemplateVars);
	data = this.replaceTemplateVars(data, oTemplateVars);
/*	
	var sProstaZmienna = null;
	var sProstaZmiennaName = null;
	for(var key in aSimpleVariables) {
		sProstaZmienna = new String( aSimpleVariables[key] );
		sProstaZmiennaName = sProstaZmienna.replace( /[\{\$\}]/igm, '' ); //ze stringa w formacie '{$element}' robi 'element'
		oTemplateVars[sProstaZmiennaName] = ''; //wpisywanie zmiennych do obiektu... jednocześnie mergowanie gdy zmienna występuje więcej razy
	}

	var rePattern = null;
	var sWartoscZmiennej = null;
	for(sProstaZmiennaName in oTemplateVars) {
		rePattern = new RegExp('\\{\\$' + sProstaZmiennaName + '\\}','igm'); //;
		sWartoscZmiennej = '\' + o.' + sProstaZmiennaName + ' + \'';
		data = data.replace( rePattern, sWartoscZmiennej );
	}
	*/

	var oCompiledTemplate = null;
	var sJS = 'oCompiledTemplate = { \n\
		fetch: function(o) { \n\
			return ' + data + '; \n\
		} \n\
	\n}';
//	console.log(sJS);
	eval( sJS );
//	console.log(oCompiledTemplate);
	return new YAJSmartyCompiledResource( oTemplateVars, oCompiledTemplate );
}

YAJSmartyTemplate.prototype.getCompiledResource = function( sResourceName ) {
	var result = null;
	var oResource = this.getResourceCache().getResource(sResourceName);
	if (oResource == null) {
		oResource = this.loadResource(sResourceName);
		this.getResourceCache().putResourceObject( oResource );
	}

	if (oResource != null) {
		result = oResource.data;
	}

	return result;
}

YAJSmartyTemplate.prototype.fetch = function( sResourceName ) {
	var oCompiledResource = this.getCompiledResource(sResourceName);

//	var data = 'ala\\asd \'to jest tekst w apostrofie\'\n ma <b>{$zmienna1} -{sdf} sdf{$zmienna2} - {$zmienna_3} {$zmienna4.param} - {$zmienna5.param1.param2} - {$zmienna6.param1.param2()}</b>kota';
//	var compiled = this.compile(data);

	var oTemplateVars = {};
	$.extend( oTemplateVars, oCompiledResource.templateVars, this.templateVars ); //do pustego obiektu sa kopiowane skompilowane zmienne i nadpisane lokalnie w template

	return oCompiledResource.compiledTemplate.fetch(oTemplateVars);
	
}
