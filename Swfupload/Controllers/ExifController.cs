using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using System.IO;
using System.Windows.Media;
using System.Windows.Media.Imaging;

using Swfupload.Models;

namespace Swfupload.Controllers
{
    public class ExifController : Controller
    {
        //
        // GET: /Exif/

        [RedirectFilter(Controller="Home", Action="About")]
        public ActionResult Index()
        {
            return View();
        }

        //
        // POST: /Exif/Read

        [HttpPost]
        public ActionResult Read(HttpPostedFileBase fileUpload)
        {
            FileUploadResult result = new FileUploadResult();
            result.FileName = fileUpload.FileName;

            BitmapMetadata sourceMetadata = null;
            BitmapCreateOptions createOptions = BitmapCreateOptions.PreservePixelFormat | BitmapCreateOptions.IgnoreColorProfile;

            using (Stream stream = fileUpload.InputStream)
            {
                BitmapDecoder sourceDecoder = BitmapDecoder.Create(stream, createOptions, BitmapCacheOption.None);
                if (sourceDecoder.Frames[0] != null && sourceDecoder.Frames[0].Metadata != null)
                {
                    sourceMetadata = sourceDecoder.Frames[0].Metadata.Clone() as BitmapMetadata;
                }
            }

            // due to the way file submission + AJAX works we cannot return a JSON object
            // instead we must return a json-like string
            // return Json(new { foo = "bar" });  // browsers don't quite handle this correctly
            return Content(result.ToJSON(), "text/html");
        }

    }
}
