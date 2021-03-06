// ==UserScript==
// @name          TagPro Stats Player Chart
// @author        Kera
// @version       0.5.4
// @description   Radar/Bar Chart of a TagPro player's stats. 
// @namespace     https://keratagpro.github.io
// @downloadURL   https://keratagpro.github.io/tagpro-stats-player-chart/tagpro-stats-player-chart.user.js
// @updateURL     https://keratagpro.github.io/tagpro-stats-player-chart/tagpro-stats-player-chart.meta.js
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_addStyle
// @grant         GM_deleteValue
// @grant         GM_listValues
// @require       https://cdnjs.cloudflare.com/ajax/libs/Chart.js/1.0.2/Chart.min.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js
// @require       https://code.jquery.com/ui/1.11.4/jquery-ui.min.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/knockout/3.3.0/knockout-min.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/knockout.mapping/2.4.1/knockout.mapping.min.js
// @include       http://tagpro-stats.com/profile.php?userid=*
// @include       http://www.tagpro-stats.com/profile.php?userid=*
// @copyright     2015, Kera
// ==/UserScript==

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var NEGATIVE_STATS = ['drops', 'dropgame', 'drophour', 'popped', 'popgame', 'pophour', 'dcs'];

exports.NEGATIVE_STATS = NEGATIVE_STATS;
var DIVISOR_LABEL_MAPPINGS = {
	'Game': 'Games',
	'Hour': 'Hours',
	'Grab': 'Grabs',
	'Pop': 'Popped'
};

exports.DIVISOR_LABEL_MAPPINGS = DIVISOR_LABEL_MAPPINGS;
var DEFAULT_OPTIONS = {
	chartType: 'radar',
	showSettings: false,
	showCareerStats: true,
	showMonthlyStats: true,
	showName: true,
	showLegend: true,
	showBestStats: false,
	showStoredStats: true,
	customizeStats: false,
	storedStats: null,
	selectedStats: ['capgrab', 'capgame', 'grabgame', 'dropgame', 'popgame', 'preventgame', 'returngame', 'supportgame', 'taggame', 'holdgame']
};

exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
var NON_PERSISTENT_OPTIONS = ['showSettings', 'customizeStats'];

