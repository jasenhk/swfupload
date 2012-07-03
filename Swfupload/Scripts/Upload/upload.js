/// <reference path="../../../Scripts/swfupload/swfupload.js" />
/// <reference path="../../../Scripts/swfupload/plugins/swfupload.queue.js" />
/// <reference path="../../../Scripts/jquery-1.7-vsdoc.js" />
/// <reference path="../../../Scripts/jquery-ui-1.8.16.js" />

function UploadPage()
{
    var swfu = {};
    var dlg = {};
    var swfu_placeholder_id = {};
    var resizeSettings = { width: 1000, height: 1000, quality: 100, allowEnlargement: false };
}

function setFilesQueuedMsg(count)
{
    $("#swfu-msg").empty().text("Files Queued: " + count);
}

function fileDequeued(event)
{
    event.data.swfu.cancelUpload(event.data.fileId);
    var stats = event.data.swfu.getStats();
    $(".file-container").find("#" + event.data.fileId).addClass("file-canceled")
        .fadeOut("fast", function () { $(this).remove(); });
    setFilesQueuedMsg(stats.files_queued);
    //console.log(event.data.swfu);
}

function fileQueued(swfu, file)
{
    var id = file.id;
    var index = file.number;
    var name = file.name;
    var size = file.size;
    var type = file.type;
    var creationdate = file.creationdate;
    var modificationdate = file.modificationdate;
    var filestatus = file.filestatus;  // SWFUpload.FILE_STATUS
    
    var fileItem = $("<div>").attr("id", file.id).addClass("file-item");
    fileItem.append($("<span>").addClass("file-item-name").text((file.name).toLowerCase()));
    fileItem.append($("<span>").addClass("file-item-size").text((file.size / (1024 * 1024)).toFixed(2) + " MB"));
    fileItem.append($("<div>").attr("id", "progress-" + file.id).addClass("file-item-progress").progressbar());
    fileItem.append($("<span>").addClass("file-item-msg"));
    fileItem.append($("<span>")
        .data("file-id", file.id)
        .addClass("ui-icon ui-icon-close")
        .css({ "float": "right", "cursor": "pointer" })
        .on("click", { swfu: swfu, fileId: file.id }, fileDequeued)
    );
    $(".file-container").append(fileItem);

    swfu.addFileParam(file.id, "id", file.id);
}

function fileQueueError(swfu, file, error, data)
{
    var msg = "";
    if (error === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED)
    {
        msg = "Attempted to queue too many files. " + (data === 0 ? "You have reached the upload limit." : "You may select " + (data > 1 ? "up to " + data + " files." : "one file."));
    }
    else
    {
        switch (error)
        {
            case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                msg = "Too many files selected.";
                break;
            case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                msg = "File size exceeds limit of " + swfu.settings.file_size_limit + ".";
                break;
            case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                msg = "Attempting to queue a zero byte file.";
                break;
            case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                msg = "Invalid file type.";
                break;
            default:
                msg = "Error queueing files";
                break;
        }
    }
    $("#swfu-msg").empty().text(msg);
}

function flashPreload()
{
    $("#dlg-flash-loading").show();
    $("#dlg-flash-failed").hide();
}

function flashLoaded()
{
    $("#dlg-flash-loading").hide();
    $("#dlg-flash-failed").hide();
}

function flashFailed()
{
    $("#dlg-flash-loading").hide();
    $("#dlg-flash-failed").show();
}

function fileDialogComplete(swfu, selected, queued, total)
{
    var stats = swfu.getStats();
    var in_progress = stats.in_progress;
    var files_queued = stats.files_queued;
    var successful_uploads = stats.successful_uploads;
    var upload_errors = stats.upload_errors;
    var upload_cancelled = stats.upload_cancelled;
    var queue_errors = stats.queue_errors;
    if (stats.files_queued > 0) { setFilesQueuedMsg(stats.files_queued); }
}

function uploadStart(page, file)
{
    $("#" + file.id + " > .file-item-msg").text("Uploading...");
    $("#progress-" + file.id).progressbar("value", 0);
    page.swfu.addFileParam(file.id, "id", file.id);
    return true;
}

function uploadProgress(file, bytesComplete, totalBytes)
{
    var percent = Math.floor(bytesComplete / totalBytes * 100);
    $("#" + file.id + " > .file-item-msg").text("Uploading... " + percent + "% Complete");
    $("#progress-" + file.id).progressbar("value", percent);
}

function uploadSuccess(file, data, response)
{
    var result = $.parseJSON(data);
    var filename = result.FileName;
    $("#" + file.id + " > .file-item-msg").text("Complete").get(0).scrollIntoView();
}

