$(function () {
// define the application
var Library = {};
var pgtransition = 'slide';
(function (app) {
// variable definitions go here
var BookLi = '<li><a data-id="Z2"><img src="THUMBNAIL" alt=""></img><h2>Z1</h2><p>DESCRIPTION</p><p><span class="ui-li-aside">SIDECONTENT</span></p><p><span class="ui-li-count">COUNTBUBBLE</span></p></a></li>';
var BookLiRi = '<li><a data-id="Z2">Z1</a></li>';
var BookHdr = '<li data-role="list-divider">Your Books</li>';
var noBook = '<li id="noBook">You have no books</li>';
app.init = function () {
// hide the address bar when the window is ready
window.addEventListener("load",function() {
setTimeout(function(){ window.scrollTo(0, 1) }, 0);
});
//eliminate the 300 ms delay in click events
FastClick.attach(document.body);
//window.addEventListener('load', function () {new FastClick.attach(document.body)}, false);//add an icon to the homescreen for lauch
addToHomescreen();
var addToHomeConfig = {returningVisitor: true, expire: 720, autostart: false};
app.BookBindings();
$('#msgboxyes').on('click', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
var yesmethod = $('#msgboxyes').data('method');
var yesid = $('#msgboxyes').data('id');
app[yesmethod](yesid);
});
$('#msgboxno').on('click', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
var nomethod = $('#msgboxno').data('method');
var noid = $('#msgboxno').data('id');
var toPage = $('#msgboxno').data('topage');
// show the page to display after a record is deleted
$.mobile.changePage('#' + toPage, {transition: pgtransition});
app[nomethod](noid);
});
$('#alertboxok').on('click', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
var toPage = $('#alertboxok').data('topage');
// show the page to display after ok is clicked
$.mobile.changePage('#' + toPage, {transition: pgtransition});
});
};
// define events to be fired during app execution.
app.BookBindings = function () {
// code to run before showing the page that lists the records.
//run before the page is shown
$(document).on('pagebeforechange', function (e, data) {
//get page to go to
var toPage = data.toPage[0].id;
switch (toPage) {
case 'pgBook':
$('#pgRptBookBack').data('from', 'pgBook');
// restart the storage check
app.checkForBookStorage();
break;
case 'pgReports':
$('#pgRptBookBack').data('from', 'pgReports');
break;
case 'pgRptBook':
app.BookRpt();
break;
case 'pgEditBook':
$('#pgRptBookBack').data('from', 'pgEditBook');
//clear the edit page contents
pgEditBookClear();
//load related select menus before the page shows
var Title = $('#pgEditBook').data('id');
//read record from JSON and update screen.
app.editBook(Title);
app.pgEditBookcheckForBookStorageR();
break;
case 'pgAddBook':
$('#pgRptBookBack').data('from', 'pgAddBook');
pgAddBookClear();
//load related select menus before the page shows
app.pgAddBookcheckForBookStorageR();
break;
}
});
//run after the page has been displayed
$(document).on('pagecontainershow', function (e, ui) {
var pageId = $(':mobile-pagecontainer').pagecontainer('getActivePage').attr('id');
switch (pageId) {
case 'pgEditBook':
break;
case 'pgAddBook':
break;
default:
}
});
//upload a file to server once onchange is detected
$('#pgAddBookBookImage').on('change', function () {
$.mobile.loading("show", {
text: "Loading file...",
textVisible: true
});
//check to see if we have a file
var fName = document.getElementById('pgAddBookBookImage').files[0];
if (typeof (fName) === 'undefined') fName = '';
if (Len(fName) > 0) {
//get the file name
var ofName = fName.name;
//get the file extension
var ofExt = Mid(ofName, InStrRev(ofName, '.'));
// open a file reader to upload the file to the server
var reader = new FileReader();
// once the file reader has loaded the file contents
reader.onload = function() {
// get the dataURL of the file, a base 64 decoded string
var dataURL = reader.result;
//save the file to the server
var req = Ajax("savepng.php", "POST", "file=" + ofName + "&content=" + dataURL);
if (req.status == 200) {
// return the full path of the saved file
fName = req.responseText;
$('#pgAddBookImagePreview').attr('src', dataURL);
//show a toast message that the file has been uploaded
toastr.success(ofName + ' file uploaded.', 'Library');
} else {
// return a blank file name
fName = '';
//show a toast message that the file has not been uploaded
toastr.error(ofName + ' file NOT uploaded.', 'Library');
}
//set the file name to store later
$('#pgAddBookBookImage').data('file', fName);
};
// start reading the file contents
reader.readAsDataURL(fName);
} else {
}
$.mobile.loading("hide");
});
//upload a file to server once onchange is detected
$('#pgEditBookBookImage').on('change', function () {
$.mobile.loading("show", {
text: "Loading file...",
textVisible: true
});
//check to see if we have a file
var fName = document.getElementById('pgEditBookBookImage').files[0];
if (typeof (fName) === 'undefined') fName = '';
if (Len(fName) > 0) {
//get the file name
var ofName = fName.name;
//get the file extension
var ofExt = Mid(ofName, InStrRev(ofName, '.'));
// open a file reader to upload the file to the server
var reader = new FileReader();
// once the file reader has loaded the file contents
reader.onload = function() {
// get the dataURL of the file, a base 64 decoded string
var dataURL = reader.result;
//save the file to the server
var req = Ajax("savepng.php", "POST", "file=" + ofName + "&content=" + dataURL);
if (req.status == 200) {
// return the full path of the saved file
fName = req.responseText;
$('#pgEditBookImagePreview').attr('src', dataURL);
//show a toast message that the file has been uploaded
toastr.success(ofName + ' file uploaded.', 'Library');
} else {
// return a blank file name
fName = '';
//show a toast message that the file has not been uploaded
toastr.error(ofName + ' file NOT uploaded.', 'Library');
}
//set the file name to store later
$('#pgEditBookBookImage').data('file', fName);
};
// start reading the file contents
reader.readAsDataURL(fName);
} else {
}
$.mobile.loading("hide");
});
//***** Add Page *****
// code to run when back button is clicked on the add record page.
// Back click event from Add Page
$('#pgAddBookBack').on('click', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
//which page are we coming from, if from sign in go back to it
var pgFrom = $('#pgAddBook').data('from');
switch (pgFrom) {
case "pgSignIn":
$.mobile.changePage('#pgSignIn', {transition: pgtransition});
break;
default:
// go back to the records listing screen
$.mobile.changePage('#pgBook', {transition: pgtransition});
}
});
// Back click event from Add Multiple Page
$('#pgAddMultBookBack').on('click', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
$.mobile.changePage('#pgBook', {transition: pgtransition});
});
// code to run when the Save button is clicked on Add page.
// Save click event on Add page
$('#pgAddBookSave').on('click', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
//get form contents into an object
var BookRec = pgAddBookGetRec();
//save object to JSON
app.addBook(BookRec);
});
// Save click event on Add Multiple page
$('#pgAddMultBookSave').on('click', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
//get form contents of multi entries
var multiTitle = $('#pgAddMultBookTitle').val().trim();
//save multi Title to JSON
app.addMultBook(multiTitle);
});
// code to run when a get location button is clicked on the Add page.
//listview item click eventt.
$(document).on('click', '#pgAddBookRightPnlLV a', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
//get href of selected listview item and cleanse it
var href = $(this).data('id');
href = href.split(' ').join('-');
//read record from JSON and update screen.
app.pgAddBookeditBook(href);
});
//***** Add Page - End *****
//***** Listing Page *****
// code to run when a listview item is clicked.
//listview item click eventt.
$(document).on('click', '#pgBookList a', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
//get href of selected listview item and cleanse it
var href = $(this).data('id');
href = href.split(' ').join('-');
//save id of record to edit;
$('#pgEditBook').data('id', href);
//change page to edit page.
$.mobile.changePage('#pgEditBook', {transition: pgtransition});
});
// code to run when New button on records listing is clicked.
// New button click on records listing page
$('#pgBookNew').on('click', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
//we are accessing a new record from records listing
$('#pgAddBook').data('from', 'pgBook');
// show the active and user type elements
$('#pgAddBookheader h1').text('Library > Add Book');
$('#pgAddBookMenu').show();
// move to the add page screen
$.mobile.changePage('#pgAddBook', {transition: pgtransition});
});
//***** Listing Page - End *****
//***** Edit Page *****
// code to run when the back button of the Edit Page is clicked.
// Back click event on Edit page
$('#pgEditBookBack').on('click', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
// go back to the listing screen
$.mobile.changePage('#pgBook', {transition: pgtransition});
});
// code to run when the Update button is clicked in the Edit Page.
// Update click event on Edit Page
$('#pgEditBookUpdate').on('click', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
//get contents of Edit page controls
var BookRec = pgEditBookGetRec();
//save updated records to JSON
app.updateBook(BookRec);
});
// code to run when the Delete button is clicked in the Edit Page.
// delete button on Edit Page
$('#pgEditBookDelete').on('click', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
//read the record key from form control
var Title = $('#pgEditBookTitle').val().trim();
//show a confirm message box
$('#msgboxheader h1').text('Confirm Delete');
$('#msgboxtitle').text(Title.split('-').join(' '));
$('#msgboxprompt').text('Are you sure that you want to delete this book? This action cannot be undone.');
$('#msgboxyes').data('method', 'deleteBook');
$('#msgboxno').data('method', 'editBook');
$('#msgboxyes').data('id', Title.split(' ').join('-'));
$('#msgboxno').data('id', Title.split(' ').join('-'));
$('#msgboxyes').data('topage', 'pgEditBook');
$('#msgboxno').data('topage', 'pgEditBook');
$.mobile.changePage('#msgbox', {transition: 'pop'});
});
//listview item click eventt.
$(document).on('click', '#pgEditBookRightPnlLV a', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
//get href of selected listview item and cleanse it
var href = $(this).data('id');
href = href.split(' ').join('-');
//read record from JSON and update screen.
app.pgEditBookeditBook(href);
});
//***** Edit Page - End *****
//***** Report Page *****
//back button on Report page
// Back click event on Report page
$('#pgRptBookBack').on('click', function (e) {
e.preventDefault();
e.stopImmediatePropagation();
var pgFrom = $('#pgRptBookBack').data('from');
switch (pgFrom) {
case "pgAddBook":
$.mobile.changePage('#pgBook', {transition: pgtransition});
break;
case "pgEditBook":
$.mobile.changePage('#pgBook', {transition: pgtransition});
break;
case "pgBook":
$.mobile.changePage('#pgBook', {transition: pgtransition});
break;
default:
// go back to the listing screen
$.mobile.changePage('#pgReports', {transition: pgtransition});
}
});//***** Report Page - End *****
//Our events are now fully defined.
};
// this defines methods/procedures accessed by our events.
// get existing records from JSON
//get all existing records from JSON
app.getBook = function () {
$.mobile.loading("show", {
text: "Getting records...",
textVisible: true
});
// get Book records
var BookObj = {};
var icnt, itot;
//get the list of files under directory
var req = Ajax("jsonGetBook.php");
if (req.status == 200) {
var recFiles = req.responseText;
recFiles = recFiles.split('\n');
itot = recFiles.length - 1;
for (icnt = 0; icnt <= itot; icnt++) {
var recFile = recFiles[icnt];
if (recFile.length > 0) {
// read the file contents and display them
var req = Ajax("jsonGetBook.php?file=" + encodeURIComponent(recFile));
if (req.status == 200) {
// parse string to json object
var record = JSON.parse(req.responseText);
var Title = record.Title;
record.Title = record.Title.split('-').join(' ');
BookObj[Title] = record;
}
}
}
//sort the objects
var keys = Object.keys(BookObj);
keys.sort();
var sortedObject = Object();
var i;
for (i in keys) {
key = keys[i];
sortedObject[key] = BookObj[key];
}
BookObj = sortedObject;
return BookObj;
}
$.mobile.loading("hide");
};
//display records in table during runtime.
app.BookRpt = function () {
$.mobile.loading("show", {
text: "Loading report...",
textVisible: true
});
//clear the table and leave the header
$('#RptBook tbody tr').remove();
// get Book records.
var BookObj = app.getBook();
// create an empty string to contain all rows of the table
var newrows = '';
// make sure your iterators are properly scoped
var n;
// loop over records and create a new row for each
// and append the newrows with each table row.
for (n in BookObj) {
//get the record details
var BookRec = BookObj[n];
//clean primary keys
n = n.split('-').join(' ');
//create each row
var eachrow = '<tr>';
eachrow += '<td class="ui-body-c">' + n + '</td>';
eachrow += '<td class="ui-body-c">' + BookRec.Author + '</td>';
eachrow += '<td class="ui-body-c">' + BookRec.ISBN + '</td>';
eachrow += '<td class="ui-body-c">' + BookRec.Condition + '</td>';
eachrow += '<td class="ui-body-c">' + BookRec.Price + '</td>';
eachrow += '<td class="ui-body-c"><img src=' + BookRec.BookImage + ' alt="" height=100px width=100px></img>' + '</td>';
eachrow += '</tr>';
//append each row to the newrows variable;
newrows += eachrow;
}
// update the table
$('#RptBook').append(newrows);
// refresh the table with new details
$('#RptBook').table('refresh');
$.mobile.loading("hide");
};
// save the defined Add page object to JSON
// add a new record to server storage.
app.addBook = function (BookRec) {
$.mobile.loading("show", {
text: "Creating record...",
textVisible: true
});
// define a record object to store the current details
var Title = BookRec.Title;
// cleanse the record key of spaces.
Title = Title.split(' ').join('-');
BookRec.Title = Title;
//convert record to json to write to server
var recordJSON = JSON.stringify(BookRec);
// save the data to a server file, use the post method as it has 8MB minimum data limitation
var req = Ajax("jsonSaveBook.php", "POST" , recordJSON);
if (req.status == 200) {
//show a toast message that the record has been saved
toastr.success('Book record saved.', 'Library');
//find which page are we coming from, if from sign in go back to it
var pgFrom = $('#pgAddBook').data('from');
switch (pgFrom) {
case "pgSignIn":
$.mobile.changePage('#pgSignIn', {transition: pgtransition});
break;
default:
// clear the edit page form fields
pgAddBookClear();
//stay in the same page to add more records
}
} else {
//show a toast message that the record has not been saved
toastr.error('Book record not saved. Please try again.', 'Library');
}
$.mobile.loading("hide");
};
// add new records to server storage.
app.addMultBook = function (multiTitle) {
$.mobile.loading("show", {
text: "Creating records...",
textVisible: true
});
// define a record object to store the current details
//loop through each record and add it to the database
var TitleCnt, TitleTot, TitleItems, TitleItem, Title, BookRec;
//split the items as they are delimited by ;
TitleItems = Split(multiTitle, ";");
TitleTot = TitleItems.length - 1;
for (TitleCnt = 0; TitleCnt <= TitleTot; TitleCnt++) {
//get each record being added
TitleItem = TitleItems[TitleCnt];
TitleItem = TitleItem.trim();
if (Len(TitleItem) > 0) {
// cleanse the record key of spaces.
TitleItem = TitleItem.split(' ').join('-');
Title = TitleItem;
BookRec = {};
BookRec.Title = TitleItem;
// update JSON object with new record.
//convert record to json to write to server
var recordJSON = JSON.stringify(BookRec);
// save the data to a server file, use the post method as it has 8MB minimum data limitation
var req = Ajax("jsonSaveBook.php", "POST" , recordJSON);
}
}
$('#pgAddMultBookTitle').val('');
$.mobile.changePage('#pgBook', {transition: pgtransition});
$.mobile.loading("hide");
};
// save the defined Edit page object to JSON
// update an existing record and save to server.
app.updateBook = function (BookRec) {
$.mobile.loading("show", {
text: "Updating record...",
textVisible: true
});
// define a record object to store the current details
var Title = BookRec.Title;
// cleanse the record key of spaces.
Title = Title.split(' ').join('-');
BookRec.Title = Title;
//convert record to json to write to server
var recordJSON = JSON.stringify(BookRec);
var req = Ajax("jsonSaveBook.php", "POST" , recordJSON);
if (req.status == 200) {
//show a toast message that the record has been saved
toastr.success('Book record updated.', 'Library');
// clear the edit page form fields
pgEditBookClear();
// show the records listing page.
$.mobile.changePage('#pgBook', {transition: pgtransition});
} else {
//show a toast message that the record has not been saved
toastr.error('Book record not updated. Please try again.', 'Library');
}
$.mobile.loading("hide");
};
// delete record from JSON
//delete a record from JSON using record key
app.deleteBook = function (Title) {
$.mobile.loading("show", {
text: "Deleting record...",
textVisible: true
});
Title = Title.split(' ').join('-');
var req = Ajax("jsonDeleteBook.php/?Title=" + Title);
if (req.status == 200) {
toastr.success('Book record deleted.', 'Library');
} else {
toastr.error('Book record not deleted.', 'Library');
}
// show the page to display after a record is deleted, this case listing page
$.mobile.changePage('#pgBook', {transition: pgtransition});
$.mobile.loading("hide");
};
// display existing records in listview of Records listing.
//***** List Page *****
//display records in listview during runtime.
app.displayBook = function (BookObj) {
$.mobile.loading("show", {
text: "Displaying records...",
textVisible: true
});
// create an empty string to contain html
var html = '';
// make sure your iterators are properly scoped
var n;
// loop over records and create a new list item for each
//append the html to store the listitems.
for (n in BookObj) {
//get the record details
var BookRec = BookObj[n];
// clean the primary key
var pkey = BookRec.Title;
pkey = pkey.split('-').join(' ');
BookRec.Title = pkey;
//define a new line from what we have defined
var nItem = BookLi;
nItem = nItem.replace(/Z2/g,n);
//update the title to display, this might be multi fields
var nTitle = '';
//assign cleaned title
nTitle = n.split('-').join(' ');
//replace the title;
nItem = nItem.replace(/Z1/g,nTitle);
//there is a count bubble, update list item
var nCountBubble = '';
nCountBubble += BookRec.Price;
//replace the countbubble
nItem = nItem.replace(/COUNTBUBBLE/g,nCountBubble);
//there is a description, update the list item
var nDescription = '';
nDescription += BookRec.Author;
nDescription += ', ';
nDescription += BookRec.ISBN;
//replace the description;
nItem = nItem.replace(/DESCRIPTION/g,nDescription);
//there is side content, update the list item
var nSideContent = '';
nSideContent += BookRec.Condition;
//replace the description;
nItem = nItem.replace(/SIDECONTENT/g,nSideContent);
//there is a thumbnail for the list item, update the list item
var nThumbNail = '';
nThumbNail += BookRec.BookImage;
//replace the thumbnail;
nItem = nItem.replace(/THUMBNAIL/g,nThumbNail);
html += nItem;
}
//update the listview with the newly defined html structure.
$('#pgBookList').html(BookHdr + html).listview('refresh');
$.mobile.loading("hide");
};
// check JSON for Records. This initializes JSON if there are no records
//display records if they exist or tell user no records exist.
app.checkForBookStorage = function () {
$.mobile.loading("show", {
text: "Checking storage...",
textVisible: true
});
//get records from JSON.
var BookObj = app.getBook();
// are there existing Book records?
if (!$.isEmptyObject(BookObj)) {
// yes there are. pass them off to be displayed
app.displayBook(BookObj);
} else {
// nope, just show the placeholder
$('#pgBookList').html(BookHdr + noBook).listview('refresh');
}
$.mobile.loading("hide");
};
// ***** Edit Page *****
// clear the contents of the Edit Page controls
//clear the form controls for data entry
function pgEditBookClear() {
$('#pgEditBookTitle').val('');
$('#pgEditBookAuthor').val('');
$('#pgEditBookISBN').val('');
$('input[name=pgEditBookCondition]').prop('checked',false).checkboxradio('refresh');
$('#pgEditBookPrice').val('');
$('#pgEditBookBookImage').val('');
$('#pgEditBookImagePreview').attr('src', '');
$('#pgEditBookImagePreview').removeAttr('src');
}
// get the contents of the edit screen controls and store them in an object.
//get the record to be saved and put it in a record array
//read contents of each form input
function pgEditBookGetRec() {
//define the new record
var BookRec = {};
BookRec.Title = $('#pgEditBookTitle').val().trim();
BookRec.Author = $('#pgEditBookAuthor').val().trim();
BookRec.ISBN = $('#pgEditBookISBN').val().trim();
BookRec.Condition = $('input:radio[name=pgEditBookCondition]:checked').val();
BookRec.Price = $('#pgEditBookPrice').val().trim();
BookRec.BookImage = $('#pgEditBookBookImage').data('file');
BookRec.ImagePreview = $('#pgEditBookImagePreview').attr('src');
return BookRec;
}
// display content of selected record on Edit Page
//read record from JSON and display it on edit page.
app.editBook = function (Title) {
$.mobile.loading("show", {
text: "Reading record...",
textVisible: true
});
// clear the form fields
pgEditBookClear();
var BookRec = {};
// get Book record.
Title = Title.split(' ').join('-');
Title += '.json';
var req = Ajax("jsonGetBook.php?file=" + encodeURIComponent(Title));
if (req.status == 200) {
// parse string to json object
BookRec = JSON.parse(req.responseText);
}
//make the record key read only
$('#pgEditBookTitle').attr('readonly', 'readonly');
//ensure the record key control cannot be clearable
$('#pgEditBookTitle').attr('data-clear-btn', 'false');
//update each control in the Edit page
//clean the primary key
var pkey = BookRec.Title;
pkey = pkey.split('-').join(' ');
BookRec.Title = pkey;
$('#pgEditBookTitle').val(BookRec.Title);
$('#pgEditBookAuthor').val(BookRec.Author);
$('#pgEditBookISBN').val(BookRec.ISBN);
//use the actual value of the radio button to set it
var opts = 'pgEditBookCondition' + BookRec.Condition;
$('#' + opts).prop('checked', true);
$('#' + opts).checkboxradio('refresh');
$('#pgEditBookPrice').val(BookRec.Price);
//save the previously saved file to data attribute
//we can later refer to this when saving if no new file is provided.
$('#pgEditBookBookImage').data('file', BookRec.BookImage);
$('#pgEditBookImagePreview').attr('src', BookRec.ImagePreview);
$.mobile.loading("hide");
};
//display records in listview during runtime on right panel.
app.pgEditBookdisplayBookR = function (BookObj) {
$.mobile.loading("show", {
text: "Displaying records...",
textVisible: true
});
// create an empty string to contain html
var html = '';
// make sure your iterators are properly scoped
var n;
// loop over records and create a new list item for each
//append the html to store the listitems.
for (n in BookObj) {
//get the record details
var BookRec = BookObj[n];
// clean the primary key
var pkey = BookRec.Title;
pkey = pkey.split('-').join(' ');
BookRec.Title = pkey;
//define a new line from what we have defined
var nItem = BookLiRi;
nItem = nItem.replace(/Z2/g,n);
//update the title to display, this might be multi fields
var nTitle = '';
//assign cleaned title
nTitle = n.split('-').join(' ');
//replace the title;
nItem = nItem.replace(/Z1/g,nTitle);
html += nItem;
}
//update the listview with the newly defined html structure.
$('#pgEditBookRightPnlLV').html(html).listview('refresh');
$.mobile.loading("hide");
};
//display records if they exist or tell user no records exist.
app.pgEditBookcheckForBookStorageR = function () {
$.mobile.loading("show", {
text: "Checking storage...",
textVisible: true
});
//get records from JSON.
var BookObj = app.getBook();
// are there existing Book records?
if (!$.isEmptyObject(BookObj)) {
// yes there are. pass them off to be displayed
app.pgEditBookdisplayBookR(BookObj);
} else {
// nope, just show the placeholder
$('#pgEditBookRightPnlLV').html(BookHdr + noBook).listview('refresh');
}
$.mobile.loading("hide");
};
//read record from JSON and display it on edit page.
app.pgEditBookeditBook = function (Title) {
$.mobile.loading("show", {
text: "Reading record...",
textVisible: true
});
// clear the form fields
pgEditBookClear();
var BookRec = {};
// get Book record.
Title = Title.split(' ').join('-');
Title += '.json';
var req = Ajax("jsonGetBook.php?file=" + encodeURIComponent(Title));
if (req.status == 200) {
// parse string to json object
BookRec = JSON.parse(req.responseText);
}
//make the record key read only
$('#pgEditBookTitle').attr('readonly', 'readonly');
//ensure the record key control cannot be clearable
$('#pgEditBookTitle').attr('data-clear-btn', 'false');
//update each control in the Edit page
//clean the primary key
var pkey = BookRec.Title;
pkey = pkey.split('-').join(' ');
BookRec.Title = pkey;
$('#pgEditBookTitle').val(BookRec.Title);
$('#pgEditBookAuthor').val(BookRec.Author);
$('#pgEditBookISBN').val(BookRec.ISBN);
//use the actual value of the radio button to set it
var opts = 'pgEditBookCondition' + BookRec.Condition;
$('#' + opts).prop('checked', true);
$('#' + opts).checkboxradio('refresh');
$('#pgEditBookPrice').val(BookRec.Price);
//save the previously saved file to data attribute
//we can later refer to this when saving if no new file is provided.
$('#pgEditBookBookImage').data('file', BookRec.BookImage);
$('#pgEditBookImagePreview').attr('src', BookRec.ImagePreview);
$.mobile.loading("hide");
};
// ***** Add Page *****
//display records in listview during runtime on right panel.
app.pgAddBookdisplayBookR = function (BookObj) {
$.mobile.loading("show", {
text: "Displaying records...",
textVisible: true
});
// create an empty string to contain html
var html = '';
// make sure your iterators are properly scoped
var n;
// loop over records and create a new list item for each
//append the html to store the listitems.
for (n in BookObj) {
//get the record details
var BookRec = BookObj[n];
// clean the primary key
var pkey = BookRec.Title;
pkey = pkey.split('-').join(' ');
BookRec.Title = pkey;
//define a new line from what we have defined
var nItem = BookLiRi;
nItem = nItem.replace(/Z2/g,n);
//update the title to display, this might be multi fields
var nTitle = '';
//assign cleaned title
nTitle = n.split('-').join(' ');
//replace the title;
nItem = nItem.replace(/Z1/g,nTitle);
html += nItem;
}
//update the listview with the newly defined html structure.
$('#pgAddBookRightPnlLV').html(html).listview('refresh');
$.mobile.loading("hide");
};
//display records if they exist or tell user no records exist.
app.pgAddBookcheckForBookStorageR = function () {
$.mobile.loading("show", {
text: "Checking storage...",
textVisible: true
});
//get records from JSON.
var BookObj = app.getBook();
// are there existing Book records?
if (!$.isEmptyObject(BookObj)) {
// yes there are. pass them off to be displayed
app.pgAddBookdisplayBookR(BookObj);
} else {
// nope, just show the placeholder
$('#pgAddBookRightPnlLV').html(BookHdr + noBook).listview('refresh');
}
$.mobile.loading("hide");
};
//read record from JSON and display it on edit page.
app.pgAddBookeditBook = function (Title) {
$.mobile.loading("show", {
text: "Reading record...",
textVisible: true
});
// clear the form fields
pgAddBookClear();
var BookRec = {};
// get Book record.
Title = Title.split(' ').join('-');
Title += '.json';
var req = Ajax("jsonGetBook.php?file=" + encodeURIComponent(Title));
if (req.status == 200) {
// parse string to json object
BookRec = JSON.parse(req.responseText);
}
//make the record key read only
$('#pgAddBookTitle').attr('readonly', 'readonly');
//ensure the record key control cannot be clearable
$('#pgAddBookTitle').attr('data-clear-btn', 'false');
//update each control in the Edit page
//clean the primary key
var pkey = BookRec.Title;
pkey = pkey.split('-').join(' ');
BookRec.Title = pkey;
$('#pgAddBookTitle').val(BookRec.Title);
$('#pgAddBookAuthor').val(BookRec.Author);
$('#pgAddBookISBN').val(BookRec.ISBN);
//use the actual value of the radio button to set it
var opts = 'pgAddBookCondition' + BookRec.Condition;
$('#' + opts).prop('checked', true);
$('#' + opts).checkboxradio('refresh');
$('#pgAddBookPrice').val(BookRec.Price);
//save the previously saved file to data attribute
//we can later refer to this when saving if no new file is provided.
$('#pgAddBookBookImage').data('file', BookRec.BookImage);
$('#pgAddBookImagePreview').attr('src', BookRec.ImagePreview);
$.mobile.loading("hide");
};
// get the contents of the add screen controls and store them in an object.
//get the record to be saved and put it in a record array
//read contents of each form input
function pgAddBookGetRec() {
//define the new record
var BookRec = {};
BookRec.Title = $('#pgAddBookTitle').val().trim();
BookRec.Author = $('#pgAddBookAuthor').val().trim();
BookRec.ISBN = $('#pgAddBookISBN').val().trim();
BookRec.Condition = $('input:radio[name=pgAddBookCondition]:checked').val();
BookRec.Price = $('#pgAddBookPrice').val().trim();
BookRec.BookImage = $('#pgAddBookBookImage').data('file');
BookRec.ImagePreview = $('#pgAddBookImagePreview').attr('src');
return BookRec;
}
// clear the contents of the Add page controls
//clear the form controls for data entry
function pgAddBookClear() {
$('#pgAddBookTitle').val('');
$('#pgAddBookAuthor').val('');
$('#pgAddBookISBN').val('');
$('input[name=pgAddBookCondition]').prop('checked',false).checkboxradio('refresh');
$('#pgAddBookPrice').val('');
$('#pgAddBookBookImage').val('');
$('#pgAddBookImagePreview').attr('src', '');
$('#pgAddBookImagePreview').removeAttr('src');
}
//get all existing Book-BookImage
app.getBookBookImage = function () {
// get Book records
var BookObj = app.getBook();
// loop through each record and get the fields we want
// make sure your iterators are properly scoped
var n;
var dsFields = [];
for (n in BookObj) {
//get the record details
var BookRec = BookObj[n];
var dsField = BookRec.BookImage;
dsFields.push(dsField);
}
return dsFields;
};

app.init();
})(Library);
});
