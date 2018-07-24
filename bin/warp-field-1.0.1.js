var WarpField=function(t){var e={};function i(r){if(e[r])return e[r].exports;var n=e[r]={i:r,l:!1,exports:{}};return t[r].call(n.exports,n,n.exports,i),n.l=!0,n.exports}return i.m=t,i.c=e,i.d=function(t,e,r){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(i.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)i.d(r,n,function(e){return t[e]}.bind(null,n));return r},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="/bin/",i(i.s=1)}([function(t,e,i){"use strict";function r(t){for(var i in t)e.hasOwnProperty(i)||(e[i]=t[i])}Object.defineProperty(e,"__esModule",{value:!0}),r(i(9)),r(i(8)),r(i(7)),r(i(6)),r(i(5)),r(i(4))},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=i(10);e.FieldOfViewMap=r.FieldOfViewMap;var n=i(2);e.WarpRect=n.WarpRect;var o=i(0);e.Direction=o.Direction,e.DirectionFlags=o.DirectionFlags,e.Offset=o.Offset},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=i(0),n=new r.Offset,o=function(){function t(t,e){void 0===e&&(e=!1),this._rectangle=new r.Rectangle,this._rectangle.copyFrom(t),this._mask=new r.Mask(t,e),this._warps=new Array(this._rectangle.area)}return t.prototype._warpsToString=function(){for(var t="",e=new r.Offset,i=0;i<this._rectangle.height;i++){for(var n=0;n<this._rectangle.width;n++)if(e.set(n,i).addOffset(this._rectangle.northWest),this.getMask(e.x,e.y)){var o=this._getWarp(e);t+=void 0===o?"-":o.map.id[0]}else t+=".";t+="\n"}return t},t.prototype._getWarpAt=function(t){return this._warps[t]},t.prototype._getWarp=function(t){return this._warps[this._rectangle.index(t)]},t.prototype.toString=function(){return this._rectangle.northWest+"\n"+this._warpsToString()},Object.defineProperty(t.prototype,"westX",{get:function(){return this._rectangle.westX},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"northY",{get:function(){return this._rectangle.northY},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"width",{get:function(){return this._rectangle.width},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"height",{get:function(){return this._rectangle.height},enumerable:!0,configurable:!0}),t.prototype.index=function(t,e){return n.set(t,e).subtractOffset(this._rectangle.northWest),this._mask.index(n)},t.prototype.getMaskAt=function(t){return this._mask.getAt(t)},t.prototype.getMask=function(t,e){return n.set(t,e),!!this._rectangle.containsOffset(n)&&this._mask.getAt(this._rectangle.index(n))},t.prototype.getMapAt=function(t){var e=this._getWarpAt(t);return e?e.map:void 0},t.prototype.getMap=function(t,e){n.set(t,e);var i=this._getWarp(n);return i?i.map:void 0},t.prototype.getOffsetAt=function(t){var e=this._getWarpAt(t);return e?e.offset:void 0},t.prototype.getOffset=function(t,e){n.set(t,e);var i=this._getWarp(n);return i?i.offset:void 0},t.prototype.setAt=function(t,e,i){return this._mask.setAt(t,e),this._warps[t]=i,this},t.prototype.set=function(t,e,i){return this._mask.setAt(this._rectangle.index(t),e),this._warps[this._rectangle.index(t)]=i,this},t}();e.WarpRect=o},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=i(0);function n(t,e){return t.toFixed(7)+"-"+e.toFixed(7)}function o(t){return"{"+n(t.low,t.high)+(void 0!==t.warp?"~"+t.warp.map.id:"")+"}"}function s(t){return"["+t.map(o).join(", ")+"]"}!function(t){t[t.WALL_NORTH=1]="WALL_NORTH",t[t.WALL_EAST=2]="WALL_EAST",t[t.WALL_WEST=8]="WALL_WEST",t[t.WALL_SOUTH=4]="WALL_SOUTH",t[t.BODY=1<<r.DIRECTIONS.length]="BODY"}(e.TileFlag||(e.TileFlag={})),e.BODY_EPSILON=1e-5,e.WALL_EPSILON=e.BODY_EPSILON/4,e.WARP_EPSILON=e.WALL_EPSILON/4;var h=!1;function a(t,e,i){var r;if(h&&console.info("cut "+o(t)+" "+n(e,i)),e<=t.low)i>=t.high?r=[]:i>=t.low?(t.low=i,r=[t]):r=[t];else if(i>=t.high)e<=t.high?(t.high=e,r=[t]):r=[t];else{var a={low:i,high:t.high,warp:t.warp,warpCount:t.warpCount};t.high=e,r=[t,a]}return h&&console.info("--\x3e "+s(r)),r}e.cutWedge=a,e.cutWedges=function(t,e,i){for(var r=new Array,n=0,o=t;n<o.length;n++){var s=o[n];r.push.apply(r,a(s,e,i))}return r};var u=!1;function p(t,e,i,r,h){var a;if(u&&console.info("warp "+o(t)+" "+n(e,i)+" "+r.map.id),e<=t.low)if(i>=t.high)t.warp=r,t.warpCount=h,a=[t];else if(i>=t.low){var p={low:i,high:t.high,warp:t.warp,warpCount:t.warpCount};t.high=i,t.warp=r,t.warpCount=h,a=[t,p]}else a=[t];else if(i>=t.high)if(e<=t.high){p={low:e,high:t.high,warp:r,warpCount:h};t.high=e,a=[t,p]}else a=[t];else{var f={low:e,high:i,warp:r,warpCount:h},c={low:i,high:t.high,warp:t.warp,warpCount:t.warpCount};t.high=e,a=[t,f,c]}return u&&console.info("--\x3e "+s(a)),a}e.warpWedge=p,e.warpWedges=function(t,e,i,r,n){for(var o=new Array,s=0,h=t;s<h.length;s++){var a=h[s];o.push.apply(o,p(a,e,i,r,n))}return o},e.whichWedge=function(t,i,r){for(var n=i;n<t.length-1&&t[n+1].low<r-2*e.WALL_EPSILON;)n++;return n>=t.length-1||t[n].high>r+2*e.WALL_EPSILON?n:t[n].high<r-2*e.WALL_EPSILON?Math.abs(t[n].high-r)<Math.abs(t[n+1].low-r)?n:n+1:t[n+1].low<r+2*e.WALL_EPSILON?t[n].warpCount<t[n+1].warpCount?n:t[n].warpCount>t[n+1].warpCount?n+1:t[n].warp.map.id<t[n+1].warp.map.id?n:n+1:n}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=i(0),n=function(){function t(t,e){void 0===e&&(e=!1),this._size=new r.Size,this._size.copyFrom(t),this._bits=new Array(this._size.area).fill(e)}return t.prototype.toString=function(){for(var t="",e=new r.Offset,i=0;i<this._size.height;i++){for(var n=0;n<this._size.width;n++)e.set(n,i),t+=this.get(e.set(n,i))?"☑":"☐";t+="\n"}return t},Object.defineProperty(t.prototype,"width",{get:function(){return this._size.width},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"height",{get:function(){return this._size.height},enumerable:!0,configurable:!0}),t.prototype.index=function(t){return this._size.index(t)},t.prototype.getAt=function(t){return this._bits[t]},t.prototype.get=function(t){return this.getAt(this.index(t))},t.prototype.setAt=function(t,e){return this._bits[t]=e,this},t.prototype.set=function(t,e){return this.setAt(this.index(t),e)},t}();e.Mask=n},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=i(0),n=new r.Offset,o=function(){function t(t,e,i,n){void 0===t&&(t=0),void 0===e&&(e=0),void 0===i&&(i=0),void 0===n&&(n=0),this.northWest=new r.Offset(t,e),this.size=new r.Size(i,n)}return t.prototype.toString=function(){return"("+this.westX+","+this.northY+" "+this.width+"x"+this.height+")"},t.prototype.equals=function(t){return this.westX===t.westX&&this.northY===t.northY&&this.size.equals(t)},Object.defineProperty(t.prototype,"northY",{get:function(){return this.northWest.y},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"southY",{get:function(){return this.northWest.y+this.size.height-1},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"westX",{get:function(){return this.northWest.x},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"eastX",{get:function(){return this.northWest.x+this.size.width-1},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"width",{get:function(){return this.size.width},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"height",{get:function(){return this.size.height},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"empty",{get:function(){return this.size.empty},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"area",{get:function(){return this.size.area},enumerable:!0,configurable:!0}),t.prototype.set=function(t,e,i,r){return this.northWest.set(t,e),this.size.set(i,r),this},t.prototype.copyFrom=function(t){return this.northWest.set(t.westX,t.northY),this.size.set(t.width,t.height),this},t.prototype.extendToInclude=function(t){var e=t.x-this.westX;e<0?(this.size.width-=e,this.northWest.x=t.x):e>=this.size.width&&(this.size.width=e+1);var i=t.y-this.northWest.y;return i<0?(this.size.height-=i,this.northWest.y=t.y):i>=this.size.height&&(this.size.height=i+1),this},t.prototype.containsOffset=function(t){return this.size.containsOffset(n.copyFrom(t).subtractOffset(this.northWest))},t.prototype.containsRectangle=function(t){return n.set(t.westX,t.northY).subtractOffset(this.northWest),!!this.size.containsOffset(n)&&((0!==t.width||0!==t.height)&&this.size.containsOffset(n.add(t.width-1,t.height-1)))},t.prototype.overlapsRectangle=function(t){return this.northY<=t.northY+t.height-1&&this.southY>=t.northY&&this.westX<=t.westX+t.width-1&&this.eastX>=t.westX&&!this.empty&&0!==t.width&&0!==t.height},t.prototype.index=function(t){return this.size.index(n.copyFrom(t).subtractOffset(this.northWest))},t}();e.Rectangle=o},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=function(){function t(t,e){void 0===t&&(t=0),void 0===e&&(e=0),this.width=t,this.height=e}return t.prototype.toString=function(){return"("+this.width+"x"+this.height+")"},t.prototype.equals=function(t){return this.width===t.width&&this.height===t.height},Object.defineProperty(t.prototype,"empty",{get:function(){return 0===this.width||0===this.height},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"area",{get:function(){return this.width*this.height},enumerable:!0,configurable:!0}),t.prototype.set=function(t,e){return this.width=t,this.height=e,this},t.prototype.copyFrom=function(t){return this.width=t.width,this.height=t.height,this},t.prototype.add=function(t,e){return this.width+=t,this.height+=e,this},t.prototype.addOffset=function(t){return this.width+=t.x,this.height+=t.y,this},t.prototype.multiply=function(t){return this.width*=t,this.height*=t,this},t.prototype.containsOffset=function(t){return t.x>=0&&t.y>=0&&t.x<this.width&&t.y<this.height},t.prototype.index=function(t){return t.y*this.width+t.x},t}();e.Size=r},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=[0,1,0,-1],n=[-1,0,1,0],o=function(){function t(t,e){void 0===t&&(t=0),void 0===e&&(e=0),this.x=t,this.y=e}return t.prototype.toString=function(){return"("+this.x+","+this.y+")"},t.prototype.equals=function(t){return this.x===t.x&&this.y===t.y},Object.defineProperty(t.prototype,"magnitudeChebyshev",{get:function(){return Math.max(Math.abs(this.x),Math.abs(this.y))},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"magnitudeManhattan",{get:function(){return Math.abs(this.x)+Math.abs(this.y)},enumerable:!0,configurable:!0}),t.prototype.set=function(t,e){return this.x=t,this.y=e,this},t.prototype.copyFrom=function(t){return this.x=t.x,this.y=t.y,this},t.prototype.setFromDirection=function(t){return this.x=r[t],this.y=n[t],this},t.prototype.add=function(t,e){return this.x+=t,this.y+=e,this},t.prototype.addSize=function(t){return this.x+=t.width,this.y+=t.height,this},t.prototype.addOffset=function(t){return this.x+=t.x,this.y+=t.y,this},t.prototype.addDirection=function(t){return this.x+=r[t],this.y+=n[t],this},t.prototype.addCardinalDirection=function(t){return this.x+=r[t],this.y+=n[t],this},t.prototype.subtractOffset=function(t){return this.x-=t.x,this.y-=t.y,this},t.prototype.multiply=function(t){return this.x*=t,this.y*=t,this},t.prototype.distanceChebyshev=function(t){return this.subtractOffset(t).magnitudeChebyshev},t.prototype.distanceManhattan=function(t){return this.subtractOffset(t).magnitudeManhattan},t}();e.Offset=o},function(t,e,i){"use strict";var r;Object.defineProperty(e,"__esModule",{value:!0}),function(t){t[t.NONE=0]="NONE",t[t.NORTH=1]="NORTH",t[t.EAST=2]="EAST",t[t.SOUTH=4]="SOUTH",t[t.WEST=8]="WEST",t[t.ALL=15]="ALL"}(r=e.DirectionFlags||(e.DirectionFlags={})),e.directionFlagsToString=function(t){var e="[";return 0!=(t&r.NORTH)&&(e+="N"),0!=(t&r.EAST)&&(e+="E"),0!=(t&r.SOUTH)&&(e+="S"),0!=(t&r.WEST)&&(e+="W"),e+"]"},e.directionFlagsFromDirection=function(t){return 1<<t}},function(t,e,i){"use strict";var r;Object.defineProperty(e,"__esModule",{value:!0}),function(t){t[t.NORTH=0]="NORTH",t[t.EAST=1]="EAST",t[t.SOUTH=2]="SOUTH",t[t.WEST=3]="WEST"}(r=e.Direction||(e.Direction={})),e.DIRECTIONS=[r.NORTH,r.EAST,r.SOUTH,r.WEST];var n=["N","E","S","W"];e.directionToString=function(t){return n[t]},e.directionOpposite=function(t){return t+2&3}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=i(0),n=i(3),o=i(1),s=new r.Offset,h=function(){function t(t,e,i,o){void 0===o&&(o=!1);var h=this;if(this._size=new r.Size,this._warps=new Array,this.id=t,this._size.set(e,i),this._tileFlags=new Array(this._size.area).fill(0),o){for(var a=0;a<this._size.height;a++)this._addFlag(s.set(0,a),n.TileFlag.WALL_WEST),this._addFlag(s.set(this._size.width-1,a),n.TileFlag.WALL_EAST);for(var u=0;u<this._size.width;u++)this._addFlag(s.set(u,0),n.TileFlag.WALL_NORTH),this._addFlag(s.set(u,this._size.height-1),n.TileFlag.WALL_SOUTH)}this._tileWarpIds=r.DIRECTIONS.map(function(){return new Array(h._size.area).fill(-1)})}return t.prototype._addFlag=function(t,e){var i=this._size.index(t);this._tileFlags[i]|=e},t.prototype._removeFlag=function(t,e){var i=this._size.index(t);this._tileFlags[i]&=~e},t.prototype._getFlag=function(t,e){var i=this._size.index(t);return 0!=(this._tileFlags[i]&e)},t.prototype._findOrMakeWarp=function(t,e){for(var i=0;i<this._warps.length;i++){var n=this._warps[i];if(n.map===t&&n.offset.equals(e))return i}var o={map:t,offset:(new r.Offset).copyFrom(e)},s=this._warps.length;return this._warps.push(o),s},t.prototype._addWarp=function(t,e,i){var r=this._size.index(t);this._tileWarpIds[e][r]=i},t.prototype._removeWarp=function(t,e){var i=this._size.index(t);delete this._tileWarpIds[e][i]},t.prototype._getWarp=function(t,e){var i=this._size.index(t),r=this._tileWarpIds[e][i];return-1===r?void 0:this._warps[r]},t.prototype.addWall=function(t,e,i,n){void 0===n&&(n=!1),s.set(t,e),this._addFlag(s,1<<i),s.addCardinalDirection(i),!n&&this._size.containsOffset(s)&&this._addFlag(s,1<<r.directionOpposite(i))},t.prototype.removeWall=function(t,e,i,n){void 0===n&&(n=!1),s.set(t,e),this._removeFlag(s,1<<i),s.addCardinalDirection(i),!n&&this._size.containsOffset(s)&&this._removeFlag(s,1<<r.directionOpposite(i))},t.prototype.getWalls=function(t,e){s.set(t,e);var i=this._size.index(s);return this._tileFlags[i]&r.DirectionFlags.ALL},t.prototype.getWall=function(t,e,i){return 0!=(this.getWalls(t,e)&1<<i)},t.prototype.addBody=function(t,e){s.set(t,e),this._addFlag(s,n.TileFlag.BODY)},t.prototype.removeBody=function(t,e){s.set(t,e),this._removeFlag(s,n.TileFlag.BODY)},t.prototype.getBody=function(t,e){s.set(t,e);var i=this._size.index(s);return 0!=(this._tileFlags[i]&n.TileFlag.BODY)},t.prototype.addWarp=function(t,e,i,n,o,h){s.set(o-t,h-e).addCardinalDirection(r.directionOpposite(i));var a=this._findOrMakeWarp(n,s);s.set(t,e),this._addWarp(s,i,a)},t.prototype.removeWarp=function(t,e,i){s.set(t,e),this._removeWarp(s,i)},t.prototype.getWarpFlags=function(t,e){var i=this;s.set(t,e);var n=0;return r.DIRECTIONS.forEach(function(t){i._getWarp(s,t)&&(n|=1<<t)}),n},t.prototype.getWarpFlag=function(t,e,i){return s.set(t,e),null!=this._getWarp(s,i)},t.prototype.getFieldOfView=function(t,e,i){var n=new r.Offset(t,e),s=(new r.Rectangle).set(n.x-i,n.y-i,2*i+1,2*i+1),h=new o.WarpRect(s);return h.set(n,!0,void 0),this._quadrant(h,n,i,-1,-1),this._quadrant(h,n,i,1,-1),this._quadrant(h,n,i,-1,1),this._quadrant(h,n,i,1,1),h},t.prototype._quadrant=function(t,e,i,o,h){var a=e.x,u=e.y,p=i+1;if(!(p<0)&&this._size.containsOffset(e))for(var f=[n.TileFlag.WALL_NORTH,n.TileFlag.WALL_SOUTH][(h+1)/2],c=[n.TileFlag.WALL_WEST,n.TileFlag.WALL_EAST][(o+1)/2],l=[r.Direction.NORTH,r.Direction.SOUTH][(h+1)/2],d=this._tileWarpIds[l],g=[r.Direction.WEST,r.Direction.EAST][(o+1)/2],_=this._tileWarpIds[g],y=this._size.index(e),w=t.index(e.x,e.y),O=[{low:0,high:Number.POSITIVE_INFINITY,warp:void 0,warpCount:0}],v=0,W=y,b=w;v!==p&&O.length>0;v++,W+=h*this._size.width,b+=h*t.width)for(var L=1/(v+.5),S=0===v?Number.POSITIVE_INFINITY:1/(v-.5),A=1/v,m=0,P=0,T=W,F=b,x=-.5*L,E=.5*S,N=.5*L,z=0;P!==p&&m!==O.length;P++,T+=o,F+=o,x+=L,E+=S,N+=L,z+=A){for(;x>=O[m].high&&!(++m>=O.length););if(m>=O.length)break;if(!(E<=O[m].low)){var I=n.whichWedge(O,m,z);t.setAt(F,!0,O[I].warp);for(var j=m;j<O.length&&E>O[j].low;){var D=[O[j]],M=O[j].warp,R=void 0,Y=void 0,C=void 0,H=void 0,B=void 0,k=O[j].warpCount+1;if(void 0===M)R=0!=(this._tileFlags[T]&f),Y=0!=(this._tileFlags[T]&c),C=(0!==P||0!==v)&&0!=(this._tileFlags[T]&n.TileFlag.BODY),H=this._warps[d[T]],B=this._warps[_[T]];else{var X=M.map,U=M.offset;s.copyFrom(U).add(a+P*o,u+v*h),R=X._getFlag(s,f),Y=X._getFlag(s,c),C=(0!==P||0!==v)&&X._getFlag(s,n.TileFlag.BODY),H=X._getWarp(s,l),B=X._getWarp(s,g)}Y&&R?D=n.cutWedges(D,x-n.WALL_EPSILON,E+n.WALL_EPSILON):Y?(void 0!==H&&(D=n.warpWedges(D,x-n.WARP_EPSILON,N+n.WARP_EPSILON,H,k)),D=C?n.cutWedges(D,x+n.BODY_EPSILON,E+n.WALL_EPSILON):n.cutWedges(D,N-n.WALL_EPSILON,E+n.WALL_EPSILON)):R?(D=C?n.cutWedges(D,x-n.WALL_EPSILON,E-n.BODY_EPSILON):n.cutWedges(D,x-n.WALL_EPSILON,N+n.WALL_EPSILON),void 0!==B&&(D=n.warpWedges(D,N-n.WARP_EPSILON,E+n.WARP_EPSILON,B,k))):(void 0!==H&&(D=n.warpWedges(D,x-n.WARP_EPSILON,N+n.WARP_EPSILON,H,k)),C&&(D=n.cutWedges(D,x+n.BODY_EPSILON,E-n.BODY_EPSILON)),void 0!==B&&(D=n.warpWedges(D,N-n.WARP_EPSILON,E+n.WARP_EPSILON,B,k))),1!==D.length&&O.splice.apply(O,[j,1].concat(D)),j+=D.length}}}},t}();e.FieldOfViewMap=h}]);
//# sourceMappingURL=warp-field-1.0.1.js.map