exports.NON_PERSISTENT_OPTIONS = NON_PERSISTENT_OPTIONS;
var COLOR_SCHEMES = [
// Stored stat career
{
	fill: 'rgba(255, 222, 184, 0.5)',
	stroke: 'rgba(255, 222, 184, 1)',
	point: 'rgba(255, 222, 184, 1)'
},
// Stored stat monthly
{
	fill: 'rgba(255, 237, 217, 0.5)',
	stroke: 'rgba(255, 237, 217, 1)',
	point: 'rgba(255, 237, 217, 1)'
},
// Career
{
	fill: 'rgba(151, 187, 205, 0.5)',
	stroke: 'rgba(151, 187, 205, 1)',
	point: 'rgba(151, 187, 205, 1)'
},
// Monthly
{
	fill: 'rgba(220, 220, 220, 0.5)',
	stroke: 'rgba(220, 220, 220, 1)',
	point: 'rgba(220, 220, 220, 1)'
}];
exports.COLOR_SCHEMES = COLOR_SCHEMES;

},{}],2:[function(require,module,exports){
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _storageJs = require('./storage.js');

var storage = _interopRequireWildcard(_storageJs);

ko.extenders.persist = function (target, key) {
	var initialValue = target();

	if (key) {
		var val = storage.getItem(key);

		if (val !== null) {
			initialValue = val;
		}
	}

	target(initialValue);

	target.subscribe(function (val) {
		return storage.setItem(key, val);
	});

	return target;
};

},{"./storage.js":5}],3:[function(require,module,exports){
// knockout-sortable 0.11.0 | (c) 2015 Ryan Niemeyer |  http://www.opensource.org/licenses/mit-license
"use strict";

var ITEMKEY = "ko_sortItem",
    INDEXKEY = "ko_sourceIndex",
    LISTKEY = "ko_sortList",
    PARENTKEY = "ko_parentList",
    DRAGKEY = "ko_dragItem",
    unwrap = ko.utils.unwrapObservable,
    dataGet = ko.utils.domData.get,
    dataSet = ko.utils.domData.set,
    version = $.ui && $.ui.version,

//1.8.24 included a fix for how events were triggered in nested sortables. indexOf checks will fail if version starts with that value (0 vs. -1)
hasNestedSortableFix = version && version.indexOf("1.6.") && version.indexOf("1.7.") && (version.indexOf("1.8.") || version === "1.8.24");

//internal afterRender that adds meta-data to children
var addMetaDataAfterRender = function addMetaDataAfterRender(elements, data) {
    ko.utils.arrayForEach(elements, function (element) {
        if (element.nodeType === 1) {
            dataSet(element, ITEMKEY, data);
            dataSet(element, PARENTKEY, dataGet(element.parentNode, LISTKEY));
        }
    });
};

//prepare the proper options for the template binding
var prepareTemplateOptions = function prepareTemplateOptions(valueAccessor, dataName) {
    var result = {},
        options = unwrap(valueAccessor()) || {},
        actualAfterRender;

    //build our options to pass to the template engine
    if (options.data) {
        result[dataName] = options.data;
        result.name = options.template;
    } else {
        result[dataName] = valueAccessor();
    }

    ko.utils.arrayForEach(["afterAdd", "afterRender", "as", "beforeRemove", "includeDestroyed", "templateEngine", "templateOptions", "nodes"], function (option) {
        if (options.hasOwnProperty(option)) {
            result[option] = options[option];
        } else if (ko.bindingHandlers.sortable.hasOwnProperty(option)) {
            result[option] = ko.bindingHandlers.sortable[option];
        }
    });

    //use an afterRender function to add meta-data
    if (dataName === "foreach") {
        if (result.afterRender) {
            //wrap the existing function, if it was passed
            actualAfterRender = result.afterRender;
            result.afterRender = function (element, data) {
                addMetaDataAfterRender.call(data, element, data);
                actualAfterRender.call(data, element, data);
            };
        } else {
            result.afterRender = addMetaDataAfterRender;
        }
    }

    //return options to pass to the template binding
    return result;
};

var updateIndexFromDestroyedItems = function updateIndexFromDestroyedItems(index, items) {
    var unwrapped = unwrap(items);

    if (unwrapped) {
        for (var i = 0; i < index; i++) {
            //add one for every destroyed item we find before the targetIndex in the target array
            if (unwrapped[i] && unwrap(unwrapped[i]._destroy)) {
                index++;
            }
        }
    }

    return index;
};

//remove problematic leading/trailing whitespace from templates
var stripTemplateWhitespace = function stripTemplateWhitespace(element, name) {
    var templateSource, templateElement;

    //process named templates
    if (name) {
        templateElement = document.getElementById(name);
        if (templateElement) {
            templateSource = new ko.templateSources.domElement(templateElement);
            templateSource.text($.trim(templateSource.text()));
        }
    } else {
        //remove leading/trailing non-elements from anonymous templates
        $(element).contents().each(function () {
            if (this && this.nodeType !== 1) {
                element.removeChild(this);
            }
        });
    }
};

//connect items with observableArrays
ko.bindingHandlers.sortable = {
    init: function init(element, valueAccessor, allBindingsAccessor, data, context) {
        var $element = $(element),
            value = unwrap(valueAccessor()) || {},
            templateOptions = prepareTemplateOptions(valueAccessor, "foreach"),
            sortable = {},
            startActual,
            updateActual;

        stripTemplateWhitespace(element, templateOptions.name);

        //build a new object that has the global options with overrides from the binding
        $.extend(true, sortable, ko.bindingHandlers.sortable);
        if (value.options && sortable.options) {
            ko.utils.extend(sortable.options, value.options);
            delete value.options;
        }
        ko.utils.extend(sortable, value);

        //if allowDrop is an observable or a function, then execute it in a computed observable
        if (sortable.connectClass && (ko.isObservable(sortable.allowDrop) || typeof sortable.allowDrop == "function")) {
            ko.computed({
                read: function read() {
                    var value = unwrap(sortable.allowDrop),
                        shouldAdd = typeof value == "function" ? value.call(this, templateOptions.foreach) : value;
                    ko.utils.toggleDomNodeCssClass(element, sortable.connectClass, shouldAdd);
                },
                disposeWhenNodeIsRemoved: element
            }, this);
        } else {
            ko.utils.toggleDomNodeCssClass(element, sortable.connectClass, sortable.allowDrop);
        }

        //wrap the template binding
        ko.bindingHandlers.template.init(element, function () {
            return templateOptions;
        }, allBindingsAccessor, data, context);

        //keep a reference to start/update functions that might have been passed in
        startActual = sortable.options.start;
        updateActual = sortable.options.update;

        //initialize sortable binding after template binding has rendered in update function
        var createTimeout = setTimeout(function () {
            var dragItem;
            $element.sortable(ko.utils.extend(sortable.options, {
                start: function start(event, ui) {
                    //track original index
                    var el = ui.item[0];
                    dataSet(el, INDEXKEY, ko.utils.arrayIndexOf(ui.item.parent().children(), el));

                    //make sure that fields have a chance to update model
                    ui.item.find("input:focus").change();
                    if (startActual) {
                        startActual.apply(this, arguments);
                    }
                },
                receive: function receive(event, ui) {
                    dragItem = dataGet(ui.item[0], DRAGKEY);
                    if (dragItem) {
                        //copy the model item, if a clone option is provided
                        if (dragItem.clone) {
                            dragItem = dragItem.clone();
                        }

                        //configure a handler to potentially manipulate item before drop
                        if (sortable.dragged) {
                            dragItem = sortable.dragged.call(this, dragItem, event, ui) || dragItem;
                        }
                    }
                },
                update: function update(event, ui) {
                    var sourceParent,
                        targetParent,
                        sourceIndex,
                        targetIndex,
                        arg,
                        el = ui.item[0],
                        parentEl = ui.item.parent()[0],
                        item = dataGet(el, ITEMKEY) || dragItem;

                    dragItem = null;

                    //make sure that moves only run once, as update fires on multiple containers
                    if (item && this === parentEl || !hasNestedSortableFix && $.contains(this, parentEl)) {
                        //identify parents
                        sourceParent = dataGet(el, PARENTKEY);
                        sourceIndex = dataGet(el, INDEXKEY);
                        targetParent = dataGet(el.parentNode, LISTKEY);
                        targetIndex = ko.utils.arrayIndexOf(ui.item.parent().children(), el);

                        //take destroyed items into consideration
                        if (!templateOptions.includeDestroyed) {
                            sourceIndex = updateIndexFromDestroyedItems(sourceIndex, sourceParent);
                            targetIndex = updateIndexFromDestroyedItems(targetIndex, targetParent);
                        }

                        //build up args for the callbacks
                        if (sortable.beforeMove || sortable.afterMove) {
                            arg = {
                                item: item,
                                sourceParent: sourceParent,
                                sourceParentNode: sourceParent && ui.sender || el.parentNode,
                                sourceIndex: sourceIndex,
                                targetParent: targetParent,
                                targetIndex: targetIndex,
                                cancelDrop: false
                            };

                            //execute the configured callback prior to actually moving items
                            if (sortable.beforeMove) {
                                sortable.beforeMove.call(this, arg, event, ui);
                            }
                        }

                        //call cancel on the correct list, so KO can take care of DOM manipulation
                        if (sourceParent) {
                            $(sourceParent === targetParent ? this : ui.sender || this).sortable("cancel");
                        }
                        //for a draggable item just remove the element
                        else {
                                $(el).remove();
                            }

                        //if beforeMove told us to cancel, then we are done
                        if (arg && arg.cancelDrop) {
                            return;
                        }

                        //do the actual move
                        if (targetIndex >= 0) {
                            if (sourceParent) {
                                sourceParent.splice(sourceIndex, 1);

                                //if using deferred updates plugin, force updates
                                if (ko.processAllDeferredBindingUpdates) {
                                    ko.processAllDeferredBindingUpdates();
                                }
                            }

                            targetParent.splice(targetIndex, 0, item);
                        }

                        //rendering is handled by manipulating the observableArray; ignore dropped element
                        dataSet(el, ITEMKEY, null);

                        //if using deferred updates plugin, force updates
                        if (ko.processAllDeferredBindingUpdates) {
                            ko.processAllDeferredBindingUpdates();
                        }

                        //allow binding to accept a function to execute after moving the item
                        if (sortable.afterMove) {
                            sortable.afterMove.call(this, arg, event, ui);
                        }
                    }

                    if (updateActual) {
                        updateActual.apply(this, arguments);
                    }
                },
                connectWith: sortable.connectClass ? "." + sortable.connectClass : false
            }));

            //handle enabling/disabling sorting
            if (sortable.isEnabled !== undefined) {
                ko.computed({
                    read: function read() {
                        $element.sortable(unwrap(sortable.isEnabled) ? "enable" : "disable");
                    },
                    disposeWhenNodeIsRemoved: element
                });
            }
        }, 0);

        //handle disposal
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            //only call destroy if sortable has been created
            if ($element.data("ui-sortable") || $element.data("sortable")) {
                $element.sortable("destroy");
            }

            ko.utils.toggleDomNodeCssClass(element, sortable.connectClass, false);

            //do not create the sortable if the element has been removed from DOM
            clearTimeout(createTimeout);
        });

        return { 'controlsDescendantBindings': true };
    },
    update: function update(element, valueAccessor, allBindingsAccessor, data, context) {
        var templateOptions = prepareTemplateOptions(valueAccessor, "foreach");

        //attach meta-data
        dataSet(element, LISTKEY, templateOptions.foreach);

        //call template binding's update with correct options
        ko.bindingHandlers.template.update(element, function () {
            return templateOptions;
        }, allBindingsAccessor, data, context);
    },
    connectClass: 'ko_container',
    allowDrop: true,
    afterMove: null,
    beforeMove: null,
    options: {}
};