function uploadComplete(page, file)
{
    $("#progress-" + file.id).progressbar("value", 100);

    // if using the startResizedUpload() with the queue plugin
    // we must override the default handler here
    var continueUpload;
    if (file.fileStatus === SWFUpload.FILE_STATUS.COMPLETE)
    {
        page.swfu.queueSettings.queue_upload.count++;
    }
    if (file.fileStatus === SWFUpload.FILE_STATUS.QUEUED)
    {
        continueUpload = false;
    }
    else
    {
        continueUpload = true;
    }
    if (continueUpload)
    {
        var stats = page.swfu.getStats();
        if (stats.files_queued > 0 && page.swfu.queueSettings.queue_cancelled === false)
        {
            if (page.resizeSettings.width == '0')
            {
                page.swfu.startUpload()
            }
            else
            {
                page.swfu.startResizeUpload(page.swfu.getQueueFile(0).id, page.resizeSettings.width, page.resizeSettings.height, SWFUpload.RESIZE_ENCODING.JPEG, page.swfu.resizeSettings.quality, page.swfu.resizeSettings.allowEnlargement);
            }
        }
        else if (page.swfu.queueSettings.queue_cancelled_flag === false)
        {
            page.swfu.queueEvent("queue_complete_handler", [page.swfu.queueSettings.queue_upload_count]);
            page.swfu.queueSettings.queue_upload_count = 0;
        }
        else
        {
            page.swfu.queueSettings.queue_cancelled_flag = false;
            page.swfu.queueSettings.queue_upload_count = 0;
        }
    }
    return false;
}

function uploadError(file, error, message)
{
    $("#" + file.id + " > .file-item-msg").text("Error: " + error);
}

function queueComplete(page, filesUploaded)
{
    $("#swfu-msg").empty().text("Files Uploaded: " + filesUploaded);
    if (page.swfu.destroy()) { $(".dlg-content").prepend($('<span id="' + page.swfu_placeholder_id + '"></span>')); }
    page.dlg.dialog("close");
}

$(function ()
{
    var page = new UploadPage();
    page.dlg = $("#fileUploadDlg");
    page.swfu_placeholder_id = "swfu_placeholder";
    var btnDim = { height: 24, width: 100 };
    var sessionId = $("#sessionId").val();

    //$("#btnUpload").button();

    $("#safari-submit").button();
    $("#dlgOpenBtn").button().on("click", { page: page }, function (event) { event.data.page.dlg.dialog("open"); });

    page.dlg.on("dialogopen", { page: page }, function (event, ui)
    {
        var page = event.data.page;
        page.swfu = new SWFUpload({
            upload_url: "/Upload/Upload?-flashSession=1",
            flash_url: "/Content/flash/swfupload.swf",
            file_post_name: "fileUpload",
            file_size_limit: "4 MB",
            file_upload_limit: 30,
            file_types: "*.jpg;*.jpeg;*.gif;*.bmp;*.png;",
            file_types_description: "Image Files",
            button_placeholder_id: page.swfu_placeholder_id,
            button_width: btnDim.width,
            button_height: btnDim.height,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            button_cursor: SWFUpload.CURSOR.HAND,
            post_params: { "sessionId": sessionId },
            swfupload_preload_handler: flashPreload,
            swfupload_loaded_handler: flashLoaded,
            file_dialog_start_handler: function () { },
            file_queued_handler: function (file) { fileQueued(page.swfu, file); },
            file_queue_error_handler: function (file, error, data) { fileQueueError(page.swfu, file, error, data); },
            file_dialog_complete_handler: function (selected, queued, total) { fileDialogComplete(page.swfu, selected, queued, total); },
            upload_start_handler: function (file) { uploadStart(page, file); },
            upload_progress_handler: uploadProgress,
            upload_success_handler: uploadSuccess,
            upload_complete_handler: function (file) { return uploadComplete(page, file); },
            upload_error_handler: uploadError,
            queue_complete_handler: function (filesUploaded) { queueComplete(page, filesUploaded); }
        });

        // Keep the underlying button and the flash sizes identical
        // Take off focus for cosmetic reasons
        $(".swfupload-btn").css({ "height": btnDim.height + "px", "width": btnDim.width + "px" }).focusout();

        $(".file-container").css({ "height": ($("#fileUploadDlg").innerHeight() - 50) + "px" });
    });

    page.dlg.dialog({
        title: "File Upload Dialog (File Size Limit: 4 MB)",
        autoOpen: false,
        modal: true,
        draggable: false,
        resizable: false,
        height: 300, width: 500,
        buttons: {
            "OK": function ()
            {
                //page.swfu.startUpload();
                var settings = { width: 800, height: 800, quality: 100, allowEnlargement: false };
                page.swfu.startResizedUpload(page.swfu.getFile(0).ID, settings.width, settings.height, SWFUpload.RESIZE_ENCODING.JPEG, settings.quality, settings.allowEnlargement);
            },
            "Cancel": function ()
            {
                if (page.swfu.destroy())
                {
                    $(".file-container").empty();
                    $("#swf-msg").empty();
                    // replace the deleted placeholder span
                    $(".dlg-content").prepend($('<span id="' + page.swfu_placeholder_id + '"></span>'));
                }
                page.dlg.dialog("close");
            }
        }
    });

});