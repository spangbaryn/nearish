vis.js
vis-timelinedocstimeline
Timeline
Overview
The Timeline is an interactive visualization chart to visualize data in time. The data items can take place on a single date, or have a start and end date (a range). You can freely move and zoom in the timeline by dragging and scrolling in the Timeline. Items can be created, edited, and deleted in the timeline. The time scale on the axis is adjusted automatically, and supports scales ranging from milliseconds to years.

Timeline uses regular HTML DOM to render the timeline and items put on the timeline. This allows for flexible customization using css styling.

Contents
Overview
Example
Loading
Data Format
Items
Groups
Configuration Options
Methods
Events
Editing Items
Templates
Localization
Time zone
Styles
Example
The following code shows how to create a Timeline and provide it with data. More examples can be found in the timeline examples page.

<!DOCTYPE HTML>
<html>
<head>
  <title>Timeline | Basic demo</title>

  <style type="text/css">
    body, html {
      font-family: sans-serif;
    }
  </style>

  <script src="../../dist/vis.js"></script>
  <link href="../../dist/vis-timeline-graph2d.min.css" rel="stylesheet" type="text/css" />
</head>
<body>
<div id="visualization"></div>

<script type="text/javascript">
  // DOM element where the Timeline will be attached
  var container = document.getElementById('visualization');

  // Create a DataSet (allows two way data-binding)
  var items = new vis.DataSet([
    {id: 1, content: 'item 1', start: '2013-04-20'},
    {id: 2, content: 'item 2', start: '2013-04-14'},
    {id: 3, content: 'item 3', start: '2013-04-18'},
    {id: 4, content: 'item 4', start: '2013-04-16', end: '2013-04-19'},
    {id: 5, content: 'item 5', start: '2013-04-25'},
    {id: 6, content: 'item 6', start: '2013-04-27'}
  ]);

  // Configuration for the Timeline
  var options = {};

  // Create a Timeline
  var timeline = new vis.Timeline(container, items, options);
</script>
</body>
</html>
Loading
Install or download the vis.js library in a subfolder of your project. Include the library's script and css files in the head of your html code:

<script src="vis/dist/vis.js"></script>
<link href="vis/dist/vis-timeline-graph2d.min.css" rel="stylesheet" type="text/css" />
The constructor of the Timeline is vis.Timeline
var timeline = new vis.Timeline(container, items, options);
or when using groups:
var timeline = new vis.Timeline(container, items, groups, options);
The constructor accepts four parameters:
container is the DOM element in which to create the timeline.
items is an Array containing items. The properties of an item are described in section Data Format, items.
groups is an Array containing groups. The properties of a group are described in section Data Format, groups.
options is an optional Object containing a name-value map with options. Options can also be set using the method setOptions.
Data Format
The timeline can be provided with two types of data:

Items containing a set of items to be displayed in time.
Groups containing a set of groups used to group items together.
Items
For items, the Timeline accepts an Array, a DataSet (offering 2 way data binding), or a DataView (offering 1 way data binding). Items are regular objects and can contain the properties start, end (optional), content, group (optional), className (optional), editable (optional), and style (optional).

A DataSet is constructed as:

var items = new vis.DataSet([
  {
    start: new Date(2010, 7, 15),
    end: new Date(2010, 8, 2),  // end is optional
    content: 'Trajectory A'
    // Optional: fields 'id', 'type', 'group', 'className', 'style'
  }
  // more items...
]);
The item properties are defined as:

Name	Type	Required	Description
className	String	no	This field is optional. A className can be used to give items an individual css style. For example, when an item has className 'red', one can define a css style like:
.vis-item.red {
  color: white;
  background-color: red;
  border-color: darkred;
}
More details on how to style items can be found in the section Styles.
align	String	no	This field is optional. If set this overrides the global align configuration option for this item.
content	String	yes	The contents of the item. This can be plain text or html code.
end	Date or number or string or Moment	no	The end date of the item. The end date is optional, and can be left null. If end date is provided, the item is displayed as a range. If not, the item is displayed as a box.
group	any type	no	This field is optional. When the group column is provided, all items with the same group are placed on one line. A vertical axis is displayed showing the groups. Grouping items can be useful for example when showing availability of multiple people, rooms, or other resources next to each other.
id	String or Number	no	An id for the item. Using an id is not required but highly recommended. An id is needed when dynamically adding, updating, and removing items in a DataSet.
selectable	Boolean	no	Ability to enable/disable selectability for specific items. Defaults to true. Does not override the timeline's selectable configuration option.
start	Date or number or string or Moment	yes	The start date of the item, for example new Date(2010,9,23).
style	String	no	A css text string to apply custom styling for an individual item, for example "color: red; background-color: pink;".
subgroup	String or Number	none	The id of a subgroup. Groups all items within a group per subgroup, and positions them on the same height instead of staking them on top of each other. can be ordered by specifying the option subgroupOrder of a group.
title	String	none	Add a title for the item, displayed when holding the mouse on the item. The title can be an HTML element or a string containing plain text or HTML.
type	String	no	The type of the item. Can be 'box' (default), 'point', 'range', or 'background'. Types 'box' and 'point' need a start date, the types 'range' and 'background' needs both a start and end date.
limitSize	Boolean	no	Some browsers cannot handle very large DIVs so by default range DIVs can be truncated outside the visible area. Setting this to false will cause the creation of full-size DIVs.
Groups
For the items, groups can be an Array, a DataSet (offering 2 way data binding), or a DataView (offering 1 way data binding). Using groups, items can be grouped together. Items are filtered per group, and displayed as Group items can contain the properties id, content, and className (optional).

