//--------------------------------------------------------------------------------------------------
/**
 * Yet Another Java Script template engine with Smarty notation
 * Free for commercial & non-commercial usage.
 *
 * @package EmphaticJS
 * @version 0.9
 * @author Grzegorz Marchwinski
 */
//--------------------------------------------------------------------------------------------------
var YAJSmartyParser = function( options ) {
	YAJSmartyTools.extend( this, options );
};

YAJSmartyParser.prototype.parse = function( data, oTemplateVars ) {
	var aSimpleVariables = this.findVariables(data);
	var aObjects = this.findObjects(data);

	data = data.replace( /\{[\/]{0,1}literal\}/igm, '' );   //wywalanie dyrektyw Smarty {literl} {/literal} - w cely wywalenia enterów należy jeszcze dodac na koncu tego wyrazenia: ([\r][\n]|[\n]{0,1}|[\r]{0,1})
	data = data.replace( /\\/igm, '\\\\' );   //zamiana backslasha na string backlshasha \ => \\
	data = data.replace( /\'/igm, '\\\'' ); //znak apostrofu na \'
	data = data.replace( /\n/igm, '\\n' );  //znak konca linii na \n
	data = data.replace( /\r/igm, '\\r' );  //znak przejscia karetki na \r
	data = '\'' + data + '\'';              //zamkniecie calego stringa w apostrofy

	this.fillTemplateVars(aSimpleVariables, oTemplateVars);
	this.fillTemplateVars(aObjects, oTemplateVars);
	data = this.replaceTemplateVars(data, oTemplateVars);

	return data;
};

YAJSmartyParser.prototype.findObjects = function(data) {
	var reObjects = new RegExp(		
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
	); //extract elements {$element.field.method().field}	
		
	var aObjects = data.match(reObjects);
	return aObjects;
};

YAJSmartyParser.prototype.findVariables = function(data) {
	var reSimpleVariables = /\{\$[a-z0-9_]+\}/igm; //extract simple, flat element {$element}

	var aSimpleVariables = data.match(reSimpleVariables);
	return aSimpleVariables;
};

YAJSmartyParser.prototype.fillTemplateVars = function(aFoundElements, oTemplateVars) {
	var sElement = null;
	var sElementName = null;
	for(var key in aFoundElements) {
		sElement = new String( aFoundElements[key] );
		sElementName = sElement.replace( /[\{\$\}]/igm, '' ); //remove brackets '{$element}' robi 'element'
		oTemplateVars[sElementName] = ''; //initialize empty element value... and merge for multiple occurences
		//@TODO: wrong initialize for object methods and fields  object.field => oTemplateVars['object'] = { field: ''}
		//or access fields/methods with proxy function
	}
};

YAJSmartyParser.prototype.replaceTemplateVars = function(data, oTemplateVars) {
	var reReplacePattern = null;
	var sJsVariableValueReplacement = null;
	for(var sVariableName in oTemplateVars) {
//		console.log(sProstaZmiennaName);
		//prepare variable name for RE replace - to replace in input string
		var sPreparedFindVariableName = sVariableName.replace( /\./igm, '\\.' );  
		sPreparedFindVariableName = sPreparedFindVariableName.replace( /\(/igm, '\\(' );  
		sPreparedFindVariableName = sPreparedFindVariableName.replace( /\)/igm, '\\)' );  		
		var sReplacePattern = '\\{\\$' + sPreparedFindVariableName + '\\}';
//		console.log(sReplacePattern);
		reReplacePattern = new RegExp(sReplacePattern,'igm'); //;
		sJsVariableValueReplacement = '\' + o.' + sVariableName + ' + \'';
		//TODO: all replacements should be done at one run - i think it should be one RE in whole template with replace callback
		data = data.replace( reReplacePattern, sJsVariableValueReplacement );
	}
	return data;
};