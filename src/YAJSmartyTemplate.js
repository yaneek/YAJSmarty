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
var YAJSmartyTemplate = function( options ) {
	/** @var YAJSmartyResourceCache */
	this.oYAJSmartyResourceCache = null;	
	this.templateVars = {};
	YAJSmartyTools.extend( this, options );
};
/**
 * @return YAJSmartyResourceCache;
 */
YAJSmartyTemplate.prototype.getResourceCache = function() {
	if (this.oYAJSmartyResourceCache == null ) {
		this.oYAJSmartyResourceCache = new YAJSmartyResourceCache();
	}
	return this.oYAJSmartyResourceCache;
};

YAJSmartyTemplate.prototype.assign = function(sVarName, varValue) {
	this.templateVars[sVarName] = varValue;
};

YAJSmartyTemplate.prototype.loadResource = function( sResourceName ) {
	var result = null;
	//@TODO: remove jQuery requirements
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

/**
 * Create anonymous object witch 'fetch(o)' method, where o will be input data object, which returns output 
 * string based at input object and given template.
 * 
 * 'start template {$o.var1} ...body of template {$o.var2} end of template'
 * 
 * oCompiledTempplate = {
 *	function fetch(o) {
 *    return 'start template ' + o.var1 + ' ...body of template ' + o.var2 + ' end of template';
 *	}
 * }
 * 
 * And next step is compiling such text into object (eval)
 * 
 * All template variable names are stored in objext:
 * oTemplateVars = {
 *   'o.var1': '',
 *   'o.var2': ''
 * }
 */
YAJSmartyTemplate.prototype.compile = function( data ) {
	if (data == null) {
		data = '';
	}
	var oTemplateVars = {};
	var parser = this.getParser('smarty');
	data = parser.parse(data, oTemplateVars);

	var oCompiledTemplate = null;
	var sJS = 'oCompiledTemplate = { \n\
		fetch: function(o) { \n\
			return ' + data + '; \n\
		} \n\
	\n}';
	eval( sJS );
	return new YAJSmartyCompiledResource( oTemplateVars, oCompiledTemplate );
};

YAJSmartyTemplate.prototype.getParser = function( sParserName ) {
	var result = new YAJSmartyParser();
	return result;
};

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
};

YAJSmartyTemplate.prototype.fetch = function( sResourceName ) {
	var oCompiledResource = this.getCompiledResource(sResourceName);
	var oTemplateVars = {};
	YAJSmartyTools.extend(oTemplateVars, oCompiledResource.templateVars); //default values from compiled resource
	YAJSmartyTools.extend(oTemplateVars, this.templateVars); //new assigned values

	return oCompiledResource.compiledTemplate.fetch(oTemplateVars);
};