Groups can be applied to a timeline using the method setGroups or supplied in the constructor. A table with groups can be created like:

var groups = [
  {
    id: 1,
    content: 'Group 1'
    // Optional: a field 'className', 'style', 'order', [properties]
  }
  // more groups...
]);
Groups can have the following properties:

Name	Type	Required	Description
className	String	no	This field is optional. A className can be used to give groups an individual css style. For example, when a group has className 'red', one can define a css style .red { color: red; } . More details on how to style groups can be found in the section Styles.
content	String or Element	yes	The contents of the group. This can be plain text, html code or an html element.
id	String or Number	yes	An id for the group. The group will display all items having a property group which matches the id of the group.
style	String	no	A css text string to apply custom styling for an individual group label, for example "color: red; background-color: pink;".
subgroupOrder	String or Function	none	Order the subgroups by a field name or custom sort function. By default, groups are ordered by first-come, first-show.
subgroupStack	Object or Boolean	none	Enables stacking within individual subgroups. Example: {'subgroup0': true, 'subgroup1': false, 'subgroup2': true} For each subgroup where stacking is enabled, items will be stacked on top of each other within that subgroup such that they do no overlap. If set to true all subgroups will be stacked. If a value was specified for the order parameter in the options, that ordering will be used when stacking the items.
subgroupVisibility	Object	none	Ability to hide/show specific subgroups. Example: {'hiddenSubgroup0': false, 'subgroup1': true, 'subgroup2': true} If a subgroup is missing from the object, it will default as true (visible).
title	String	none	A title for the group, displayed when holding the mouse on the groups label. The title can only contain plain text.
visible	Boolean	no	Provides a means to toggle the whether a group is displayed or not. Defaults to true.
nestedGroups	Array	no	Array of group ids nested in the group. Nested groups will appear under this nesting group.
showNested	Boolean	no	Assuming the group has nested groups, this will set the initial state of the group - shown or collapsed. The showNested is defaulted to true.
Configuration Options
Options can be used to customize the timeline. Options are defined as a JSON object. All options are optional.

var options = {
  width: '100%',
  height: '30px',
  margin: {
    item: 20
  }
};
The following options are available.

