var YAJSmartyResourceCacheItem = function( options ) {
	this.name = null;
	this.data = null;

	if ( options != null ) {
		$.extend( this, options );
	}
};