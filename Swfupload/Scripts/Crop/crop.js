/// <reference path="../../../Scripts/jquery-1.7.2-vsdoc.js" />
/// <reference path="../../../Scripts/jquery-ui-1.8.19.js" />
/// <reference path="../../../Scripts/jcrop/jquery.Jcrop.js" />

$(function () {
    var imgDim = { height: 0, width: 0 };
    var dlg = new CropDialog("#dlg-container");
    $(".img-container").addClass("loading");
    $("img").live("load", function (event) {
        $(this).hide();
        $(this).fadeIn();
        $(this).closest(".img-container").removeClass("loading");
    })
    .live("dragstart", function (event) { event.preventDefault(); return false; });

    $("#edit-btn").button().on("click", { dlg: dlg }, dlg.open);
});

function CropDialog(sel)
{
    var dlg = this;
    this.imgDim = { height: 0, width: 0 };
    this.dragStarted = false;
    this.offset = { x: 0, y: 0 };
    this.$cropBox = $("<div>").attr("id", "crop-box").css({ "position": "absolute" });
    this.cropBox = new CropBox();
    this.jcrop = {};
    this.filename = "";
    this.$dlg = $(sel);
    this.$dlg.dialog({
        modal: true,
        autoOpen: false,
        resizable: false,
        buttons: {
            "OK": dlg.dlgHandlerOK,
            "Reset": dlg.dlgHandlerReset,
            "Cancel": dlg.dlgHandlerCancel
        }
    }).data("dlg", dlg);

    $(".img-container")
        .on("click", function (event)
        {
            var $container = $(this);
            var index = $container.index();
            $(".img-selected").removeClass("img-selected");
            $container.addClass("img-selected");

            // Create a new img element in memory to get the natural image dimensions
            // using a the load event, otherwise, we get the img rendered size.
            var img = $(this).find("img");
            $("<img>")
                .attr("src", img.attr("src"))
                .on("load", { dlg: dlg }, function (event)
                {
                    event.data.dlg.imgDim.height = this.height;
                    event.data.dlg.imgDim.width = this.width;
                });
        })
        .on("mouseover", function (event)
        {
            $(this).css("cursor", "pointer");
        });
}

CropDialog.prototype.open = function (event)
{
    var dlg = event.data.dlg;
    var $dlg = dlg.$dlg;
    var $img = $(".img-selected img").first();
    var src = $img.attr("src");
    dlg.filename = $img.attr("alt");
    $dlg.dialog({
        title: "Crop Tool - " + dlg.filename,
        minWidth: dlg.imgDim.width + 32,
        minHeight: dlg.imgDim.height + 10,
        scrollBars: false
    });
    $("#img-canvas").empty()
        .append(
        $("<img>")
            .attr("id", "img-cropbox")
            .attr("src", src)
            .height(dlg.imgDim.height)
            .width(dlg.imgDim.width)
    //            .css({ "cursor": "crosshair" })
    //            .on("startdrag", function (event) { event.preventDefault(); return false; })
    //            .on("mousedown", { dlg: dlg }, dlg.startDrag)
        )
        .css({ "height": dlg.imgDim.height, "width": dlg.imgDim.width });
    $dlg.dialog("open");
    $("#img-cropbox").Jcrop({
        onChange: function (c) { dlg.$dlg.dialog("option", "title", "Crop Tool - " + dlg.filename + " (w: " + c.w + ", h: " + c.h + ")"); }
    },
    function ()
    {
        dlg.jcrop = this;
    });
}

CropDialog.prototype.dlgHandlerOK = function ()
{
    var dlg = $(this).data("dlg");

    var c = dlg.jcrop.tellSelect();

    $.post("Crop/Crop", { x: c.x, y: c.y, h: c.h, w: c.w }, function (data)
    {
        console.log(data);
        dlg.$dlg.dialog("close");
    });
}

CropDialog.prototype.dlgHandlerReset = function ()
{
    //var origin = new Coordinate(0, 0);
    var dlg = $(this).data("dlg");
    dlg.jcrop.release();
    dlg.$dlg.dialog("option", "title", "Crop Tool - " + dlg.filename);
}

CropDialog.prototype.dlgHandlerCancel = function ()
{
    $(this).dialog("close");
}

CropDialog.prototype.startDrag = function (event)
{
    var dlg = event.data.dlg;
    dlg.dragStarted = true;
    var position = $(this).position();
    var offset = $(this).offset();
    var x = Math.floor(event.pageX - offset.left + position.left);
    var y = Math.floor(event.pageY - offset.top + position.top);
    dlg.offset.x = position.left;  // compensation so our coordiates zero out relative to the image
    dlg.offset.y = position.top;
    var start = new Coordinate(x - offset.x, y - offset.y);
    dlg.$cropBox
        .height(100)
        .width(100)
        .css({ "position": "absolute", "top": y + "px", "left": x + "px" });
    $("#img-canvas").append(dlg.$cropBox);

    console.log(start);
}

function Coordinate(x, y)
{
    this.x = x;
    this.y = y;
}

function CropBox()
{
    this.origin = { x: 0, y: 0 };
    this.height = 0;
    this.width = 0;
}

CropBox.prototype.setOrigin = function (coordinate)
{
    this.origin.x = coordinate.x;
    this.origin.y = coordinate.y;
}