Name	Type	Default	Description
align	String	'center'	Alignment of items with type 'box', 'range', and 'background'. Available values are 'auto' (default), 'center', 'left', or 'right'. For 'box' items, the 'auto' alignment is 'center'. For 'range' items, the auto alignment is dynamic: positioned left and shifted such that the contents is always visible on screen.
autoResize	boolean	true	If true, the Timeline will automatically detect when its container is resized, and redraw itself accordingly. If false, the Timeline can be forced to repaint after its container has been resized using the function redraw().
clickToUse	boolean	false	When a Timeline is configured to be clickToUse, it will react to mouse and touch events only when active. When active, a blue shadow border is displayed around the Timeline. The Timeline is set active by clicking on it, and is changed to inactive again by clicking outside the Timeline or by pressing the ESC key.
configure	boolean or function	false	When true, a configurator is loaded where all configuration options of the Timeline can be changed live. The displayed options can be filtered by providing a filter function. This function is invoked with two arguments: the current option and the path (an Array) of the option within the options object. The option will be displayed when the filter function returns true. For example to only display format options:
function (option, path) {
  return option === 'format' || path.indexOf('format') !== -1;
}
dataAttributes	string[] or 'all'	false	An array of fields optionally defined on the timeline items that will be appended as data- attributes to the DOM element of the items.
If value is 'all' then each field defined on the timeline item will become a data- attribute.
end	Date or Number or String or Moment	none	The initial end date for the axis of the timeline. If not provided, the latest date present in the items set is taken as end date.
format	Object or Function	none	Apply custom date formatting of the labels on the time axis. The default value of format is:
{
  minorLabels: {
    millisecond:'SSS',
    second:     's',
    minute:     'HH:mm',
    hour:       'HH:mm',
    weekday:    'ddd D',
    day:        'D',
    week:       'w',
    month:      'MMM',
    year:       'YYYY'
  },
  majorLabels: {
    millisecond:'HH:mm:ss',
    second:     'D MMMM HH:mm',
    minute:     'ddd D MMMM',
    hour:       'ddd D MMMM',
    weekday:    'MMMM YYYY',
    day:        'MMMM YYYY',
    week:       'MMMM YYYY',
    month:      'YYYY',
    year:       ''
  }
}
For values which not provided in the customized options.format, the default values will be used. All available formatting syntax is described in the docs of moment.js.
You can also use a function format for each label. The function accepts as arguments the date, scale and step in that order, and expects to return a string for the label.
function format({
  minorLabels: Function(date: Date, scale: Number, step: Number),
  majorLabels: Function(date: Date, scale: Number, step: Number)
}
groupHeightMode	String	'auto'	Specifies how the height of a group is calculated. Choose from 'auto','fixed', and 'fitItems'.
If it is set to 'auto' the height will be calculated based on a group label and visible items.
If it is set to 'fitItems' the height will be calculated based on the visible items only.
While if it is set to 'fixed' the group will keep the same height even if there are no visible items in the window.
groupOrder	String or Function	'order'	Order the groups by a field name or custom sort function. By default, groups are ordered by a property order (if set). If no order properties are provided, the order will be undetermined.
groupOrderSwap	Function	none	Swaps the positions of two groups. If groups have a custom order (via groupOrder) and groups are configured to be reorderable (via groupEditable.order), the user has to provide a function that swaps the positions of two given groups. If this option is not set, the default implementation assumes that groups hold an attribute order which values are changed. The signature of the groupOrderWap function is:
function groupOrderSwap(fromGroup: Object, toGroup: Object, groups: DataSet)
The first to arguments hold the groups of which the positions are to be swapped and the third argument holds the DataSet with all groups.
groupTemplate	function	none	A template function used to generate the contents of the groups. The function is called by the Timeline with a groups data as the first argument and the group element as the second, and must return HTML code, a string or a template as result. When the option groupTemplate is specified, the groups do not need to have a field content. See section Templates for a detailed explanation.
height	number or String	none	The height of the timeline in pixels or as a percentage. When height is undefined or null, the height of the timeline is automatically adjusted to fit the contents. It is possible to set a maximum height using option maxHeight to prevent the timeline from getting too high in case of automatically calculated height.
hiddenDates	Object	none	This option allows you to hide specific timespans from the time axis. The dates can be supplied as an object: {start: '2014-03-21 00:00:00', end: '2014-03-28 00:00:00', [repeat:'daily']} or as an Array of these objects. The repeat argument is optional. The possible values are (case-sensitive): daily, weekly, monthly, yearly. To hide a weekend, pick any Saturday as start and the following Monday as end and set repeat to weekly.
horizontalScroll	Boolean	false	This option allows you to scroll horizontally to move backwards and forwards in the time range. Only applicable when option zoomKey is defined or zoomable is false.
locale	String	none	Select a locale for the Timeline. See section Localization for more information.
locales	Object	none	A map with i18n locales. See section Localization for more information.
longSelectPressTime	number	251	The minimal press time in ms for an event to be considered a (long) press.
moment	function	vis.moment	A constructor for creating a moment.js Date. Allows for applying a custom time zone. See section Time zone for more information.
max	Date or Number or String or Moment	none	Set a maximum Date for the visible range. It will not be possible to move beyond this maximum.
maxHeight	number or String	none	Specifies the maximum height for the Timeline. Can be a number in pixels or a string like "300px".
maxMinorChars	number	7	Specifies the maximum number of characters that should fit in minor grid labels. If larger, less and wider grids will be drawn.
min	Date or Number or String or Moment	none	Set a minimum Date for the visible range. It will not be possible to move beyond this minimum.
minHeight	number or String	none	Specifies the minimum height for the Timeline. Can be a number in pixels or a string like "300px".
moveable	boolean	true	Specifies whether the Timeline can be moved and zoomed by dragging the window. See also option zoomable.
multiselect	boolean	false	If true, multiple items can be selected using ctrl+click, shift+click, or by holding items. Only applicable when option selectable is true.
multiselectPerGroup	boolean	false	If true, selecting multiple items using shift+click will only select items residing in the same group as the first selected item. Only applicable when option selectable and multiselect are true.
onAdd	function	none	Callback function triggered when an item is about to be added: when the user double taps an empty space in the Timeline. See section Editing Items for more information. Only applicable when both options selectable and editable.add are set true.
onAddGroup	function	none	Callback function triggered when a group is about to be added. The signature and semantics are the same as for onAdd.
onDropObjectOnItem	function	none	Callback function triggered when an object containing target:'item' in its drag data is dropped in to a timeline item.
onInitialDrawComplete	function	none	Callback function triggered when the timeline is initially drawn. This function fires once per timeline creation.
onMove	function	none	Callback function triggered when an item has been moved: after the user has dragged the item to an other position. See section Editing Items for more information. Only applicable when both options selectable and editable.updateTime or editable.updateGroup are set true.
onMoveGroup	function	none	Callback function triggered when a group has been moved: after the user has dragged the group to an other position. The signature and semantics are the same as for onMove.
onMoving	function	none	Callback function triggered repeatedly when an item is being moved. See section Editing Items for more information. Only applicable when both options selectable and editable.updateTime or editable.updateGroup are set true.
onRemove	function	none	Callback function triggered when an item is about to be removed: when the user tapped the delete button on the top right of a selected item. See section Editing Items for more information. Only applicable when both options selectable and editable.remove are set true.
onRemoveGroup	function	none	Callback function triggered when a group is about to be removed. The signature and semantics are the same as for onRemove.
onUpdate	function	none	Callback function triggered when an item is about to be updated, when the user double taps an item in the Timeline. See section Editing Items for more information. Only applicable when both options selectable and editable.updateTime or editable.updateGroup are set true.
order	function	none	
Provide a custom sort function to order the items. The order of the items is determining the way they are stacked. The function order is called with two arguments containing the data of two items to be compared.

WARNING: Use with caution. Custom ordering is not suitable for large amounts of items. On load, the Timeline will render all items once to determine their width and height. Keep the number of items in this configuration limited to a maximum of a few hundred items.

preferZoom	boolean	false	If true, scrolling vertically on timeline center panel will be prevented, and zoom action will be preferred, without need of zoomKey.
rtl	boolean	false	If true, the timeline will be right-to-left. Note: you can achieve rtl timeline by defining a parent node with dir="rtl". The timeline knows to take the nearest parent node direction and apply it. Notice that the timeline will prefer the option.rtl over any parent dir="rtl"
selectable	boolean	true	If true, the items on the timeline can be selected. Multiple items can be selected by long pressing them, or by using ctrl+click or shift+click. The event select is fired each time the selection has changed (see section Events).
sequentialSelection	boolean	false	If true, then only sequential items are allowed to be selected (no gaps) when multiselect is true
showCurrentTime	boolean	true	Show a vertical bar at the current time.
showMajorLabels	boolean	true	By default, the timeline shows both minor and major date labels on the time axis. For example the minor labels show minutes and the major labels show hours. When showMajorLabels is false, no major labels are shown.
showMinorLabels	boolean	true	By default, the timeline shows both minor and major date labels on the time axis. For example the minor labels show minutes and the major labels show hours. When showMinorLabels is false, no minor labels are shown. When both showMajorLabels and showMinorLabels are false, no horizontal axis will be visible.
showWeekScale	boolean	false	By default, the timeline doesn't show week number scale in the date labels on the time axis. When showWeekScale is true, week number labels are shown.
showTooltips	boolean	true	If true, items with titles will display a tooltip. If false, item tooltips are prevented from showing.
stack	boolean	true	If true (default), items will be stacked on top of each other such that they do not overlap.
stackSubgroups	boolean	true	If true (default), subgroups will be stacked on top of each other such that they do not overlap.
snap	function or null	function	When moving items on the Timeline, they will be snapped to nice dates like full hours or days, depending on the current scale. The snap function can be replaced with a custom function, or can be set to null to disable snapping. The signature of the snap function is:
function snap(date: Date, scale: string, step: number) : Date or number
The parameter scale can be can be 'millisecond', 'second', 'minute', 'hour', 'weekday, 'week', 'day, 'month, or 'year'. The parameter step is a number like 1, 2, 4, 5.
start	Date or Number or String or Moment	none	The initial start date for the axis of the timeline. If not provided, the earliest date present in the events is taken as start date.
template	function	none	A template function used to generate the contents of the items. The function is called by the Timeline with an items' data as the first argument, the item element as the second argument and the edited data as the third argument, and must return HTML code, a string or a template as result. When the option template is specified, the items do not need to have a field content. See section Templates for a detailed explanation.
visibleFrameTemplate	function	none	A template function used to generate the visible frame of the items. The function is called by the Timeline with an items' data as the first argument and the item frame element as the second, and must return HTML code, a string or a template as result. When the option template is specified, the items do not need to have a field content. See section Templates for a detailed explanation. This would be used as an additional way to add content that is constant in size with the visible frame of the item and does not get visibly hidden with the item's internal container: vis-item-overflow which is overflow:hidden.
type	String	none	Specifies the default type for the timeline items. Choose from 'box', 'point', 'range', and 'background'. Note that individual items can override this default type. If undefined, the Timeline will auto detect the type from the items data: if a start and end date is available, a 'range' will be created, and else, a 'box' is created. Items of type 'background' are not editable.
verticalScroll	Boolean	false	Show a vertical scroll on the side of the group list and link it to the scroll event when zoom is not triggered. Notice that defining this option as true will NOT override horizontalScroll. The scroll event will be vertically ignored, but a vertical scrollbar will be visible
width	String or Number	'100%'	The width of the timeline in pixels or as a percentage.
zoomable	boolean	true	Specifies whether the Timeline can be zoomed by pinching or scrolling in the window. Only applicable when option moveable is set true.
zoomFriction	number	5	Specifies how strong the zooming is for each scroll tick. Higher zooming friction will slow zooming speed.
zoomKey	String	''	Specifies whether the Timeline is only zoomed when an additional key is down. Available values are '' (does not apply), 'altKey', 'ctrlKey', 'shiftKey' or 'metaKey'. Only applicable when option moveable is set true.
zoomMax	number	315360000000000	Set a maximum zoom interval for the visible range in milliseconds. It will not be possible to zoom out further than this maximum. Default value equals about 10000 years.
zoomMin	number	10	Set a minimum zoom interval for the visible range in milliseconds. It will not be possible to zoom in further than this minimum.
Methods
The Timeline supports the following methods.

Method	Return Type	Description
addCustomTime([time] [, id])	number or String	Add new vertical bar representing a custom time that can be dragged by the user. Parameter time can be a Date, Number, or String, and is new Date() by default. Parameter id can be Number or String and is undefined by default. The idcode> is added as CSS class name of the custom time bar, allowing to style multiple time bars differently. The method returns id of the created bar.
destroy()	none	Destroy the Timeline. The timeline is removed from memory. all DOM elements and event listeners are cleaned up.
fit([options])	none	Adjust the visible window such that it fits all items. See also function focus(id). Available options:
animation: boolean or {duration: number, easingFunction: string}
If true (default) or an Object, the range is animated smoothly to the new window. An object can be provided to specify duration and easing function. Default duration is 500 ms, and default easing function is 'easeInOutQuad'. Available easing functions: "linear", "easeInQuad", "easeOutQuad", "easeInOutQuad", "easeInCubic", "easeOutCubic", "easeInOutCubic", "easeInQuart", "easeOutQuart", "easeInOutQuart", "easeInQuint", "easeOutQuint", "easeInOutQuint".
focus(id or ids [, options])	none	Adjust the visible window such that the selected item (or multiple items) are centered on screen. See also function fit(). Available options:
animation: boolean or {duration: number, easingFunction: string}
If true (default) or an Object, the range is animated smoothly to the new window. An object can be provided to specify duration and easing function. Default duration is 500 ms, and default easing function is 'easeInOutQuad'. Available easing functions: "linear", "easeInQuad", "easeOutQuad", "easeInOutQuad", "easeInCubic", "easeOutCubic", "easeInOutCubic", "easeInQuart", "easeOutQuart", "easeInOutQuart", "easeInQuint", "easeOutQuint", "easeInOutQuint".
zoom: boolean If true (default), the timeline will zoom on the element after focus it.
getCurrentTime()	Date	Get the current time. Only applicable when option showCurrentTime is true.
getCustomTime([id])	Date	Retrieve the custom time from the custom time bar with given id. Id is undefined by default.
getEventProperties(event)	Object	Returns an Object with relevant properties from an event:
group (Number or null): the id of the clicked group.
item (Number or null): the id of the clicked item.
customTime (Number or null): the id of the clicked custom-time.
pageX (Number): absolute horizontal position of the click event.
pageY (Number): absolute vertical position of the click event.
x (Number): relative horizontal position of the click event.
y (Number): relative vertical position of the click event.
time (Date): Date of the clicked event.
snappedTime (Date): Date of the clicked event, snapped to a nice value.
what (String or null): name of the clicked thing: item, background, axis, group-label, custom-time, or current-time.
event (Object): the original click event.
Example usage:
document.getElementById('myTimeline').onclick = function (event) {
  var props = timeline.getEventProperties(event)
  console.log(props);
}
getItemRange()	Object	Get the range of all the items as an object containing min: Date and max: Date.
getSelection()	number[]	Get an array with the ids of the currently selected items.
getVisibleItems()	number[]	Get an array with the ids of the currently visible items.
getWindow()	Object	Get the current visible window. Returns an object with properties start: Date and end: Date.
moveTo(time [, options, callback])	none	Move the window such that given time is centered on screen. Parameter time can be a Date, Number, or String. Available options:
animation: boolean or {duration: number, easingFunction: string}
If true (default) or an Object, the range is animated smoothly to the new window. An object can be provided to specify duration and easing function. Default duration is 500 ms, and default easing function is 'easeInOutQuad'. Available easing functions: "linear", "easeInQuad", "easeOutQuad", "easeInOutQuad", "easeInCubic", "easeOutCubic", "easeInOutCubic", "easeInQuart", "easeOutQuart", "easeInOutQuart", "easeInQuint", "easeOutQuint", "easeInOutQuint".
A callback function can be passed as an optional parameter. This function will be called at the end of moveTo function.
on(event, callback)	none	Create an event listener. The callback function is invoked every time the event is triggered. Available events: rangechange, rangechanged, select, itemover, itemout. The callback function is invoked as callback(properties), where properties is an object containing event specific properties. See section Events for more information.
off(event, callback)	none	Remove an event listener created before via function on(event, callback). See section Events for more information.
redraw()	none	Force a redraw of the Timeline. The size of all items will be recalculated. Can be useful to manually redraw when option autoResize=false and the window has been resized, or when the items CSS has been changed.
removeCustomTime(id)	none	Remove vertical bars previously added to the timeline via addCustomTime method. Parameter id is the ID of the custom vertical bar returned by addCustomTime method.
setCurrentTime(time)	none	Set a current time. This can be used for example to ensure that a client's time is synchronized with a shared server time. time can be a Date object, numeric timestamp, or ISO date string. Only applicable when option showCurrentTime is true.
setCustomTime(time [, id])	none	Adjust the time of a custom time bar. Parameter time can be a Date object, numeric timestamp, or ISO date string. Parameter id is the id of the custom time bar, and is undefined by default.
setCustomTimeMarker(title [, id, editable])	none	Attach a marker to the custom time bar. Parameter title is the string to be set as title of the marker. Parameter id is the id of the custom time bar which the marker is attached to, and is undefined by default. Any marker's style can be overridden by specifying css selectors such as .vis-custom-time > .vis-custom-time-marker, .${The id of the custom time bar} > .vis-custom-time-marker. Parameter editable makes the marker editable if true and is false by default.
setCustomTimeTitle(title [, id])	none	Adjust the title attribute of a custom time bar. Parameter title is the string or function to be set as title. Use empty string to hide the title completely. Parameter id is the id of the custom time bar, and is undefined by default.
setData({
  groups: groups,
  items: items
})	none	Set both groups and items at once. Both properties are optional. This is a convenience method for individually calling both setItems(items) and setGroups(groups). Both items and groups can be an Array with Objects, a DataSet (offering 2 way data binding), or a DataView (offering 1 way data binding). For each of the groups, the items of the timeline are filtered on the property group, which must correspond with the id of the group.
setGroups(groups)	none	Set a data set with groups for the Timeline. groups can be an Array with Objects, a DataSet (offering 2 way data binding), or a DataView (offering 1 way data binding). For each of the groups, the items of the timeline are filtered on the property group, which must correspond with the id of the group.
setItems(items)	none	Set a data set with items for the Timeline. items can be an Array with Objects, a DataSet (offering 2 way data binding), or a DataView (offering 1 way data binding).
setOptions(options)	none	Set or update options. It is possible to change any option of the timeline at any time. You can for example switch orientation on the fly.
setSelection(id or ids [, options])	none	Select one or multiple items by their id. The currently selected items will be unselected. To unselect all selected items, call `setSelection([])`. Available options:
focus: boolean
If true, focus will be set to the selected item(s)
animation: boolean or {duration: number, easingFunction: string}
If true (default) or an Object, the range is animated smoothly to the new window. An object can be provided to specify duration and easing function. Default duration is 500 ms, and default easing function is 'easeInOutQuad'. Only applicable when option focus is true. Available easing functions: "linear", "easeInQuad", "easeOutQuad", "easeInOutQuad", "easeInCubic", "easeOutCubic", "easeInOutCubic", "easeInQuart", "easeOutQuart", "easeInOutQuart", "easeInQuint", "easeOutQuint", "easeInOutQuint".
setWindow(start, end [, options, callback])	none	Set the current visible window. The parameters start and end can be a Date, Number, or String. If the parameter value of start or end is null, the parameter will be left unchanged. Available options:
animation: boolean or {duration: number, easingFunction: string}
If true (default) or an Object, the range is animated smoothly to the new window. An object can be provided to specify duration and easing function. Default duration is 500 ms, and default easing function is 'easeInOutQuad'. Available easing functions: "linear", "easeInQuad", "easeOutQuad", "easeInOutQuad", "easeInCubic", "easeOutCubic", "easeInOutCubic", "easeInQuart", "easeOutQuart", "easeInOutQuart", "easeInQuint", "easeOutQuint", "easeInOutQuint".
A callback function can be passed as an optional parameter. This function will be called at the end of setWindow function.
toggleRollingMode()	none	Toggle rollingMode.
zoomIn(percentage [, options, callback])	none	Zoom in the current visible window. The parameter percentage can be a Number and must be between 0 and 1. If the parameter value of percentage is null, the window will be left unchanged. Available options:
animation: boolean or {duration: number, easingFunction: string}
If true (default) or an Object, the range is animated smoothly to the new window. An object can be provided to specify duration and easing function. Default duration is 500 ms, and default easing function is 'easeInOutQuad'. Available easing functions: "linear", "easeInQuad", "easeOutQuad", "easeInOutQuad", "easeInCubic", "easeOutCubic", "easeInOutCubic", "easeInQuart", "easeOutQuart", "easeInOutQuart", "easeInQuint", "easeOutQuint", "easeInOutQuint".
A callback function can be passed as an optional parameter. This function will be called at the end of zoomIn function.
zoomOut(percentage [, options, callback])	none	Zoom out the current visible window. The parameter percentage can be a Number and must be between 0 and 1. If the parameter value of percentage is null, the window will be left unchanged. Available options:
animation: boolean or {duration: number, easingFunction: string}
If true (default) or an Object, the range is animated smoothly to the new window. An object can be provided to specify duration and easing function. Default duration is 500 ms, and default easing function is 'easeInOutQuad'. Available easing functions: "linear", "easeInQuad", "easeOutQuad", "easeInOutQuad", "easeInCubic", "easeOutCubic", "easeInOutCubic", "easeInQuart", "easeOutQuart", "easeInOutQuart", "easeInQuint", "easeOutQuint", "easeInOutQuint".
A callback function can be passed as an optional parameter. This function will be called at the end of zoomOut function.
Events
Timeline fires events when changing the visible window by dragging, when selecting items, and when dragging the custom time bar.

Here an example on how to listen for a select event.

timeline.on('select', function (properties) {
  alert('selected items: ' + properties.items);
});
A listener can be removed via the function off:

function onSelect (properties) {
  alert('selected items: ' + properties.items);
}

// add event listener
timeline.on('select', onSelect);

// do stuff...

// remove event listener
timeline.off('select', onSelect);
The following events are available.

Name	Properties	Description
currentTimeTick	Fired when the current time bar redraws. The rate depends on the zoom level.
click	Passes a properties object as returned by the method Timeline.getEventProperties(event).	Fired when clicked inside the Timeline.
contextmenu	Passes a properties object as returned by the method Timeline.getEventProperties(event).	Fired when right-clicked inside the Timeline. Note that in order to prevent the context menu from showing up, default behavior of the event must be stopped:
timeline.on('contextmenu', function (props) {
  alert('Right click!');
  props.event.preventDefault();
});
doubleClick	Passes a properties object as returned by the method Timeline.getEventProperties(event).	Fired when double clicked inside the Timeline.
dragover	Passes a properties object as returned by the method Timeline.getEventProperties(event).	Fired when dragging over a timeline element.
drop	Passes a properties object as returned by the method Timeline.getEventProperties(event).	Fired when dropping inside the Timeline.
mouseOver	Passes a properties object as returned by the method Timeline.getEventProperties(event).	Fired when the mouse hovers over a timeline element.
mouseDown	Passes a properties object as returned by the method Timeline.getEventProperties(event).	Fired when the mouse down event is triggered over a timeline element.
mouseUp	Passes a properties object as returned by the method Timeline.getEventProperties(event).	Fired when the mouse up event is triggered over a timeline element.
mouseMove	Passes a properties object as returned by the method Timeline.getEventProperties(event).	Fired when the mouse is moved over a timeline element.
groupDragged	Passes the id of the dragged group.	Fired after the dragging of a group is finished.
changed	Has no properties.	Fired once after each graph redraw.
rangechange	
start (Number): timestamp of the current start of the window.
end (Number): timestamp of the current end of the window.
byUser (Boolean): change happened because of user drag/zoom.
event (Object): original event triggering the rangechange.
Fired repeatedly when the timeline window is being changed.
rangechanged	
start (Number): timestamp of the current start of the window.
end (Number): timestamp of the current end of the window.
byUser (Boolean): change happened because of user drag/zoom.
event (Object): original event triggering the rangechanged.
Fired once after the timeline window has been changed.
select	
items: an array with the ids of the selected items
event: the original click event
Fired after the user selects or deselects items by tapping or holding them. When a user taps an already selected item, the select event is fired again. Not fired when the method setSelectionis executed.
itemover	
item: hovered item id
event: the original mouseover event
Fired when the user moves the mouse over an item.
itemout	
item: hovered item id
event: the original mouseout event
Fired when the user moves the mouse out of an item.
timechange	
id (Number or String): custom time bar id.
time (Date): the custom time.
event (Object): original event triggering the timechange.
Fired repeatedly when the user is dragging the custom time bar. Only available when the custom time bar is enabled.
timechanged	
id (Number or String): custom time bar id.
time (Date): the custom time.
event (Object): original event triggering the timechanged.
Fired once after the user has dragged the custom time bar. Only available when the custom time bar is enabled.
markerchange	
id (Number or String): custom time bar id which the marker is attached to.
title (Date): the marker title.
event (Object): original event triggering the markerchange.
Fired when the marker title has been changed. Only available when the marker is editable.
markerchanged	
id (Number or String): custom time bar id which the marker is attached to.
title (Date): the marker title.
event (Object): original event triggering the markerchanged.
Fired when an alteration to the marker title is committed. Only available when the marker is editable.
Editing Items
When the Timeline is configured to be editable (both options selectable and editable are true), the user can:

Select an item by clicking it, and use ctrl+click to or shift+click to select multiple items (when multiselect: true).
Move selected items by dragging them.
Create a new item by double tapping on an empty space.
Create a new range item by dragging on an empty space with the ctrl key down.
Update an item by double tapping it.
Delete a selected item by clicking the delete button on the top right.
Option editable accepts a boolean or an object. When editable is a boolean, all manipulation actions will be either enabled or disabled. When editable is an object, one can enable individual manipulation actions:

// enable or disable all manipulation actions
var options = {
  editable: true       // true or false
};

// enable or disable individual manipulation actions
var options = {
  editable: {
    add: true,         // add new items by double tapping
    updateTime: true,  // drag items horizontally
    updateGroup: true, // drag items from one group to another
    remove: true,       // delete an item by tapping the delete button top right
    overrideItems: false  // allow these options to override item.editable
  }
};
Editing can be enabled/disabled for specific items. Setting the property editable to true or false on a data item will override the timeline option except when timeline.editable.overrideItems is set to true.

var items = new vis.DataSet([
  {id: 1, content: 'read-only item', start: '2013-04-20', editable: false},
  {id: 2, content: 'editable item', start: '2013-04-14'}
]);
Individual manipulation actions (updateTime, updateGroup and remove) can also be set on individual items. If any of the item-level actions are specified (and overrideItems is not false) then that takes precedence over the settings at the timeline level. Current behavior is that if any of the item-level actions are not specified, those items get undefined value (rather than inheriting from the timeline level). This may change in future major releases, and code that specifies all item level values will handle major release changes better. That is, instead of using editable: {updateTime : true}, use editable: {updateTime : true, updateGroup: false, remove: false}.

One can specify callback functions to validate changes made by the user. There are a number of callback functions for this purpose:

onAdd(item, callback) Fired when a new item is about to be added. If not implemented, the item will be added with default text contents.
onUpdate(item, callback) Fired when an item is about to be updated. This function typically has to show a dialog where the user change the item. If not implemented, nothing happens.
onDropObjectOnItem(objectData, item) Fired when an object is dropped in to an existing timeline item.
onMove(item, callback) Fired when an item has been moved. If not implemented, the move action will be accepted.
onMoving(item, callback) Fired repeatedly while an item is being moved (dragged). Can be used to adjust the items start, end, and/or group to allowed regions.
onRemove(item, callback) Fired when an item is about to be deleted. If not implemented, the item will be always removed.
Each of the callbacks is invoked with two arguments:

item: the item being manipulated
callback: a callback function which must be invoked to report back. The callback must be invoked as callback(item) or callback(null). Here, item can contain changes to the passed item. Parameter item typically contains fields `content`, `start`, and optionally `end`. The type of `start` and `end` is determined by the DataSet type configuration and is `Date` by default. When invoked as callback(null), the action will be cancelled.
Example code:

var options = {
  onUpdate: function (item, callback) {
    item.content = prompt('Edit items text:', item.content);
    if (item.content != null) {
      callback(item); // send back adjusted item
    }
    else {
      callback(null); // cancel updating the item
    }
  }
};
A full example is available here: editingItemsCallbacks.html.
Templates
Timeline supports templates to format item contents. Any template engine (such as handlebars or mustache) can be used, and one can also manually build HTML. In the options, one can provide a template handler. This handler is a function accepting an item's data as the first argument, the item element as the second argument and the edited data as the third argument, and outputs formatted HTML:

var options = {
  template: function (item, element, data) {
    var html = ... // generate HTML markup for this item
    return html;
  }
};
Create HTML manually
The HTML for an item can be created manually:
var options = {
  template: function (item, element, data) {
    return '<h1>' + item.header + data.moving?' '+ data.start:'' + '</h1><p>' + item.description + '</p>';
  },
  onMoving: function (item, callback) {
    item.moving = true;
  }
};
Using a template engine
Using handlebars, one can write the template in HTML:
<script id="item-template" type="text/x-handlebars-template">
  <h1>{{header}}</h1>
  <p>{{description}}</p>
</script>
Compile the template:
var source = document.getElementById('item-template').innerHTML;
var template = Handlebars.compile(source);
And then specify the template in the Timeline options
var options = {
  template: template
};
React templates
You can use a React component for the templates by rendering them to the templates' element directly:
  template: function (item, element, data) {
    return ReactDOM.render(<b>{item.content}</b>, element);
  },
Multiple templates
In order to support multiple templates, the template handler can be extended to switch between different templates, depending on a specific item property:
var templates = {
  template1: Handlebars.compile(...),
  template2: Handlebars.compile(...),
  template2: Handlebars.compile(...),
  ...
};

var options = {
  template: function (item, element, data) {
    var template = templates[item.template];  // choose the right template
    return template(item);                    // execute the template
  }
};
Now the items can be extended with a property template, specifying which template to use for the item.
Localization
Timeline can be localized. For localization, Timeline depends largely on the localization of moment.js. Locales are not included in vis.js by default. To enable localization, moment.js must be loaded with locales. Moment.js offers a bundle named "moment-with-locales.min.js" for this and there are various alternative ways to load locales.

To set a locale for the Timeline, specify the option locale:

var options = {
  locale: 'nl'
};
Create a new locale
To load a locale (that is not supported by default) into the Timeline, one can add a new locale to the option locales:
var options = {
  locales: {
    // create a new locale (text strings should be replaced with localized strings)
    mylocale: {
      current: 'current',
      time: 'time',
      deleteSelected: 'Delete selected'
    }
  },

  // use the new locale
  locale: 'mylocale'
};
Available locales
Timeline comes with support for the following locales:

Language	Code
English	en
en_EN
en_US
Italian	it
it_IT
it_CH
Dutch	nl
nl_NL
nl_BE
German	de
de_DE
French	fr
fr_FR
fr_CA
fr_BE
Ukrainian	uk
uk_UA
Russian	ru
ru_RU
Polish	pl
pl_PL
Portuguese	pt
pt_BR pt_PT
Swedish	sv
sv_SE
Norwegian	nb
nb_NO
nn
nn_NO
Lithuanian	lt
lt_LT
Time zone
By default, the Timeline displays time in local time. To display a Timeline in another time zone or in UTC, the date constructor can be overloaded via the configuration option moment, which by default is the constructor function of moment.js. More information about UTC with moment.js can be found in the docs: http://momentjs.com/docs/#/parsing/utc/.

Examples:

// display in UTC
var options = {
  moment: function(date) {
    return vis.moment(date).utc();
  }
};

// display in UTC +08:00
var options = {
  moment: function(date) {
    return vis.moment(date).utcOffset('+08:00');
  }
};
Styles
All parts of the Timeline have a class name and a default css style. The styles can be overwritten, which enables full customization of the layout of the Timeline.

For example, to change the border and background color of all items, include the following code inside the head of your html code or in a separate stylesheet.

<style>
  .vis-item {
    border-color: orange;
    background-color: yellow;
  }
</style>
Grid Backgrounds
The background grid of the time axis can be styled, for example to highlight weekends or to create grids with an alternating white/lightgray background.

Depending on the zoom level, the grids get certain css classes attached. The following classes are available:

Description	Values
Alternating columns	vis-even, vis-odd
Current date	vis-today, vis-tomorrow, vis-yesterday, vis-current-week, vis-current-month, vis-current-year
Hours	vis-h0, vis-h1, ..., vis-h23
Grouped hours	vis-h0-h4 to vis-h20-h24
Weekday	vis-monday, vis-tuesday, vis-wednesday, vis-thursday, vis-friday, vis-saturday, vis-sunday
Days	vis-day1, vis-day2, ..., vis-day31
Week	vis-week1, vis-week2, ..., vis-week53
Months	vis-january, vis-february, vis-march, vis-april, vis-may, vis-june, vis-july, vis-august, vis-september, vis-october, vis-november, vis-december
Years	vis-year2014, vis-year2015, ...
Note: the 'week' scale is not included in the automatic zoom levels as its scale is not a direct logical successor of 'days' nor a logical predecessor of 'months'

Examples:

<style>
  /* alternating column backgrounds */
  .vis-time-axis .vis-grid.vis-odd {
    background: #f5f5f5;
  }

  /* gray background in weekends, white text color */
  .vis-time-axis .vis-grid.vis-saturday,
  .vis-time-axis .vis-grid.vis-sunday {
    background: gray;
  }
  .vis-time-axis .vis-text.vis-saturday,
  .vis-time-axis .vis-text.vis-sunday {
    color: white;
  }
</style>
Performance Tips
Defining a timeline with many items and/or groups might affect initial loading time and general performance. Here are some tips to improve performance and avoid slow loading time:

Define items and group with DataSets
Avoid applying heavy CSS on items (such as box-shadow, gradient background colors, etc.)
Defining a start and an end in the timeline options. This will improve initial loading time.