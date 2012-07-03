/// <reference path="../../../Scripts/jquery-1.7.1-vsdoc.js" />
/// <reference path="../../../Scripts/jquery-ui-1.8.16.js" />
/// <reference path="../../../Scripts/jQuery.Form/jquery.form.js" />


$(function ()
{
    $("#submit-btn").button();

    $("#upload").submit(function ()
    {
        $(this).ajaxSubmit({
            success: function (responseText, statusText)
            {
                var data = $.parseJSON(responseText);
                $("#exif-container").empty().append(
                    $("<div>")
                        .append($("<div>").addClass("exif-label").text("Filename"))
                        .append($("<div>").addClass("exif-data").text(data.FileName))
                );
            }
        });
        return false;
    });
});