//create a draggable that is appropriate for dropping into a sortable
ko.bindingHandlers.draggable = {
    init: function init(element, valueAccessor, allBindingsAccessor, data, context) {
        var value = unwrap(valueAccessor()) || {},
            options = value.options || {},
            draggableOptions = ko.utils.extend({}, ko.bindingHandlers.draggable.options),
            templateOptions = prepareTemplateOptions(valueAccessor, "data"),
            connectClass = value.connectClass || ko.bindingHandlers.draggable.connectClass,
            isEnabled = value.isEnabled !== undefined ? value.isEnabled : ko.bindingHandlers.draggable.isEnabled;

        value = "data" in value ? value.data : value;

        //set meta-data
        dataSet(element, DRAGKEY, value);

        //override global options with override options passed in
        ko.utils.extend(draggableOptions, options);

        //setup connection to a sortable
        draggableOptions.connectToSortable = connectClass ? "." + connectClass : false;

        //initialize draggable
        $(element).draggable(draggableOptions);

        //handle enabling/disabling sorting
        if (isEnabled !== undefined) {
            ko.computed({
                read: function read() {
                    $(element).draggable(unwrap(isEnabled) ? "enable" : "disable");
                },
                disposeWhenNodeIsRemoved: element
            });
        }

        //handle disposal
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).draggable("destroy");
        });

        return ko.bindingHandlers.template.init(element, function () {
            return templateOptions;
        }, allBindingsAccessor, data, context);
    },
    update: function update(element, valueAccessor, allBindingsAccessor, data, context) {
        var templateOptions = prepareTemplateOptions(valueAccessor, "data");

        return ko.bindingHandlers.template.update(element, function () {
            return templateOptions;
        }, allBindingsAccessor, data, context);
    },
    connectClass: ko.bindingHandlers.sortable.connectClass,
    options: {
        helper: "clone"
    }
};

},{}],4:[function(require,module,exports){
// Updated at 2015-08-13T07:20:03.594Z

"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var maxValues = {
	"capgame": 1.5757,
	"capgrab": 0.3297,
	"caphour": 23.283855560796813,
	"captures": 20607,
	"dcs": 768,
	"dropgame": 6.6889,
	"drophour": 82.83603598147948,
	"drops": 95520,
	"games": 23720,
	"grabgame": 7.8214,
	"grabhour": 96.4926369451228,
	"grabs": 116272,
	"hold": 1318362,
	"holdgame": 86.5639,
	"holdgrab": 25.8036,
	"holdhour": 1243.3779230995917,
	"hourgame": 5.3658222573392935,
	"hours": 1835.8,
	"keptflags": 145,
	"losses": 8412,
	"nrtags": 41011,
	"nrtagsgame": 3.6741,
	"nrtagshour": 51.18286918598969,
	"pointgame": 0,
	"pointhour": 0,
	"points": 0,
	"popgame": 8.9547,
	"pophour": 120.96638327037005,
	"popped": 139656,
	"prevent": 810946,
	"preventgame": 63.9008,
	"preventhour": 827.6333292013828,
	"returngame": 9.3317,
	"returnhour": 114.28046675324903,
	"returns": 93955,
	"support": 219022,
	"supportgame": 16.322,
	"supporthour": 212.01018044327952,
	"taggame": 10.2178,
	"taghour": 125.13227855178579,
	"tagpop": 10.4986,
	"tags": 120432,
	"winpercent": 84.7761,
	"winpercentnodcs": 0.852,
	"wins": 15242
};

exports.maxValues = maxValues;
var minValues = {
	"dcs": 0,
	"dropgame": 0.1621,
	"drophour": 2.196966724359289,
	"drops": 305,
	"popgame": 0.7772,
	"pophour": 10.531033937748463,
	"popped": 1462
};
exports.minValues = minValues;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getItem = getItem;
exports.setItem = setItem;
exports.getAll = getAll;
exports.deleteAll = deleteAll;

function getItem(name) {
	return JSON.parse(GM_getValue(name) || null);
}

function setItem(name, value) {
	GM_setValue(name, JSON.stringify(value));
}

function getAll() {
	var values = {};
	GM_listValues().forEach(function (key) {
		values[key] = getItem(key);
	});
	return values;
}

function deleteAll() {
	GM_listValues().forEach(GM_deleteValue);
}

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = ViewModel;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

require('./knockout-persist.js');

var _constantsJs = require('./constants.js');

var _storageJs = require('./storage.js');

var storage = _interopRequireWildcard(_storageJs);

function ViewModel(options) {
	var _this = this;

	ko.mapping.fromJS(options, {
		'storedStats': {
			create: function create(options) {
				return ko.observable(options.data);
			}
		}
	}, this);

	var persistableKeys = Object.keys(_constantsJs.DEFAULT_OPTIONS).filter(function (key) {
		return _constantsJs.NON_PERSISTENT_OPTIONS.indexOf(key) == -1;
	});

	persistableKeys.forEach(function (key) {
		_this[key].extend({ persist: key });
	});

	this.statsMeta = {};

	this.resetStats = function () {
		_this.selectedStats(_constantsJs.DEFAULT_OPTIONS.selectedStats.slice(0));
	};

	this.resetAll = function () {
		persistableKeys.forEach(function (key) {
			_this[key](_constantsJs.DEFAULT_OPTIONS[key]);
		});

		storage.deleteAll();
	};

	this.toggleSettings = function () {
		_this.showSettings(!_this.showSettings());
	};

	this.getStatLabel = function (stat) {
		return _this.statsMeta[stat].label;
	};

	this.storeStats = function () {
		_this.storedStats({
			name: _this.name,
			statsCareer: _this.statsCareer,
			statsMonthly: _this.statsMonthly
		});
	};

	this.resetStoredStats = function () {
		_this.storedStats(null);
	};

	this.hasStoredStats = ko.computed(function () {
		return !!_this.storedStats();
	});
}

;
module.exports = exports['default'];

},{"./constants.js":1,"./knockout-persist.js":2,"./storage.js":5}],7:[function(require,module,exports){
// Last max value update from tagpro-stats.com: 2015-08-08

'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libViewModelJs = require('lib/viewModel.js');

var _libViewModelJs2 = _interopRequireDefault(_libViewModelJs);

var _libConstantsJs = require('lib/constants.js');

var constants = _interopRequireWildcard(_libConstantsJs);

var _libStatLimitsJs = require('lib/statLimits.js');

var statLimits = _interopRequireWildcard(_libStatLimitsJs);

var _libStorageJs = require('lib/storage.js');

var storage = _interopRequireWildcard(_libStorageJs);

require('lib/knockout-sortable.js');



GM_addStyle(".show-best-stats .rank a {\n\tfont-weight: bold;\n}\n\n#chart {\n\tmax-width: 100%;\n}\n\n#chartLegend ul {\n\tlist-style: none;\n\tmargin-left: 0;\n\tmargin-bottom: 0;\n}\n\n#chartLegend li span {\n\tdisplay: inline-block;\n\twidth: 12px;\n\theight: 12px;\n\tmargin-right: 5px\n}\n\n#chartPanel .chart-container {\n\tposition: relative;\n}\n\n#chartPanel .panel-body {\n\tposition: relative;\n\tbackground-color: white;\n\tz-index: 110;\n}\n\n#chartOptions {\n\tbackground-color: white;\n\tborder-radius: 6px 0 0 6px;\n\tborder-right: none;\n\tborder: 1px solid #ddd;\n\tbottom: -1px;\n\tleft: 0;\n\toverflow: auto;\n\tpadding: 10px;\n\tposition: absolute;\n\ttransition: visibility 0s 0.4s, left 0.4s;\n\ttop: -1px;\n\twidth: 350px;\n\tz-index: 100;\n\tvisibility: hidden;\n}\n\n#chartOptions legend {\n\tmargin-bottom: 5px;\n\tfont-size: 15px;\n}\n\n#chartOptions.visible {\n\tleft: -350px;\n\ttransition: left 0.6s;\n\tvisibility: visible;\n\tbox-shadow: 0 0 5px 0 #ccc;\n}\n\n#chartOptions li {\n\tcursor: move;\n}\n\n#chartOptions .close {\n\tposition: absolute;\n\ttop: 5px;\n\tright: 5px;\n}\n\n#chartOptions .chart-customize {\n\tbackground-color: #eee;\n}\n\n.chart-options-toggle {\n\tposition: absolute;\n\tleft: 5px;\n\ttop: 5px;\n\topacity: 0;\n\tcolor: #000;\n\ttext-decoration: none;\n}\n\n.chart-container .panel-body:hover .chart-options-toggle {\n\topacity: 0.2;\n\ttext-decoration: none;\n}");

var options = _.extend({}, constants.DEFAULT_OPTIONS, storage.getAll());

var viewModel = new _libViewModelJs2['default'](options);

var careerRowSelector = 'nav.navbar + .row > .col-lg-8 > .row';
var monthlyRowSelector = 'nav.navbar + .row > .col-lg-8 > .row + .row';
var sidebarSelector = 'nav.navbar + .row > .col-lg-4';

var tableSelector = '.statstable';
var $careerTable = $(careerRowSelector).find(tableSelector).first();
var $monthlyTable = $(monthlyRowSelector).find(tableSelector).first();

var $panel = $("<div id=\"chartPanel\" class=\"panel panel-default\">\n\t<div class=\"panel-heading text-center\">\n\t\tSummary\n\t</div>\n\t<div class=\"chart-container\">\n\t\t<div class=\"panel-body\">\n\t\t\t<div>\n\t\t\t\t<canvas id=\"chart\"></canvas>\n\t\t\t</div>\n\n\t\t\t<a href=\"#chartOptions\" class=\"chart-options-toggle\" data-bind=\"click: toggleSettings\">\n\t\t\t\tSettings\n\t\t\t</a>\n\n\t\t\t<div id=\"chartLegend\" data-bind=\"visible: showLegend\"></div>\n\t\t</div>\n\n\t\t<div id=\"chartOptions\" data-bind=\"css: { visible: showSettings }\">\n\t\t\t<a href=\"#\" class=\"close\" data-bind=\"click: toggleSettings\">&times;</a>\n\n\t\t\t<fieldset>\n\t\t\t\t<legend>Chart type</legend>\n\n\t\t\t\t<label class=\"radio-inline\">\n\t\t\t\t\t<input type=\"radio\" value=\"radar\" data-bind=\"checked: chartType\"> Radar\n\t\t\t\t</label>\n\t\t\t\t<label class=\"radio-inline\">\n\t\t\t\t\t<input type=\"radio\" value=\"bar\" data-bind=\"checked: chartType\"> Bar\n\t\t\t\t</label>\n\t\t\t</fieldset>\n\n\t\t\t<fieldset>\n\t\t\t\t<legend>Chart elements</legend>\n\n\t\t\t\t<label class=\"checkbox-inline\">\n\t\t\t\t\t<input type=\"checkbox\" data-bind=\"checked: showCareerStats\"> Career stats\n\t\t\t\t</label>\n\t\t\t\t<label class=\"checkbox-inline\">\n\t\t\t\t\t<input type=\"checkbox\" data-bind=\"checked: showMonthlyStats\"> Monthly stats\n\t\t\t\t</label>\n\t\t\t\t<label class=\"checkbox-inline\">\n\t\t\t\t\t<input type=\"checkbox\" data-bind=\"checked: showName\"> Name\n\t\t\t\t</label>\n\t\t\t\t<label class=\"checkbox-inline\">\n\t\t\t\t\t<input type=\"checkbox\" data-bind=\"checked: showLegend\"> Legend\n\t\t\t\t</label>\n\t\t\t\t<label class=\"checkbox-inline\">\n\t\t\t\t\t<input type=\"checkbox\" data-bind=\"checked: showStoredStats\"> Stored stats\n\t\t\t\t</label>\n\t\t\t</fieldset>\n\n\t\t\t<fieldset>\n\t\t\t\t<legend>Chart options</legend>\n\n\t\t\t\t<label class=\"checkbox-inline\">\n\t\t\t\t\t<input type=\"checkbox\" data-bind=\"checked: customizeStats\"> Select / Order stats\n\t\t\t\t</label>\n\n\t\t\t\t<div class=\"chart-customize\" data-bind=\"visible: customizeStats\">\n\t\t\t\t\t<a class=\"btn btn-default btn-sm pull-right\" href=\"#\" data-bind=\"click: resetStats\">Reset</a>\n\n\t\t\t\t\t<ul data-bind=\"sortable: selectedStats\">\n\t\t\t\t\t\t<li data-bind=\"text: $root.getStatLabel($data)\"></li>\n\t\t\t\t\t</ul>\n\t\t\t\t</div>\n\n\t\t\t\t<div>\n\t\t\t\t\t<button class=\"btn btn-default\" data-bind=\"click: storeStats\">\n\t\t\t\t\t\tStore stats\n\t\t\t\t\t</button>\n\t\t\t\t\t<button class=\"btn btn-default\" data-bind=\"click: resetStoredStats, enable: hasStoredStats\">\n\t\t\t\t\t\tRemove stored stats\n\t\t\t\t\t</button>\n\t\t\t\t</div>\n\t\t\t</fieldset>\n\n\n\t\t\t<fieldset>\n\t\t\t\t<legend>Other</legend>\n\n\t\t\t\t<div class=\"checkbox\">\n\t\t\t\t\t<label>\n\t\t\t\t\t\t<input type=\"checkbox\" data-bind=\"checked: showBestStats\"> Replace ranks with best stats\n\t\t\t\t\t</label>\n\t\t\t\t</div>\n\n\t\t\t\t<a class=\"btn btn-default\" href=\"#\" data-bind=\"click: resetAll\">Reset All</a>\n\t\t\t</fieldset>\n\t\t</div>\n\t</div>\n</div>");

$(sidebarSelector).prepend($panel);

$('body').attr('data-bind', "css: { 'show-best-stats': showBestStats }");

function getBestStatValue(stat) {
	if (_.contains(constants.NEGATIVE_STATS, stat)) {
		return statLimits.minValues[stat];
	} else {
		return statLimits.maxValues[stat];
	}
}

function getStatsFromTable(table, injectInputs) {
	var stats = {};

	table.find('td.head').each(function () {
		var $link = $(this).siblings('td.rank').find('a');
		var stat = $link.attr('href').match(/stat=([^&]+)/);

		if (!stat) {
			return;
		}

		var statname = stat[1];
		var label = $(this).text();

		if (!viewModel.statsMeta[statname]) {
			var _label$split = label.split('/', 2);

			var _label$split2 = _slicedToArray(_label$split, 2);

			var dividend = _label$split2[0];
			var divisor = _label$split2[1];

			viewModel.statsMeta[statname] = {
				label: label,
				labelDividend: dividend,
				labelDivisor: constants.DIVISOR_LABEL_MAPPINGS[divisor]
			};
		}

		stats[statname] = {
			label: label,
			value: parseFloat($(this).siblings('td.stat').first().text())
		};

		if (injectInputs) {
			var $input = $('<input type="checkbox" class="pull-right" data-bind="visible: customizeStats, checked: selectedStats">').attr('value', statname);
			$(this).prepend($input);

			var rank = $link.text();
			var bestStat = +getBestStatValue(statname).toFixed(2);
			$link.html('<span data-bind="visible: !showBestStats()">' + rank + '</span><span data-bind="visible: showBestStats">' + bestStat + '</span>');
		}
	});

	return stats;
}

viewModel.name = $("h3 a[href*='profile/']").text();
viewModel.statsCareer = getStatsFromTable($careerTable, true);
viewModel.statsMonthly = getStatsFromTable($monthlyTable, true);

ko.applyBindings(viewModel);

function calculateValues(stats) {
	return _.map(viewModel.selectedStats(), function (stat) {
		var val = stats[stat];

		// If the statistic was not found, calculate it
		if (!val && viewModel.statsMeta[stat]) {
			var meta = viewModel.statsMeta[stat];
			var statDividend = _.findKey(stats, { 'label': meta.labelDividend });
			var statDivisor = _.findKey(stats, { 'label': meta.labelDivisor });
			val = stats[statDividend].value / stats[statDivisor].value;
		} else {
			val = val.value;
		}

		var max = statLimits.maxValues[stat];
		var percentage;

		if (_.contains(constants.NEGATIVE_STATS, stat)) {
			var min = statLimits.minValues[stat];
			percentage = (val - min) * 100 / (max - min);
		} else {
			percentage = val / max * 100;
		}

		if (percentage > 100) {
			percentage = 100;
		}

		if (percentage < 0) {
			percentage = 0;
		}

		return percentage.toFixed(2);
	});
}

var ctx = document.getElementById('chart').getContext('2d');
var chart;

function createDataSet(label, data, colors) {
	return {
		label: label,
		fillColor: colors.fill,
		strokeColor: colors.stroke,
		pointColor: colors.point,
		pointStrokeColor: colors.pointStroke || '#fff',
		data: data
	};
}

function drawChart() {
	var datasets = [];
	var storedStats = viewModel.storedStats();
	var showStoredStats = viewModel.showStoredStats();

	var _constants$COLOR_SCHEMES = _slicedToArray(constants.COLOR_SCHEMES, 4);

	var storedCareerColors = _constants$COLOR_SCHEMES[0];
	var storedMonthlyColors = _constants$COLOR_SCHEMES[1];
	var careerColors = _constants$COLOR_SCHEMES[2];
	var monthlyColors = _constants$COLOR_SCHEMES[3];

	if (showStoredStats && storedStats) {
		if (viewModel.showCareerStats()) {
			var label = 'Career (' + storedStats.name + ')';
			var values = calculateValues(storedStats.statsCareer);

			datasets.push(createDataSet(label, values, storedCareerColors));
		}

		if (viewModel.showMonthlyStats()) {
			var label = 'Monthly (' + storedStats.name + ')';
			var values = calculateValues(storedStats.statsMonthly);

			datasets.push(createDataSet(label, values, storedMonthlyColors));
		}
	}

	if (viewModel.showCareerStats()) {
		var _label = 'Career';

		if (showStoredStats && storedStats) {
			_label = 'Career (' + viewModel.name + ')';
		};

		var careerValues = calculateValues(viewModel.statsCareer);

		datasets.push(createDataSet(_label, careerValues, careerColors));
	}

	if (viewModel.showMonthlyStats()) {
		var _label2 = 'Monthly';

		if (showStoredStats && storedStats) {
			_label2 = 'Monthly (' + viewModel.name + ')';
		}

		var monthlyValues = calculateValues(viewModel.statsMonthly);

		datasets.push(createDataSet(_label2, monthlyValues, monthlyColors));
	}

	var labels = _.map(viewModel.selectedStats(), function (stat) {
		return viewModel.statsMeta[stat].label;
	});

	var data = { labels: labels, datasets: datasets };

	var opts = {
		animation: false,
		scaleOverlay: true,
		scaleOverride: true,
		scaleSteps: 4,
		scaleStepWidth: 25,
		showTooltips: false,
		responsive: true
	};

	if (chart) {
		chart.destroy();
	}

	if (viewModel.showName()) {
		opts.onAnimationComplete = function () {
			ctx.fillStyle = careerColors.stroke;
			ctx.textBaseline = "top";
			ctx.textAlign = "right";
			ctx.fillText(viewModel.name, ctx.canvas.width, 0);

			if (showStoredStats && storedStats) {
				ctx.fillStyle = "#666";
				ctx.fillText(' vs ', ctx.canvas.width - ctx.measureText(viewModel.name).width, 0);

				ctx.fillStyle = storedCareerColors.stroke;
				ctx.fillText(storedStats.name, ctx.canvas.width - ctx.measureText(' or ' + viewModel.name).width, 0);
			}
		};
	}

	switch (viewModel.chartType()) {
		case 'bar':
			chart = new Chart(ctx).Bar(data, opts);
			break;
		default:
			chart = new Chart(ctx).Radar(data, opts);
			break;
	}

	$('#chartLegend').html(chart.generateLegend());
}

viewModel.chartType.subscribe(drawChart);
viewModel.selectedStats.subscribe(drawChart);
viewModel.showMonthlyStats.subscribe(drawChart);
viewModel.showCareerStats.subscribe(drawChart);
viewModel.showStoredStats.subscribe(drawChart);
viewModel.showName.subscribe(drawChart);

drawChart();

},{"lib/constants.js":1,"lib/knockout-sortable.js":3,"lib/statLimits.js":4,"lib/storage.js":5,"lib/viewModel.js":6}]},{},[7]);
