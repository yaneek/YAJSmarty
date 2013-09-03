var YAJSmartyResourceCache = function() {
	this.items = [];
};

YAJSmartyResourceCache.prototype.getResource = function( sResourceName ) {
	var result = null;
	for( var key in this.items ) {
		//@TODO: items should by indexed by name
		if ( this.items[key].name == sResourceName ) {
			result = this.items[key];
			break;//-------->>>
		}
	}
	return result;
};

//YAJSmartyResourceCache.prototype.putResourceData = function( sResourceName, oResourceData ) {
//}

YAJSmartyResourceCache.prototype.putResourceObject = function( oResource ) {
	this.items.push( oResource );
};